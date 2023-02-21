const path = require("path");
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const http = require("http");
const socketio = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const matchmaker = require("./matchmaker");
const authorization = require("./middleware/authorization");
const elo = require("elo-rating");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*'
  }
});

app.use(express.json());
app.use(cors());

// Serve production build
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Serve images
app.use('/images', express.static(__dirname + '/images'));


// User routes
app.use("/user", require("./routes/user"));

// Leaderboard route
app.get("/leaderboard", async (req, res) => {
  try {

    const result = await pool.query(
      "SELECT uid, username, rating FROM users ORDER BY rating DESC LIMIT 10"
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error.message);
  }
});


app.get("/problem", async (req, res) => {
  try {

    const result = await pool.query("SELECT * FROM problems LIMIT 1");
    const problem = result.rows[0];
    const formattedProblem = {
      title: problem.title,
      description: problem.description.split(/\n/),
      input: problem.input.split(/\n/),
      output: problem.output.split(/\n/)
    }
    res.json(formattedProblem);

  } catch (error) {
    console.error(error.message);
  }
});


// Matchmaking setup
const MATCH_DURATION = 60* 60 * 1000;
let matches = {};

const onMatch = async (player1, player2) => {
  const match = {
    gameState: 0,
    player1,
    player2
  };

  console.log(player1.username);
  console.log(player2.username);

  // Add to matches dictionary
  matches[player1.uid] = match;
  matches[player2.uid] = match;

  // Inform clients of match
  player1.socket.emit("start-game", {
    self: {
      uid: player1.uid,
      username: player1.username,
      rating: player1.rating,
      score: player1.score,
      solved: player1.solved
    },
    opponent: {
      uid: player2.uid,
      username: player2.username,
      rating: player2.rating,
      score: player2.score,
      solved: player2.solved
    }
  });
  player2.socket.emit("start-game", {
    self: {
      uid: player2.uid,
      username: player2.username,
      rating: player2.rating,
      score: player2.score,
      solved: player2.solved
    },
    opponent: {
      uid: player1.uid,
      username: player1.username,
      rating: player1.rating,
      score: player1.score,
      solved: player1.solved
    }
  })
};

const endMatch = (uid) => {

  const formatRatingDifference = (newRating, oldRating) => {
    const difference = newRating - oldRating;
    if (difference > 0) {
      return `+${difference}`;
    }
    return difference;
  };

  const match = matches[uid];

  if (match.player1.score === match.player2.score) {
    // Draw
    match.player1.socket.emit("game-end", {
      newRating: match.player1.rating,
      ratingDifference: "No difference",
      scores: {
        self: match.player1.score,
        opponent: match.player2.score
      }
    });
    match.player2.socket.emit("game-end", {
      newRating: match.player2.rating,
      ratingDifference: "No difference",
      scores: {
        self: match.player2.score,
        opponent: match.player1.score
      }
    });

  } else {
    // Win/lose
    const player1Wins = match.player1.score > match.player2.score;
    const newRatings = elo.calculate(match.player1.rating, match.player2.rating, player1Wins, 60);

    match.player1.socket.emit("game-end", {
      newRating: newRatings.playerRating,
      ratingDifference: formatRatingDifference(newRatings.playerRating, match.player1.rating),
      scores: {
        self: match.player1.score,
        opponent: match.player2.score
      }
    });
    match.player2.socket.emit("game-end", {
      newRating: newRatings.opponentRating,
      ratingDifference: formatRatingDifference(newRatings.opponentRating, match.player2.rating),
      scores: {
        self: match.player2.score,
        opponent: match.player1.score
      }
    });

    pool.query("UPDATE users SET rating = $1 WHERE uid = $2 RETURNING *", [newRatings.playerRating, match.player1.uid]);
    pool.query("UPDATE users SET rating = $1 WHERE uid = $2 RETURNING *", [newRatings.opponentRating, match.player2.uid]);
  }

  // Delete match
  delete matches[match.player1.uid];
  delete matches[match.player2.uid];
  console.log("Match ended");
};

matchmaker.setOnMatch(onMatch);
matchmaker.start();

