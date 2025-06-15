import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FoodDiary from './pages/FoodDiary';
import BMICalculator from './pages/BMICalculator';
import BodyFatCalculator from './pages/BodyFatCalculator';
import CalorieEstimator from './pages/CalorieEstimator';
import './App.css';

// Create a light theme with purple accents
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FC4C02', // Strava Orange
      contrastText: '#fff',
    },
    secondary: {
      main: '#212529', // Slate/Dark Gray
      contrastText: '#fff',
    },
    background: {
      default: '#F5F5F5', // Light gray
      paper: '#fff',      // Card backgrounds
    },
    text: {
      primary: '#212529', // Almost black
      secondary: '#6c757d', // Muted gray
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(44,62,80,0.05)',
        },
      },
    },
  },
});

// Protected route component
const PrivateRoute = ({ children }: React.PropsWithChildren) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Login />;
  }
  return <>{children}</>;
};

function App() {
  const location = window.location.pathname;
  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/* Strava-Style Top Navigation Bar */}
        <AppBar position="fixed" color="inherit" elevation={2} sx={{ bgcolor: '#fff', color: '#18181b', boxShadow: 2, zIndex: 1201 }}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <img src="/vite.svg" alt="FitTrack Logo" style={{ height: 36 }} />
              <Typography variant="h6" sx={{ color: '#FC4C02', fontWeight: 700, letterSpacing: 1 }}>FitTrack</Typography>
            </Box>
            {/* Navigation Links */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                component={Link}
                to="/dashboard"
                sx={{ color: '#18181b', fontWeight: 600, px: 2, '&:hover': { color: '#FC4C02', bgcolor: 'transparent' } }}
              >
                Dashboard
              </Button>
              <Button
                sx={{ color: '#18181b', fontWeight: 600, px: 2, '&:hover': { color: '#FC4C02', bgcolor: 'transparent' } }}
              >
                Training
              </Button>
              <Button
                sx={{ color: '#18181b', fontWeight: 600, px: 2, '&:hover': { color: '#FC4C02', bgcolor: 'transparent' } }}
              >
                Maps
              </Button>
            </Box>
            {/* Profile Icon */}
            <Button sx={{ minWidth: 0, p: 0, ml: 2, borderRadius: '50%' }}>
              <Box sx={{ bgcolor: '#FC4C02', color: '#fff', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>M</Typography>
              </Box>
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ pt: 10 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/food-diary" element={<PrivateRoute><FoodDiary /></PrivateRoute>} />
          <Route path="/bmi" element={<PrivateRoute><BMICalculator /></PrivateRoute>} />
          <Route path="/body-fat" element={<PrivateRoute><BodyFatCalculator /></PrivateRoute>} />
          <Route path="/calorie-estimator" element={<PrivateRoute><CalorieEstimator /></PrivateRoute>} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
