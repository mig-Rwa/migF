import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel, FormLabel, LinearProgress, Fade, Divider } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const getBodyFatStatus = (bf: number) => {
  if (bf < 6) return { label: 'Essential', color: '#29b6f6' };
  if (bf < 14) return { label: 'Athletes', color: '#00bfae' };
  if (bf < 18) return { label: 'Fitness', color: '#66bb6a' };
  if (bf < 25) return { label: 'Average', color: '#ffa726' };
  return { label: 'Obese', color: '#ef5350' };
};

function calcBodyFat({ gender, height, neck, waist, hip }: { gender: string; height: number; neck: number; waist: number; hip?: number; }) {
  // U.S. Navy Method (metric)
  if (gender === 'male') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    // For females, hip is required
    if (!hip) return NaN;
    return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }
}

const BodyFatCalculator: React.FC = () => {
  const [form, setForm] = useState({ gender: 'male', age: '', weight: '', height: '', neck: '', waist: '', hip: '' });
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [leanMass, setLeanMass] = useState<number | null>(null);
  const [status, setStatus] = useState<{ label: string; color: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { gender, height, neck, waist, hip, weight } = form;
    const h = Number(height);
    const n = Number(neck);
    const w = Number(waist);
    const hp = gender === 'female' ? Number(hip) : undefined;
    const wt = Number(weight);
    if (!h || !n || !w || (gender === 'female' && !hp)) return;
    const bf = calcBodyFat({ gender, height: h, neck: n, waist: w, hip: hp });
    setBodyFat(bf);
    setStatus(getBodyFatStatus(bf));
    setLeanMass(wt - (wt * (bf / 100)));
    setShowResult(true);
    // Save to localStorage as a simple user profile integration
    if (localStorage.getItem('token')) {
      localStorage.setItem('lastBodyFat', JSON.stringify({ bf, lean: wt - (wt * (bf / 100)), date: new Date().toISOString() }));
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6, p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')} sx={{ fontWeight: 600 }}>
          Back to Home
        </Button>
      </Box>
      <Fade in={true} timeout={700}>
        <Card sx={{ borderRadius: 4, boxShadow: 4, bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FitnessCenterIcon color="primary" fontSize="large" />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Body Fat Calculator</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FormLabel>Gender</FormLabel>
              <RadioGroup row name="gender" value={form.gender} onChange={handleChange} sx={{ mb: 2 }}>
                <FormControlLabel value="male" control={<Radio color="primary" />} label="Male" />
                <FormControlLabel value="female" control={<Radio color="secondary" />} label="Female" />
              </RadioGroup>
              <TextField label="Age" name="age" type="number" value={form.age} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField label="Height (cm)" name="height" type="number" value={form.height} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField label="Neck (cm)" name="neck" type="number" value={form.neck} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField label="Waist (cm)" name="waist" type="number" value={form.waist} onChange={handleChange} required sx={{ mb: 2 }} />
              {form.gender === 'female' && (
                <TextField label="Hip (cm)" name="hip" type="number" value={form.hip} onChange={handleChange} required sx={{ mb: 2 }} />
              )}
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 700, mt: 1 }}>Calculate</Button>
            </form>
            {showResult && bodyFat && status && (
              <Fade in={showResult} timeout={600}>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: status.color, mb: 1 }}>
                    Body Fat = {bodyFat.toFixed(1)}% <EmojiEmotionsIcon sx={{ verticalAlign: 'middle', color: status.color }} />
                  </Typography>
                  <Typography variant="h6" sx={{ color: status.color, mb: 2 }}>{status.label}</Typography>
                  <LinearProgress variant="determinate" value={Math.min((bodyFat / 40) * 100, 100)} sx={{ height: 16, borderRadius: 8, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: status.color } }} />
                  <Typography sx={{ mt: 2, color: '#888' }}>
                    <b>Category:</b> {status.label}
                  </Typography>
                  <Typography sx={{ color: '#888' }}>
                    Healthy range: <b>6% - 25%</b> (varies by age/gender)
                  </Typography>
                  {leanMass !== null && (
                    <Typography sx={{ color: '#888', mt: 1 }}>
                      <b>Lean Body Mass:</b> {leanMass.toFixed(1)} kg
                    </Typography>
                  )}
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default BodyFatCalculator; 