import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import {Grid, Box} from '@material-ui/core';
import fishtrophy from '../images/fishtrophy.png';
import deadfish from '../images/deadfish.png';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);


export default function WinningScreen({matchEndInfo, classes, playerInfo}) {

  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    window.location.href='/';
  };

  let title;
  let img = (<br />);
  
  if (matchEndInfo === null) {
    title = "Fetching Results..."
  } else {
    const myScore = matchEndInfo.scores.self;
    const oppScore = matchEndInfo.scores.opponent;

    title = (myScore > oppScore)? "Congratulations, You Win!"
              : ((myScore < oppScore)? "Better Luck Next Time" : "It's a Draw");
    img = (<img src={myScore > oppScore ? fishtrophy : deadfish} className={classes.winningScreenImage} alt=""/>);
  }

  return (
    <div>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} fullWidth>
        <DialogTitle id="title" onClose={handleClose}>
          {title}
        </DialogTitle>
        {matchEndInfo &&
        <DialogContent dividers>

          <Grid container spacing={3} className={classes.dialog} alignItems="center">
            <Grid item xs={4}>
              <Typography variant="h4" align="center">{playerInfo.self.username}</Typography>
              <Typography variant="h6" align="center">{matchEndInfo.scores.self}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body1" align="center">vs</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" align="center">{playerInfo.opponent.username}</Typography>
              <Typography variant="h6" align="center">{matchEndInfo.scores.opponent}</Typography>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="center">
            {img}
          </Box>

          <Box display="flex" justifyContent="center">
            <Typography gutterBottom variant="h6">
              Your new rating: {matchEndInfo.newRating} ({matchEndInfo.ratingDifference})
            </Typography>
          </Box>
        </DialogContent>
        }
      </Dialog>
    </div>
  );
}
