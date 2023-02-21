
// Time between matchmaking attempts (ms)
const MATCHMAKING_DELAY = 1000;

// Maximum difference in rating for which two players will be
// immediately matched
const MAX_RATING_DIFFERENCE = 50;

// When a match is not found, the increase in accepted rating difference
// between matched players, every second they remain in the queue
const RATING_INTERVAL_EXPANSION_PER_SEC = 20;

const TIME_WEIGHT = RATING_INTERVAL_EXPANSION_PER_SEC / 1000;


let queue = [];

let onMatch = (match) => {};

let interval;

function setOnMatch(func) {
  onMatch = func;
}

function joinQueue(player) {
  queue.push({
    player,
    timestamp: Date.now()
  });
}

function leaveQueue(player) {
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].player.uid === player.uid) {
      queue.splice(i, 1);
      return;
    }
  }
}

function start() {
  interval = setInterval(findMatches, MATCHMAKING_DELAY);
}

function findMatches() {
  const now = Date.now();

  let newQueue = [];

  while (queue.length > 1) {
    const player1 = queue.shift();

    let minDiffIndex = -1;
    let minDiff = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < queue.length; i++) {
      const player2 = queue[i];
      
      // Compute time weighted rating difference
      const diff = Math.abs(player1.player.rating - player2.player.rating)
                   - TIME_WEIGHT * Math.abs(now - Math.min(player1.timestamp, player2.timestamp));

      if (diff <= MAX_RATING_DIFFERENCE && diff < minDiff) {
        minDiffIndex = i;
        minDiff = diff;
      }
    }

    if (minDiffIndex !== -1) {
      // Match found
      onMatch(player1.player, queue[minDiffIndex].player);
      queue.splice(minDiffIndex, 1);
    } else {
      // No match found
      newQueue.push(player1);
    }
  }

  if (queue.length === 1) {
    newQueue.push(queue[0]);
  }

  queue = newQueue;
}

module.exports = {
  setOnMatch,
  joinQueue,
  leaveQueue,
  start
};