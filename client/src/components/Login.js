import React, {useState} from "react";
import {CssBaseline, Container, Box, Typography, TextField, Button, Link} from "@material-ui/core";
import {MuiThemeProvider} from "@material-ui/core/styles";

const Login = ({classes, theme, setAuth}) => {

  const [errors, setErrors] = useState([]);

  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });

  const {email, password} = inputs;

  const onChange = (e) => {
    setInputs({...inputs, [e.target.name] : e.target.value});
  };

  const onSubmitForm = async (e) => {
    // By default, submitting form refreshes page
    // Use e.preventDefault() to avoid this
    e.preventDefault();

    try {

      const body = {email, password};

      // POST request to user/login
      const response = await fetch("/user/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
      });

      // Await response, parse json
      const responseJson = await response.json();

      if (responseJson.token) {
        // Put token in localStorage
        localStorage.setItem("token", responseJson.token);

        // We are authenticated
        setAuth(true);

        // Go to home
        window.location.href='/';
        
      } else {
        setAuth(false);
        setErrors(responseJson.errors.map(error => error.msg));
      }

    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xs">
        <div className={classes.homePaper}>
          <Typography variant="h1" className={classes.heading}>
            Log In
          </Typography>
          <br />
          {errors.map((error, index) => (
            <Typography key={index} variant="body2" className={classes.error}>
            {`• ${error}`}
            </Typography>
          ))}
          <br />
          <form className={classes.form} noValidate onSubmit={onSubmitForm}>
            <TextField
              name="email"
              autoComplete="email"
              label="Email"
              variant="outlined"
              required
              autoFocus
              fullWidth
              className={classes.field}
              value={email}
              onChange={e => onChange(e)}
            />
            <TextField
              name="password"
              type="password"
              autoComplete="current-password"
              margin="normal"
              label="Password"
              variant="outlined"
              required
              fullWidth
              className={classes.field}
              value={password}
              onChange={e => onChange(e)}
            />
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              fullWidth
              className={classes.submit}
            >
              Log In
            </Button>
            <Box display="flex" flexDirection="row-reverse">
              <Link
                href="/register"
                variant="body2"
              >
                Don't have an account? Register
              </Link>
            </Box>
          </form>
        </div>
      </Container>
    </MuiThemeProvider>
  );
};

export default Login;