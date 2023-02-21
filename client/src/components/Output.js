import axios from 'axios'
import React, {Component} from 'react'
import {Select, Button, Grid, InputLabel, TextareaAutosize, CircularProgress, Typography, Paper } from "@material-ui/core"
import {handleProblemSolve} from "./ProblemPage"


function encode(str) {
  return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
  var escaped = escape(atob(bytes || ""));
  try {
    return decodeURIComponent(escaped);
  } catch {
    return unescape(escaped);
  }
}

function arrayEquals(x, y) {
  return x.length === y.length
      && x.every((e, i) => e === y[i]);
}

class Output extends Component {

  constructor(props) {
    super(props);
    this.state = {curProblemId: this.props.curProblemId, language: 48, stdout: "", time: "", memory: 0, stderr: null, compile_output: "", showExecOut: false, inSubmit: false, isSubmitted: false, isPassed: this.props.inputs.map(() => false), submitOut: ""};
    this.handleExecute = this.handleExecute.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleExecute() {
    const url = "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true";
    const allParams = { source_code: encode(this.refs.code.value), language_id: this.state.language, stdin: encode(this.refs.stdin.value)};
    const options = { headers: {'Content-type':'application/json'} };
    axios.post(url, allParams, options).then((res) => {
      this.setState({ showExecOut: true,
                      stdout: decode(res.data.stdout), time: res.data.time,
                      memory: res.data.memory, stderr: decode(res.data.stderr),
                      compile_output: decode(res.data.compile_output) });
    });
  }

  changeLanguage(event) {
    const target = event.target;
    this.refs.language.value = target.innerHTML;
    this.setState({language: parseInt(target.value)});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.curProblemId !== prevProps.curProblemId) {
      this.setState({...this.state, curProblemId: this.props.curProblemId, inSubmit: false, isSubmitted: false, isPassed: this.props.inputs.map(() => false)})
    }
  }

  async handleSubmit() {
    this.setState({showExecOut :false, isPassed: this.props.inputs.map(() => false)});
    /* avoid submition when already in submitting*/
    if (this.state.inSubmit) {
      console.log("already in submit");
      return;
    }

    this.state.inSubmit = true;
    const inputs = this.props.inputs;
    const expectOutputs = this.props.outputs;

    this.setState({...this.state, isSubmitted: true})
    this.forceUpdate()

    for (let i = 0, failed = false; i < inputs.length && !failed; i++) {
      const url = "https://ce.judge0.com/submissions/?base64_encoded=true&wait=true";
      const allParams = { source_code: encode(this.refs.code.value), language_id: this.state.language, stdin: encode(inputs[i].reduce((x, y) => x + " " + y))};
      const options = { headers: {'Content-type':'application/json'} };

      await axios.post(url, allParams, options).then((res) => {
        var out;
        if(arrayEquals(expectOutputs[i].map(x => x.toString()), decode(res.data.stdout).trim().split(/\s+/))) {
          out = "test-" + i + " passed";
          let _isPassed = this.state.isPassed
          _isPassed[i] = true
          this.setState({submitOut: out, isPassed: _isPassed});
        } else {
          out = "test-" + i + " failed, input:" + inputs[i] + ", expected output: " + expectOutputs[i] + ", actual output: " + decode(res.data.stdout);
          this.setState({inSubmit: false, submitOut: out, isSubmitted: false, isPassed: this.props.inputs.map(() => false)});
          failed = true;
        }
      }).catch((err)=>{console.log(err); failed = true;});

      if (failed) return;
    }

    this.setState({inSubmit :false});
    const param =
      {
          id: this.props.curProblemId,
          unsolved: this.props.unsolved,
          playerInfo: this.props.playerInfo,
          setPlayerInfo: this.props.setPlayerInfo,
          problemSolveAlert: this.props.problemSolveAlert,
          scores: this.props.scores,
          showWinningScreen: this.props.showWinningScreen,
          socket: this.props.socket
      };
    handleProblemSolve(param);
  }


  render() {
    return (
      <div className='button__container'>

        <InputLabel id="label">source code: </InputLabel>
        <TextareaAutosize ref="code" id="code" class="form-control text" cols="100" rows="6">
        </TextareaAutosize>


        <InputLabel id="label">stdin: </InputLabel>
        <TextareaAutosize ref="stdin" id="stdin" class="form-control text" cols="100" rows="4">
        </TextareaAutosize>

        <Grid container>

        <Grid item xs={12} sm={2}>
        <Button size="large" variant="contained" color="primary" onClick={this.handleExecute}>
          Execute
        </Button>
        </Grid>

        <Grid item xs={12} sm={2}>
        <Button size="large" variant="contained" color="primary" onClick={this.handleSubmit}>
          Submit
        </Button>
        </Grid>

        <Grid item xs={12} sm={2}> 
        <Select labelId="label" id="select" value={this.state.language} ref="language" onChange={this.changeLanguage}>
          <option value="46">Bash</option>
          <option value="48">C</option>
          <option value="52">C++</option>
          <option value="62">Java</option>
          <option value="71">Python</option>
        </Select>
        </Grid>

        </Grid>

        {this.state.showExecOut?
        <Paper square elevation={0}>
           <Typography variant='h6'> <br></br> &nbsp; stdout: {this.state.stdout} </Typography>
           <Typography variant='h6'> &nbsp; time: {this.state.time} </Typography>
           <Typography variant='h6'> &nbsp; memory: {this.state.memory} </Typography>
           <Typography variant='h6'> &nbsp; stderr: {this.state.stderr} </Typography>
           <Typography variant='h6'> &nbsp; compile_output: {this.state.compile_output} </Typography>
        </Paper>
          :
          this.state.isSubmitted ?

            <>
              <Grid container className={this.props.classes.testContainer}>
                {this.props.inputs.map((_, id) => (
                  <Grid item xs={11}>
                    <Paper square elevation={1} className={this.state.isPassed[id] ? this.props.classes.testPaperSuccess : this.props.classes.testPaper}>
                      <Grid container className={this.props.classes.inTestContainer}>
                        <Grid item xs={10}>
                          <Typography variant='h6'>
                            &nbsp; Test {id + 1}
                          </Typography>
                        </Grid>
                        { !this.state.isPassed[id] ?
                          <Grid item xs={1}>
                            <CircularProgress/>
                          </Grid>
                          :
                          null
                        }
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

            </>
            :
            <Paper square elevation={0}>
              <Typography variant='h6'>
                <br></br> &nbsp; {this.state.submitOut}
              </Typography>
            </Paper>

        }



      </div>
    )
  }


}

export default Output
