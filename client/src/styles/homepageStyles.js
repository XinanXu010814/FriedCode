import {makeStyles} from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  viewGrid: {
    paddingTop: theme.spacing(1.8),
    justifyContent: 'center',
    backgroundColor: ({pickTheme}) => pickTheme ? '#303030' : '#fafafa'
  },
  homePaper: {
    paddingTop: theme.spacing(1.8),
    height: 'auto',
    width: 'auto',
    marginLeft: theme.spacing(1.8),
    marginRight: theme.spacing(1.8),
    marginBottom: theme.spacing(1.8),
    display: 'flex',
    flexDirection: 'column',
  },
  articlePaper: {
    height: 'auto',
    marginLeft: theme.spacing(1.8),
    marginRight: theme.spacing(1.8),
    marginBottom: theme.spacing(1.8),
    width: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  rhsPaper: {
    height: 'auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1.8),
    justifyContent: 'center',
    alignItems: 'center'
  },
  homeRhs: {
    float: 'right',
    padding: theme.spacing(0, 2, 0, 0),
    position: 'sticky',
    height: 'auto',
    width: '100%',
    top: '80px',
    alignSelf: 'flex-start'
  },
  landing: {
    height: '100vh',
    width: '100%',
    justifyContent: 'center'
  },
  scoreButton: {
    backgroundColor: 'blue',
  },
  centered: {
    width: '100%',
    height: 'auto',
  },
  profilePic: {
    width: '80%',
    marginLeft: '10%',
    height: 'auto',
    borderRadius: '50%',
    objectFit: 'contain',
    flexShrink: '0'
  },
  landingButton: {
    padding: '10%',
    border: '7px solid',
    borderRadius: '80px'
  },
  landingButtonSmall: {
    padding: '5%',
    border: '6px solid'
  },
  landingButtonTextSmall: {
    fontSize: 88
  },
  landingLhs: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    overflow: 'hidden'
  },
  landingRhs: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  logo: {
    width: '50%',
    marginLeft: '27%',
    height: 'auto',
    display: "flex"
  },
  text: {
    color: ({pickTheme}) => pickTheme ? '#ffbc40' : '#FF8C00'
  },
  ranking: {
    width: '100%',
    textAlign: 'left',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  articleTitlePaper: {
    height: 'auto',
    width: 'auto',
    marginLeft: theme.spacing(1.8),
    marginRight: theme.spacing(1.8),
    marginBottom: theme.spacing(1.8),
    display: 'flex',
    flexDirection: 'column',
  },
  heading: {
    fontSize: 72,
    margin: theme.spacing(6, 0, 0)
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
  dialog: {
    padding: theme.spacing(2, 2)
  },
  dialogMargin: {
    margin: theme.spacing(2, 2)
  }
}), {index: 1})

export default useStyles
