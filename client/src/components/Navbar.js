import {useState} from 'react';
import {AppBar, Button, Link, Toolbar, Switch, Box, Typography, IconButton, Menu, MenuItem} from '@material-ui/core'
import AccountCircle from '@material-ui/icons/AccountCircle';

function NavButton({name, to}) {
  return (
    <Button color="inherit" component={Link} href={to}>
      {name}
    </Button>
  )
}

function Navbar({pickTheme, setPickTheme, position, isAuth, setAuth, username}) {

  const [anchorEl, setAnchorEl] = useState(null);

  function handleChange({pickTheme, setPickTheme}) {
    if (isAuth) {
      fetch("/user/set-theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token
      },
        body: JSON.stringify({prefers_dark_theme: !pickTheme})
      });
    }

    setPickTheme(!pickTheme)
  }

  const logout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    setAuth(false);
  }

  return (
    <AppBar color={pickTheme ? "primary" : "primary"} position={position}>
      <Toolbar>
        <NavButton name='Home' to='/'/>
        <NavButton name='Problemset' to='/problemset'/>
        <NavButton name='Contests' to='/contests'/>
        <Switch
          checked={pickTheme}
          onChange={() => handleChange({pickTheme, setPickTheme})}
          color="default"
          inputProps={{ 'aria-label': 'primary checkbox' }}
        />
        <Box display='flex' flexDirection='row-reverse' flexGrow={1} alignItems='center'>
          {username ? <>
            <IconButton color='inherit' onClick={(event) => setAnchorEl(event.currentTarget)} aria-controls='user-menu' aria-haspopup='true'>
              <AccountCircle />
            </IconButton>
            <Menu
              id='user-menu'
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                containerElement={<Link href='/login' />}
                onClick={(e) => {
                  setAnchorEl(null);
                  logout(e);
                  window.location.href='/';
                }}
              >
                Log out
              </MenuItem>
            </Menu>
            <Typography variant='button'>
              {username}
            </Typography>
          </> : <>
            <NavButton name='Register' to='/register' />
            <NavButton name='Log In' to='/login' />
          </>}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

