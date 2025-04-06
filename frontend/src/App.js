import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Healing as HealingIcon,
  Chat as ChatIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HealthForm from './components/HealthForm';
import AIChat from './components/AIChat';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          zIndex: 1300
        }
      }
    }
  }
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasSubmittedHealth, setHasSubmittedHealth] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogin = (userId) => {
    setIsAuthenticated(true);
    setUserId(userId);
    setHasSubmittedHealth(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setHasSubmittedHealth(false);
  };

  const handleHealthFormSubmit = () => {
    setHasSubmittedHealth(true);
  };

  const handleChatClick = () => {
    setChatOpen(true);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Health Check', icon: <HealingIcon />, path: '/health' },
    { text: 'Chat Assistant', icon: <ChatIcon />, path: '/chat' }
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" noWrap>
          Elderly Care Assistant
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => isMobile && setDrawerOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider />
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {isAuthenticated && (
            <>
              <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ minHeight: 64 }}>
                  <IconButton
                    color="inherit"
                    edge="start"
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    sx={{ mr: 2 }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    Elderly Care Assistant
                  </Typography>
                  <IconButton color="inherit" onClick={handleChatClick}>
                    <ChatIcon />
                  </IconButton>
                  <IconButton color="inherit" onClick={handleLogout}>
                    <LogoutIcon />
                  </IconButton>
                </Toolbar>
              </AppBar>
              <Drawer
                variant={isMobile ? 'temporary' : 'permanent'}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                  width: 250,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                    width: 250,
                    boxSizing: 'border-box',
                  },
                }}
              >
                {drawer}
              </Drawer>
            </>
          )}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: isAuthenticated ? 8 : 0,
              ml: isAuthenticated && !isMobile ? '250px' : 0
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <Dashboard userId={userId} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/health"
                element={
                  isAuthenticated ? (
                    <HealthForm userId={userId} onSubmit={handleHealthFormSubmit} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/chat"
                element={
                  isAuthenticated ? (
                    <AIChat userId={userId} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;