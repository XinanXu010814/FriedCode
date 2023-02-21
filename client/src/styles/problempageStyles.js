import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  problemGrid: {
    paddingTop: theme.spacing(1.8),
    justifyContent: 'center',
    backgroundColor: 'none'
  },
  mainPaper: {
    paddingTop: theme.spacing(1.8),
    height: 'auto',
    width: 'auto',
    marginLeft: theme.spacing(1.8),
    marginRight: theme.spacing(1.8),
    marginBottom: theme.spacing(1.8),
    display: 'flex',
    flexDirection: 'column',
  },
  submitArea: {
    height: 'auto',
    minHeight: '800px',
    marginLeft: theme.spacing(1.8),
    marginRight: theme.spacing(1.8),
    marginBottom: theme.spacing(1.8),
    width: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  examplePaper: {
    '& > *': {
      margin: theme.spacing(0.3)
    },
    height: 'auto',
    padding: '0px',
    width: '100%',
    margin: theme.spacing(0, 0, 2),
    display: 'flex',
    flexDirection: 'column',
  },
  problemScorePaper: {
    height: '100px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center'
  },
  problemSpec: {
    marginLeft: theme.spacing(1.8),
    marginRight: theme.spacing(1.8),
    width: 'auto'
  },
  lhsPaper: {
    height: '100px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1.8),
    justifyContent: 'center',
    alignItems: 'center'
  },
  rhsPaper: {
    height: '120px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(1.8),
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  opponentPaper: {
    width: '100%',
    height: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'

  },
  rhs: {
    padding: theme.spacing(0, 2, 0, 0),
    position: 'fixed',
    height: 'auto',
    width: '100%',
    right: '0px'
  },
  profilePic: {
    width: '60%',
    height: 'auto',
    borderRadius: '50%',
    objectFit: 'contain',
    flexShrink: '0'
  },
  lhs: {
    padding: theme.spacing(0, 0, 0, 2),
    position: 'fixed',
    height: 'auto',
    width: '100%',
    left: '0px'
  },
  heading: {
    fontSize: 72,
    margin: theme.spacing(4, 0, 0)
  },
  form: {
    width: '100%'
  },
  field: {
    margin: theme.spacing(1.5, 0)
  },
  submit: {
    margin: theme.spacing(3, 0, 1.5)
  },
  error: {
    margin: theme.spacing(0, 0),
    color: 'red'
  },
  testContainer: {
    paddingTop: theme.spacing(1.8),
    justifyContent: 'flex',
    backgroundColor: 'none',
    overflow: 'hidden',
  },
  inTestContainer: {
    justifyContent: 'flex',
    overflow: 'hidden',
    backgroundColor: 'none'
  },
  testPaperSuccess: {
    width: '100%',
    display: 'flex',
    backgroundColor: 'green',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    overflow: 'hidden',
    height: 'auto'
  },
  testPaper: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    overflow: 'hidden',
    height: 'auto'
  },
  winningScreenText: {
    fontSize: 24
  },
  winningScreenImage: {
    maxWidth: 300
  }
}), {index: 1})

export default useStyles
