import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, Button, Divider } from '@mui/material';
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
      main: '#6366f1', // Purple
      light: '#818cf8',
      dark: '#4338ca',
    },
    secondary: {
      main: '#a5b4fc', // Light purple
      light: '#c4b5fd',
      dark: '#818cf8',
    },
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
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
        {location !== '/dashboard' && (
          <Box sx={{ position: 'fixed', top: 24, left: 24, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              component={Link} 
              to="/login" 
              variant="text" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 600, 
                fontSize: 18, 
                textTransform: 'none', 
                '&:hover': { 
                  color: theme.palette.primary.dark, 
                  bgcolor: 'transparent' 
                } 
              }}
            >
              Login
            </Button>
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{ 
                borderColor: theme.palette.secondary.main, 
                mx: 0.5 
              }} 
            />
            <Button 
              component={Link} 
              to="/register" 
              variant="text" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 600, 
                fontSize: 18, 
                textTransform: 'none', 
                '&:hover': { 
                  color: theme.palette.primary.dark, 
                  bgcolor: 'transparent' 
                } 
              }}
            >
              Register
            </Button>
          </Box>
        )}
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
