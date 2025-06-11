import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginUser } from '../services/authService';
import { Box, Card, CardContent, Typography, TextField, Button, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
      <Card sx={{ minWidth: 350, p: 3, borderRadius: 4, boxShadow: 6 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#6366f1', mb: 2 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Login
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ fontWeight: 600, borderRadius: 2, py: 1 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login; 