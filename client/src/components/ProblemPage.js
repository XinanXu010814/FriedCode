import {Grid, Paper, Typography} from '@material-ui/core'
import {Alert, AlertTitle} from '@material-ui/lab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Problem from './Problem'
import Countdown from "react-countdown"
import {useState, useEffect} from "react"
import Output from "./Output"
import WinningScreen from "./WinningScreen"


const problems = [0, 1, 2]
const scores = [110, 150, 200]

const MAX_DATE = new Date(8640000000000000);
const MATCH_DURATION = 60 * 60 * 1000;

const useFetch = (setProblem) => {
  const [response, setResponse] = useState({
    matchStartTime: MAX_DATE,
    allProblems: []
  });

  useEffect(() => {
    const fetchMatch = async () => {
      const response = await fetch("/match", {
        method: "GET",
        headers: {token: localStorage.token}
      });
      const responseJson = await response.json();
      if (responseJson !== null) {
        setResponse(responseJson);
        if (responseJson.allProblems.length > 0) {
          setProblem(responseJson.allProblems[0]);
        }
      }
    }
    fetchMatch();
  }, [setProblem]);

  return response;
};

function updateSelfScore(playerInfo, setPlayerInfo, newScore, id, socket) {

  const solved = playerInfo.self.solved;
  solved.push(id);

  setPlayerInfo({
    self: {
      uid: playerInfo.self.uid,
      username: playerInfo.self.username,
      rating: playerInfo.self.rating,
      score: newScore,
      solved: solved
    },
    opponent: playerInfo.opponent
  });

  socket.emit("solve-problem", {id, newScore});
}

export function handleProblemSolve({id, unsolved, playerInfo, setPlayerInfo, problemSolveAlert, scores, showWinningScreen, socket}) {
    if (!unsolved[0][id]) {
      return
    }
    // document.getElementById(id).style.backgroundColor = unsolved[0][id] ? 'green' : 'white'
    let _unsolved = [...unsolved[0]]
    _unsolved[id] = false
    if (!_unsolved.reduce((b1, b2) => b1 || b2)) {
      showWinningScreen[1](true)
    }
    unsolved[1](_unsolved)
    // const _score = unsolved[0][id] ? score[0] + scores[id] : score[0] - scores[id]
    const newScore = playerInfo.self.score + scores[id];
    updateSelfScore(playerInfo, setPlayerInfo, newScore, id, socket);
    if (!problemSolveAlert[0][id]) {
      let _problemSolveAlert = [...problemSolveAlert[0]]
      _problemSolveAlert[id] = !_problemSolveAlert[id]
      problemSolveAlert[1](_problemSolveAlert)
    }
  }


