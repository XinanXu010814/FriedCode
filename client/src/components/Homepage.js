import {Grid, Paper, Typography} from '@material-ui/core'
import cod from '../images/cod.png'
import Button from '@material-ui/core/Button'
import Particles from 'react-particles-js'
import MatchmakingDialog from "./MatchmakingDialog"
import {useState, useEffect} from "react";

export function Homepage({classes, pickTheme, setPickTheme, position, startSocket, playerInfo, setPlayerInfo, socket, setSocket}) {
  const [matchmakingDialogOpen, setMatchmakingDialogOpen] = useState(socket !== null);

  const [leaderboard, setLeaderboard] = useState([]);

  const [existingMatch, setExistingMatch] = useState(null);

  useEffect(() => {
    async function getLeaderboard() {
      try {
        // GET request to leaderboard
        const response = await fetch("/leaderboard", {
          METHOD: "GET"
        });

        // Await response, parse json
        const responseJson = await response.json();

        setLeaderboard(responseJson);

      } catch (error) {
        console.error(error.message);
      }
    }

    async function getMatch() {
      const response = await fetch("/match", {
        method: "GET",
        headers: {token: localStorage.token}
      });
      const responseJson = await response.json();
      setExistingMatch(responseJson);
    }

    getLeaderboard();
    getMatch();
  }, []);

  const onClickCompete = () => {
    setMatchmakingDialogOpen(true);
    startSocket(true);
    // history.push('/problemset');
  };

  return (
    <>
      <div style={{
        width: '100%',
        height: '100vh',
        backgroundColor: pickTheme ? '#303030' : '#fafafa',
        overflow: 'hidden'
      }}>
        <Particles
          params={{
            "particles": {
              "number": {
                "value": 200,
                "density": {
                  "enable": false
                }
              },
              "size": {
                "value": 10,
                "random": true,
                "anim": {
                  "speed": 4,
                  "size_min": 3
                }
              },
              "color": {
                "value": pickTheme ? '#FF8C00' : '#FFA500'
              },
              "line_linked": {
                "enable": false
              },
              "move": {
                "random": true,
                "speed": 2,
                "direction": "top",
                "out_mode": "out"
              }
            },
          }}/>
        <Grid container style={{position: 'absolute', left: '0px', top: '0px', background: 'none'}}>
          <Grid container className={classes.landing}>
            <Grid item md={3} className={classes.landingLhs}>
              {playerInfo.self.uid && <img src={`/images/${playerInfo.self.uid}.png`} className={classes.profilePic} alt=""/>}
            </Grid>
            <Grid item md={5} className={classes.landingRhs}>
              <Grid container className={classes.centered}>
                <Grid item md={12}>
                  <img src={cod} className={classes.logo} alt="cod"/>
                </Grid>
                <Grid item md={12}>
                  {playerInfo.self.rating
                  ? (existingMatch
                    ? <Button variant="outlined" color="primary" className={classes.landingButtonSmall}
                          href="/problemset">
                        <Typography variant='h1' className={classes.landingButtonTextSmall}> Back to Match </Typography>
                      </Button>
                    : <Button variant="outlined" color="primary" className={classes.landingButton}
                          onClick={onClickCompete}>
                        <Typography variant='h1'> Compete </Typography>
                      </Button>
                    )
                  : <Button variant="outlined" color="primary" className={classes.landingButton}
                          href="/login">
                      <Typography variant='h1'> Log In </Typography>
                    </Button> 
                  }
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={3} className={classes.landingRhs}>
              <Grid container>
                <Grid item md={12}>
                  {playerInfo.self.rating && <Typography variant='h1' gutterBottom className={classes.text}> Your Rating </Typography>}
                </Grid>
                <Grid item md={12}>
                  {playerInfo.self.rating && <Typography variant='h1' className={classes.text}> {playerInfo.self.rating} </Typography>}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>

      <Grid container className={classes.viewGrid}>
        <Grid item xs={12} md={8} lg={8}>
          <Grid container>
            <Grid md={12} item>
              <Paper square elevation={1} className={classes.homePaper}>
                <Paper square elevation={1} className={classes.articleTitlePaper}>
                  <Typography variant="h4"> Tutorial - Difference Array </Typography>
                </Paper>
                <Paper square elevation={1} className={classes.articlePaper}>
                  <Typography variant='h6'>
                    Consider an array A[] of integers and following two types of queries.
                  </Typography>
                  <Typography variant='h6'>
                    > update(l, r, x) : Adds x to all values from A[l] to A[r] (both inclusive).
                  </Typography>
                  <Typography paragraph variant='h6'>
                    > printArray() : Prints the current modified array.
                  </Typography>
                  <Typography variant='h6'>
                    A simple solution is to do following :
                  </Typography>
                  <Typography variant='h6'>
                    > update(l, r, x) : Run a loop from l to r and add x to all elements from A[l] to A[r]
                  </Typography>
                  <Typography paragraph variant='h6'>
                    > printArray() : Simply print A[].
                  </Typography>
                  <Typography paragraph variant='h6'>
                    Time complexities of both of the above operations is O(n)
                  </Typography>
                  <Typography variant='h6'>
                    An efficient solution is to use difference array.
                  </Typography>
                  <Typography paragraph variant='h6'>
                    Difference array D[i] of a given array A[i] is defined as D[i] = A[i]-A[i-1] (for i from 0 to n) and D[0] = A[0] considering 0 based indexing.
                    Difference array can be used to perform range update queries “l r x” where l is left index, r is right index and x is value to be added and after all queries you can return original array from it. Where update range operations can be performed in O(1) complexity.
                  </Typography>
                </Paper>
              </Paper>
            </Grid>
            <Grid md={12} item>
              <Paper square elevation={1} className={classes.homePaper}>
                <Paper square elevation={1} className={classes.articleTitlePaper}>
                  <Typography variant="h4"> Bitset </Typography>
                </Paper>
                <Paper square elevation={1} className={classes.articlePaper}>
                  <Typography paragraph variant='h6'>
                    A bitset is an array of bool but each Boolean value is not stored separately instead bitset optimizes the space such that each bool takes 1 bit space only, so space taken by bitset bs is less than that of bool bs[N] and vector bs(N). However, a limitation of bitset is, N must be known at compile time, i.e., a constant (this limitation is not there with vector and dynamic array)

                  </Typography>
                  <Typography paragraph variant='h6'>
                    As bitset stores the same information in compressed manner the operation on bitset are faster than that of array and vector. We can access each bit of bitset individually with help of array indexing operator [] that is bs[3] shows bit at index 3 of bitset bs just like a simple array. Remember bitset starts its indexing backward that is for 10110, 0 are at 0th and 3rd indices whereas 1 are at 1st 2nd and 4th indices.
                  </Typography>
                  <Typography paragraph variant='h6'>
                    We can construct a bitset using integer number as well as binary string via constructors which is shown in below code. The size of bitset is fixed at compile time that is, it can’t be changed at runtime.
                  </Typography>
                </Paper>
              </Paper>
            </Grid>
            <Grid md={12} item>
              <Paper square elevation={1} className={classes.homePaper}>
                <Paper square elevation={1} className={classes.articleTitlePaper}>
                  <Typography variant="h4"> Complexities - Simple Example </Typography>
                </Paper>
                <Paper square elevation={1} className={classes.articlePaper}>
                  <Typography paragraph variant='h6'>
                    A lot of students get confused while understanding the concept of time-complexity, but in this article, we will explain it with a very simple example:
                  </Typography>
                  <Typography paragraph variant='h6'>
                    Imagine a classroom of 100 students in which you gave your pen to one person. Now, you want that pen. Here are some ways to find the pen and what the O order is.
                  </Typography>
                  <Typography paragraph variant='h6'>
                  O(n^2): You go and ask the first person of the class, if he has the pen. Also, you ask this person about other 99 people in the classroom if they have that pen and so on,
                  </Typography>
                  <Typography paragraph variant='h6'>
                    This is what we call O(n^2).
                  </Typography>
                  <Typography paragraph variant='h6'>
                    O(n): Going and asking each student individually is O(N).
                  </Typography>
                  <Typography paragraph variant='h6'>
                  O(log n): Now I divide the class into two groups, then ask: “Is it on the left side, or the right side of the classroom?” Then I take that group and divide it into two and ask again, and so on. Repeat the process till you are left with one student who has your pen. This is what you mean by O(log n).
                  </Typography>
                  <Typography paragraph variant='h6'>
                  I might need to do the O(n2) search if only one student knows on which student the pen is hidden. I’d use the O(n) if one student had the pen and only they knew it. I’d use the O(log n) search if all the students knew, but would only tell me if I guessed the right side.
                  </Typography>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={2} lg={2} className={classes.homeRhs}>
          <Grid container>
            <Grid item xs={12}>
              <Paper className={classes.rhsPaper} square elevation={1}>
                <Typography variant='h4'>
                  Top rated
                </Typography>
                {leaderboard.map(user =>
                  <Paper id={user.uid} square className={classes.ranking}>
                    <Grid container>
                      <Grid item md={6}>
                        <Typography variant='h6'> {user.username} </Typography>
                      </Grid>
                      <Grid item md={6}>
                        <Typography variant='h6' style={{float: 'right'}}> {user.rating} </Typography>
                      </Grid>
                    </Grid>
                  </Paper>)}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

      </Grid>

      <MatchmakingDialog classes={classes} open={matchmakingDialogOpen} setOpen={setMatchmakingDialogOpen} playerInfo={playerInfo} setPlayerInfo={setPlayerInfo} socket={socket} setSocket={setSocket} />
    </>

  )
}

export default Homepage
