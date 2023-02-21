import {CssBaseline, MuiThemeProvider} from '@material-ui/core'
import useStyles from "./styles/homepageStyles"
import contestStyles from "./styles/problempageStyles"
import {useState, useEffect} from "react";
import {createMuiTheme} from '@material-ui/core/styles'
import ProblemPage from './components/ProblemPage'
import Register from './components/Register';
import Login from './components/Login';
import Homepage from "./components/Homepage";
import Navbar from "./components/Navbar";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import socketIOClient from "socket.io-client";

function App() {
  const [isAuth, setAuth] = useState(false);

  const [pickTheme, setPickTheme] = useState(true)
  const classes = useStyles({pickTheme})

  const darkTheme = createMuiTheme({
    palette: {
      primary: {
        main: '#ffbc40'
      },
      type: "dark"
    },
    shape: {
      borderRadius: '20px',
    }
  });
  const lightTheme = createMuiTheme({
    palette: {
      primary: {
        main: '#ffa500'
      },
      type: "light",
    },
    shape: {
      borderRadius: '20px',
    }
  });

  const theme = pickTheme ? {...darkTheme} : {...lightTheme};


  const [playerInfo, setPlayerInfo] = useState({
    self: {
      uid: null,
      username: null,
      rating: null,
      score: null,
      solved: null
    }
  });
  const username = playerInfo.self.username;

  const [matchEndInfo, setMatchEndInfo] = useState(null);

  const [socket, setSocket] = useState(null);

  const startSocket = (joinQueue) => {
    if (socket) {
      return;
    }
    const clientSocket = socketIOClient({
      reconnection: false,
      auth: {
        token: localStorage.token
      },
      query: {
        joinQueue: joinQueue
      }
    });

    clientSocket.on("start-game", data => {
      setPlayerInfo(data);
    });

    clientSocket.on("opponent-concede", () => {
      setPlayerInfo({
        self: playerInfo.self,
        opponentConceded: true
      });
    });

    clientSocket.on("both-parties-accepted", () => {
      window.location.href='/problemset';
    });
    
    clientSocket.on("resume-game", data => {
      setPlayerInfo(data);
    });

    clientSocket.on("opponent-update", data => {
      setPlayerInfo(data);
    });

    clientSocket.on("game-end", data => {
      console.log(data);
      setMatchEndInfo(data);
    });

    clientSocket.on("disconnect", () => {
      setSocket(null);
    })

    setSocket(clientSocket);
  };

  useEffect(() => {
    async function getUserInfo() {
      try {
        
        // GET request to user/info
        const response = await fetch("/user/info", {
          method: "GET",
          headers: {token: localStorage.token}
        });

        if (response.status !== 200) {
          return;
        }
  
        // Await response, parse json
        const responseJson = await response.json();
  
        // Set player info
        setPlayerInfo({
          self: {
            uid: responseJson.uid,
            username: responseJson.username,
            rating: responseJson.rating,
            score: 0,
            solved: []
          }
        });

        setPickTheme(responseJson.prefers_dark_theme);

        setAuth(true);
  
      } catch (error) {
        console.error(error.message);
      }
    };

    getUserInfo();
  }, []);

  return (
    <>
      <CssBaseline/>
      <MuiThemeProvider theme={theme}>
        <Navbar pickTheme={pickTheme} setPickTheme={setPickTheme} position={"sticky"} isAuth={isAuth} setAuth={setAuth} username={username} />
        <main>
          <Router>
            <Switch>
              <Route exact path="/" component={() =>
                <Homepage
                  pickTheme={pickTheme}
                  setPickTheme={setPickTheme}
                  startSocket={startSocket}
                  playerInfo={playerInfo}
                  setPlayerInfo={setPlayerInfo}
                  socket={socket}
                  setSocket={setSocket}
                  classes={classes}
                  position='fixed'
                />
              }/>
              <Route path='/problemset' component={() =>
                <ProblemPage
                  pickTheme={pickTheme}
                  setPickTheme={setPickTheme}
                  socket={socket}
                  startSocket={startSocket}
                  playerInfo={playerInfo}
                  setPlayerInfo={setPlayerInfo}
                  matchEndInfo={matchEndInfo}
                  classes={contestStyles()}
                  position='static'
                />
              }/>
              <Route exact path="/register" render={props =>
                <Register {...props}
                  classes={classes}
                  theme={theme}
                  setAuth={setAuth}
                />
              }/>
              <Route exact path="/login" render={props =>
                <Login {...props}
                  classes={classes}
                  theme={theme}
                  setAuth={setAuth}
                />
              }/>
            </Switch>
          </Router>
        </main>
      </MuiThemeProvider>
    </>
  )
}

export default App;
