import * as React from 'react';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
import "./AdminFullAppBar.css"

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GamepadIcon from '@mui/icons-material/Gamepad';

import { Link as RouterLink } from "react-router-dom";
import { Avatar } from '@mui/material';

function UserFullAppBar() {
  const signout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  function drawerList() {
    return (
      <List sx={{ width: "100%" }}>

        <ListItem button component={RouterLink} to="/">
          <PersonAddIcon />
          <ListItemText primary="Request Seller" sx={{ paddingLeft: 1 }} />
        </ListItem>

        <ListItem button component={RouterLink} to="/Game">
          <GamepadIcon />
          <ListItemText primary="Manage Game" sx={{ paddingLeft: 1 }} />
        </ListItem>

        <ListItem button component={RouterLink} to="/ManageAdmin">
          <AdminPanelSettingsIcon />
          <ListItemText primary="Manage Admin" sx={{ paddingLeft: 1 }} />
        </ListItem>

      </List>
    );
  }

  const [auth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
      <nav className='nav-appbar'>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon style={{color: "#FFF"}}/>
          </IconButton>

          <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>

            <SportsEsportsIcon color="primary" sx={{ fontSize: 150, margin: 1, padding: 2, color: "rgba(2, 245, 255, 1)" }}  />
            {/** List of Drawer Divided by position */}
            {drawerList()}

          </Drawer>

          <div className="logo"><a href="/">A<span>d</span>minEx<span>ch</span>ange</a></div>

          {auth && (                                                                               /* รูป Icon Profild */
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                  <Avatar alt="Remy Sharp" style={{boxShadow: "0px 0px 10px 5px #FFF01F"}} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={signout} component={RouterLink} to="/" >Logout</MenuItem>
              </Menu>
            </div>
          )}

        </Toolbar>
      </nav>
  );
}

export default UserFullAppBar;