import {Dialog, DialogTitle, Container, Grid, Box, Button} from '@material-ui/core';
import {Typography} from '@material-ui/core';
import {useState} from "react";

function MatchmakingDialog({classes, open, setOpen, playerInfo, setPlayerInfo, socket, setSocket}) {

  const matchFound = playerInfo.opponent !== undefined;

  const cancel = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setPlayerInfo({
      self: playerInfo.self
    });
  };

  const [matchAccepted, setMatchAccepted] = useState(false);

  const onClickAccept = () => {
    setMatchAccepted(true);
    socket.emit("accept-match");
  };

  if (playerInfo.opponentConceded) {
    return (
      <Dialog open={open} onClose={cancel} fullWidth>
        <DialogTitle>
          Opponent Declined the Match
        </DialogTitle>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={() => {}} fullWidth>
      <Container display="flex" flexDirection="row-reverse" className={classes.dialog}>
        <DialogTitle>
          {matchFound ? "Match found!" : "Searching for opponent..."}
        </DialogTitle>
        <Grid container spacing={3} className={classes.dialog} alignItems="center">
          <Grid item xs={4}>
            <Typography variant="h4" align="center">{playerInfo.self.username}</Typography>
            <Typography variant="h6" align="center">{playerInfo.self.rating}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body1" align="center">vs</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h4" align="center">{matchFound ? playerInfo.opponent.username : "..."}</Typography>
            <Typography variant="h6" align="center">{matchFound ? playerInfo.opponent.rating : "..."}</Typography>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="center">
          {matchFound
          ? (matchAccepted ? <Typography variant="h6">Waiting for opponent...</Typography> :
          (<>
            <Button className={classes.dialogMargin} variant="outlined" color="primary" onClick={onClickAccept}>Accept Duel</Button>
            <Button className={classes.dialogMargin} variant="outlined" color="secondary" onClick={cancel}>Reject Duel</Button>
          </>))
          : <Button className={classes.dialogMargin} variant="outlined" color="default" onClick={cancel}>Cancel</Button>}
        </Box>
      </Container>
    </Dialog>
  );
}

export default MatchmakingDialog;