// Handle client socket connection
io.on("connection", async (socket) => {
  console.log("\nNew client");
  try {
    const payload = jwt.verify(socket.handshake.auth.token, "${process.env.JWT_SECRET}");

    let player;

    // Check if user is in a match
    const match = matches[payload.uid];
    if (match && match.gameState >= 2) {
      console.log("User in match, resuming");
      player = match.player1.uid === payload.uid ? match.player1 : match.player2;
      player.socket = socket;

      opponentPlayer = match.player1.uid === payload.uid ? match.player2 : match.player1;

      socket.emit("resume-game", {
        self: {
          uid: player.uid,
          username: player.username,
          rating: player.rating,
          score: player.score,
          solved: player.solved
        },
        opponent: {
          uid: opponentPlayer.uid,
          username: opponentPlayer.username,
          rating: opponentPlayer.rating,
          score: opponentPlayer.score,
          solved: opponentPlayer.solved
        }
      });

    } else {
      console.log("User not in match");
      const user = await pool.query(
        "SELECT username, rating FROM users WHERE uid = $1",
        [payload.uid]
      );

      player = {
        uid: payload.uid,
        username: user.rows[0].username,
        rating: user.rows[0].rating,
        socket: socket,
        score: 0,
        solved: []
      };
    }

    socket.on("disconnect", () => {
      console.log(`Player ${player.uid}: ${player.username} disconnected`);
      matchmaker.leaveQueue(player);

      const match = matches[payload.uid];
      if (match) {

        // Disconnect before both players accept
        if (match.gameState < 2) {
          // Disconnecting player concedes, terminate match
          opponentPlayer = match.player1.uid === payload.uid ? match.player2 : match.player1;
          opponentPlayer.socket.emit("opponent-concede");
          delete matches[opponentPlayer.uid];
          delete matches[payload.uid];
          console.log("Match cancelled");
        }
        
      }
    });

    socket.on("accept-match", async () => {
      const match = matches[payload.uid];
      if (!match) {
        console.error("accept-match on nonexistent match");
        return;
      }
      opponentPlayer = match.player1.uid === payload.uid ? match.player2 : match.player1;
      if (match.gameState++ === 0) {
        // We are first to accept
      } else {
        // We are last to accept

        // Select problems
        const problems = await pool.query(
          "SELECT * FROM problemsv2 ORDER BY random() LIMIT 3"
        );
        match.allProblems = problems.rows.map(problem => {
          return {
            title: problem.title,
            description: problem.description.split(/\n/),
            input: problem.input.split(/\n/),
            output: problem.output.split(/\n/),
            tests: problem.tests
          };
        });

        // Set match start time
        match.startTime = Date.now();

        // Inform both players the match is underway
        socket.emit("both-parties-accepted");
        opponentPlayer.socket.emit("both-parties-accepted");

        match.timeout = setTimeout(() => endMatch(payload.uid), MATCH_DURATION);
      }

    });

    socket.on("solve-problem", (data) => {
      const {id, newScore} = data;
      const match = matches[payload.uid];

      player.score = newScore;
      player.solved.push(id);

      opponentPlayer = match.player1.uid === payload.uid ? match.player2 : match.player1;
      opponentPlayer.socket.emit("opponent-update", {
        self: {
          uid: opponentPlayer.uid,
          username: opponentPlayer.username,
          rating: opponentPlayer.rating,
          score: opponentPlayer.score,
          solved: opponentPlayer.solved
        },
        opponent: {
          uid: player.uid,
          username: player.username,
          rating: player.rating,
          score: player.score,
          solved: player.solved
        }
      });
    });

    if (socket.handshake.query.joinQueue === "true") {
      console.log("Queueing");
      matchmaker.joinQueue(player);
    }

  } catch (error) {
    console.error(error.message);
  }
});

// const allProblems =
//   [{title: "Sum of Two",
//     description: ["Find the sum of two numbers."],
//     input: ["\"A B\" where A and B are integers."],
//     output: ["\"C\" where C is the sum of A and B."],
//     tests: {input: ["1 1", "1 0", "2 -2", "-1 0", "-1 -1"],
//             output:["2", "1", "0", "-1", "-2"],
//             examplein: ["1 2", "10 -10"],
//             exampleout: ["3", "0"]}
//    },

//    {title: "Difference of Two",
//     description: ["Find the difference of two numbers."],
//     input: ["\"A B\" where A and B are integers."],
//     output: ["\"C\" where C is the difference of A and B."],
//     tests: {input: ["1 1", "1 0", "2 -2", "-1 0", "-1 -1"],
//             output:["0", "1", "4", "-1", "0"],
//             examplein: ["1 2", "10 -10"],
//             exampleout: ["-1", "20"]}
//    },

//    {title: "Product of Two",
//     description: ["Find the product of two numbers."],
//     input: ["\"A B\" where A and B are integers."],
//     output: ["\"C\" where C is the product of A and B."],
//     tests: {input: ["1 1", "1 0", "2 -2", "-1 0", "-1 -1"],
//             output:["1", "0", "-4", "0", "1"],
//             examplein: ["1 2", "10 -10"],
//             exampleout: ["2", "-100"]}
//    },
   
//   ]

// Current match info route
app.get("/match", authorization, (req, res) => {
  const match = matches[req.uid];

  res.json(match && match.gameState >= 2
    ? {
      matchStartTime: match.startTime,
      allProblems: match.allProblems
    }
    : null);
});

app.post("/timeskip", (req, res) => {
  const DELAY = 1000;

  console.log("Time skipping");
  for (var key in matches) {
    if (matches.hasOwnProperty(key)) {
      const match = matches[key];
      match.startTime = Date.now() - MATCH_DURATION + DELAY;
      clearTimeout(match.timeout);
      match.timeout = setTimeout(() => endMatch(match.player1.uid), DELAY);
    }
  }
  res.json({
    success: "true"
  });
});

app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
