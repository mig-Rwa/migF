import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel, FormLabel, LinearProgress, Fade, Divider } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const getBMIStatus = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#29b6f6' };
  if (bmi < 25) return { label: 'Normal', color: '#66bb6a' };
  if (bmi < 30) return { label: 'Overweight', color: '#ffa726' };
  return { label: 'Obesity', color: '#ef5350' };
};

const BMICalculator: React.FC = () => {
  const [form, setForm] = useState({ age: '', gender: 'male', height: '', weight: '' });
  const [bmi, setBmi] = useState<number | null>(null);
  const [status, setStatus] = useState<{ label: string; color: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const heightM = Number(form.height) / 100;
    const weight = Number(form.weight);
    if (!heightM || !weight) return;
    const bmiValue = weight / (heightM * heightM);
    setBmi(bmiValue);
    setStatus(getBMIStatus(bmiValue));
    setShowResult(true);
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6, p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')} sx={{ fontWeight: 600 }}>
          Back to Home
        </Button>
      </Box>
      <Fade in={true} timeout={700}>
        <Card sx={{ borderRadius: 4, boxShadow: 4, bgcolor: '#f3e5f5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FitnessCenterIcon color="secondary" fontSize="large" />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>BMI Calculator</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextField label="Age" name="age" type="number" value={form.age} onChange={handleChange} required sx={{ mb: 2 }} />
              <FormLabel>Gender</FormLabel>
              <RadioGroup row name="gender" value={form.gender} onChange={handleChange} sx={{ mb: 2 }}>
                <FormControlLabel value="male" control={<Radio color="primary" />} label="Male" />
                <FormControlLabel value="female" control={<Radio color="secondary" />} label="Female" />
              </RadioGroup>
              <TextField label="Height (cm)" name="height" type="number" value={form.height} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} required sx={{ mb: 2 }} />
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 700, mt: 1 }}>Calculate</Button>
            </form>
            {showResult && bmi && status && (
              <Fade in={showResult} timeout={600}>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: status.color, mb: 1 }}>
                    BMI = {bmi.toFixed(1)} <EmojiEmotionsIcon sx={{ verticalAlign: 'middle', color: status.color }} />
                  </Typography>
                  <Typography variant="h6" sx={{ color: status.color, mb: 2 }}>{status.label}</Typography>
                  <LinearProgress variant="determinate" value={Math.min((bmi / 40) * 100, 100)} sx={{ height: 16, borderRadius: 8, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: status.color } }} />
                  <Typography sx={{ mt: 2, color: '#888' }}>
                    Healthy BMI range: <b>18.5 - 25</b> kg/m²
                  </Typography>
                  <Typography sx={{ color: '#888' }}>
                    Your weight is {status.label === 'Normal' ? 'in a healthy range!' : status.label.toLowerCase()}.
                  </Typography>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default BMICalculator; 