export function ProblemPage({classes, pickTheme, setPickTheme, socket, startSocket, playerInfo, setPlayerInfo, matchEndInfo, position}) {
  const [problem, setProblem] = useState({
    title: "",
    description: [],
    input: [],
    output: [],
    tests: {input: [], output: [], examplein: [], exampleout: []}
  });
  const {matchStartTime, allProblems} = useFetch(setProblem);
  const matchEndTime = matchStartTime + MATCH_DURATION;

  if (matchStartTime !== MAX_DATE) {
    startSocket(false);
  }

  const matchFound = playerInfo.opponent !== undefined;

  const unsolved = useState(problems.map((problem, index) => !(matchFound && (playerInfo.self.solved.includes(index) || playerInfo.opponent.solved.includes(index)))))
  const showOutOfTimeAlert = useState(true)
  const problemSolveAlert = useState(problems.map(() => false))
  
  const showWinningScreen = useState(matchEndInfo !== null)
  const curProblemId = useState(0)
  const showScore = useState(false)

  function showAlert(showOutOfTimeAlert) {
    if (showOutOfTimeAlert[0]) {
      return (
        <Alert style={{position: 'fixed', width: 'auto', right: '10%', left: '10%', top: '20%'}} severity="warning">
          <AlertTitle> The competition is almost over! </AlertTitle>
          Only 5 minutes remaining!
        </Alert>
      )
    }
  }

  function showProblemSolveAlert({problemSolveAlert, id}) {
    if (problemSolveAlert[0][id]) {
      setTimeout(() => {
        let _problemSolveAlert = [...problemSolveAlert[0]]
        _problemSolveAlert[id] = false
        problemSolveAlert[1](_problemSolveAlert)
      }, 5000)
      return (
        <Alert style={{position: 'fixed', width: 'auto', right: '10%', left: '10%', top: '10%'}} severity="info">
          <AlertTitle> A problem has been solved! </AlertTitle>
          Problem <strong>{id}</strong> has been solved!
        </Alert>
      )
    }
  }

  function renderer({hours, minutes, seconds, completed, showOutOfTimeAlert}) {
    if (completed) {
      showWinningScreen[1](true)
      return <Typography variant='h3' color='secondary'> Time is up! </Typography>
    }
    if (hours === 0 && minutes < 5) {
      if (seconds < 10) {
        return (
          <Typography variant='h3' color='secondary'> {minutes}:0{seconds} </Typography>
        )
      }
      setTimeout(() => {
        showOutOfTimeAlert[1](false)
      }, 5000)
      return (
        <>
          {showAlert(showOutOfTimeAlert)}
          <Typography variant='h3' color='secondary'> {minutes}:{seconds} </Typography>
        </>
      )
    }
    if (seconds < 10) {
      return <Typography variant='h3'> {minutes}:0{seconds} </Typography>
    }
    return <Typography variant='h3'> {minutes}:{seconds} </Typography>
  }

  return (
    <div style={{backgroundColor: pickTheme ? '#303030' : '#fafafa'}}>
      <Grid container className={classes.problemGrid}>
        <Grid item xs={12} md={8} lg={8}>
          <Paper variant="outlined" square elevation={0} className={classes.mainPaper}>
            <div className={classes.problemSpec}>
              <Problem
                title={problem.title}
                classes={classes}
                description={problem.description}
                input={problem.input}
                output={problem.output}
                tests={problem.tests}
              />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2} lg={2} className={classes.lhs}>
          <Grid container>
            <Grid item xs={12}>
              <Paper className={classes.lhsPaper} variant="outlined" square elevation={0}>
                {matchStartTime !== MAX_DATE && <Typography variant='h3'>
                  <Countdown date={matchEndTime} daysInHour
                             renderer={(props) => renderer({...props, showOutOfTimeAlert})}/>
                </Typography>}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.lhsPaper} variant="outlined" square elevation={0}>
                <Typography variant='h3'> Scores: </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.lhsPaper} variant="outlined" square elevation={0}>
                {matchFound && <Typography variant='h3'> {playerInfo.self.score}  </Typography>}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.lhsPaper} variant="outlined" square elevation={0}>
                {matchFound && <Typography variant='h3' color="secondary"> {playerInfo.opponent.score} </Typography>}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={2} lg={2} className={classes.rhs}>
          <Grid container>
            {problems.map((id) => (
              <Grid item key={id} xs={4}>
                <Paper id={id} onClick={() => {setProblem(allProblems[id]);
                                               curProblemId[1](id);
                }}
                       variant="outlined" square
                       elevation={0} className={classes.problemScorePaper}
                       style={{backgroundColor: matchFound ? (playerInfo.self.solved.includes(id) ? 'green' : playerInfo.opponent.solved.includes(id) ? 'red' : null) : null}} >
                  <Typography variant='h4' style={{fontWeight: problem === allProblems[id] ? 'bold' : 'normal'}}> {(showScore[0])? scores[id] : "Q"+(id+1)} </Typography>
                  {showProblemSolveAlert({problemSolveAlert, id})}
                </Paper>
              </Grid>
            ))}
          </Grid>

          <FormControlLabel
             control={<Switch checked={showScore[0]} onChange={()=>showScore[1](!showScore[0])} name="showScore" color="primary"/>}
             label="Show Scores"
          />

          <Paper variant="outlined" square elevation={0}>
                <Typography variant='h6'>Current Problem: Q{curProblemId[0] + 1}</Typography>
          </Paper>
          

          {matchFound && <Grid item xs={12}>
            <Paper className={classes.rhsPaper} variant="outlined" square elevation={0}>
              <Grid container>
                <Grid item xs={5}>
                  <Paper square className={classes.opponentPaper}>
                    <img src={`/images/${playerInfo.self.uid}.png`} className={classes.profilePic} alt="L"/>
                    <Typography> Rating: {playerInfo.self.rating}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={2}>
                  <Paper square className={classes.opponentPaper}>
                    <Typography> vs </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={5}>
                  <Paper square className={classes.opponentPaper}>
                    <img src={`/images/${playerInfo.opponent.uid}.png`} className={classes.profilePic} alt="L"/>
                    <Typography> Rating: {playerInfo.opponent.rating}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>}
        </Grid>
        <Grid item xs={12} md={8} lg={8}>
          <Paper variant="outlined" square elevation={0} className={classes.submitArea}>
            <Typography variant='h3'> SUBMIT AREA </Typography>
            {showWinningScreen[0] && <WinningScreen matchEndInfo={matchEndInfo} classes={classes} playerInfo={playerInfo}/>}
            <Output classes={classes} inputs={problem.tests.input} outputs={problem.tests.output} playerInfo={playerInfo} setPlayerInfo={setPlayerInfo} unsolved={unsolved} problemSolveAlert={problemSolveAlert} scores={scores} showWinningScreen={showWinningScreen} curProblemId={curProblemId[0]} socket={socket}/>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default ProblemPage
