import React, { useState, useEffect } from 'react';
import { addFoodEntry, getFoodEntries, updateFoodEntry, deleteFoodEntry } from '../services/foodService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Box, Button, TextField, IconButton, Paper, Chip, Fade, Divider, InputAdornment } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import { motion, AnimatePresence } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const mealColors: Record<string, string> = {
  Breakfast: '#ffe082',
  Lunch: '#b2dfdb',
  Dinner: '#b39ddb',
  Snack: '#ffccbc',
};
const foodEmojis = ['🍎', '🍔', '🥗', '🍕', '🍣', '🍩', '🍪', '🍉', '🍟', '🍗', '🥑', '🍞', '🍦', '🍇', '🍌'];
const funQuotes = [
  "Eat good, feel good!",
  "You are what you eat!",
  "Healthy food, happy mood!",
  "Every meal is a chance to nourish!",
  "Calories don't count on weekends... just kidding!"
];

const FoodDiary: React.FC = () => {
  const [token] = useState(localStorage.getItem('token'));
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<any[]>([]);
  const [form, setForm] = useState({
    food: '', calories: '', protein: '', carbs: '', fat: '', meal_type: '', portion: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [weekData, setWeekData] = useState<any[]>([]);
  const randomEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
  const randomQuote = funQuotes[Math.floor(Math.random() * funQuotes.length)];
  const navigate = useNavigate();

  useEffect(() => {
    if (token) fetchEntries();
    // eslint-disable-next-line
  }, [date]);

  useEffect(() => {
    // Fetch entries for the past 7 days for analytics
    const fetchWeek = async () => {
      if (!token) return;
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().slice(0, 10);
      }).reverse();
      const promises = days.map(day => getFoodEntries(token, day));
      const results = await Promise.all(promises);
      setWeekData(days.map((day, i) => ({
        date: day,
        calories: results[i].data.reduce((acc: number, cur: any) => acc + (Number(cur.calories) || 0), 0)
      })));
    };
    fetchWeek();
    // eslint-disable-next-line
  }, [token, date]);

  const fetchEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getFoodEntries(token!, date);
      setEntries(res.data || []);
    } catch (e) {
      setError('Failed to fetch entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addFoodEntry(token!, { ...form, date });
      setForm({ food: '', calories: '', protein: '', carbs: '', fat: '', meal_type: '', portion: '' });
      fetchEntries();
    } catch (e) {
      setError('Failed to add entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: any) => {
    setEditForm({ ...entry });
    setEditModalOpen(true);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateFoodEntry(token!, editForm.id, editForm);
      setEditModalOpen(false);
      setEditForm(null);
      fetchEntries();
    } catch (e) {
      setError('Failed to update entry.');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this entry?')) return;o
    setLoading(true);
    setError('');
    try {
      await deleteFoodEntry(token!, id);
      fetchEntries();
    } catch (e) {
      setError('Failed to delete entry.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily totals
  const totals = entries.reduce((acc, cur) => {
    acc.calories += Number(cur.calories) || 0;
    acc.protein += Number(cur.protein) || 0;
    acc.carbs += Number(cur.carbs) || 0;
    acc.fat += Number(cur.fat) || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')} sx={{ fontWeight: 600 }}>
          Back to Home
        </Button>
      </Box>
      <Fade in={true} timeout={800}>
        <Card component={motion.div} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }} sx={{ mb: 4, borderRadius: 4, boxShadow: 4, bgcolor: '#fffbe7' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{randomEmoji} Food Diary</Typography>
              <Chip icon={<EmojiFoodBeverageIcon />} label={randomQuote} color="secondary" variant="outlined" sx={{ fontWeight: 600, fontSize: 16 }} />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField name="food" label="Food" value={form.food} onChange={handleChange} required sx={{ flex: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><FastfoodIcon /></InputAdornment> }} />
              <TextField name="calories" label="Calories" type="number" value={form.calories} onChange={handleChange} sx={{ width: 110 }} />
              <TextField name="protein" label="Protein (g)" type="number" value={form.protein} onChange={handleChange} sx={{ width: 110 }} />
              <TextField name="carbs" label="Carbs (g)" type="number" value={form.carbs} onChange={handleChange} sx={{ width: 110 }} />
              <TextField name="fat" label="Fat (g)" type="number" value={form.fat} onChange={handleChange} sx={{ width: 110 }} />
              <TextField name="meal_type" label="Meal Type" value={form.meal_type} onChange={handleChange} sx={{ width: 130 }} />
              <TextField name="portion" label="Portion" value={form.portion} onChange={handleChange} sx={{ width: 130 }} />
              <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ height: 56, fontWeight: 700 }}>Add</Button>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField type="date" label="Date" value={date} onChange={e => setDate(e.target.value)} sx={{ width: 180 }} InputLabelProps={{ shrink: true }} />
            </Box>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Entries for {date}</Typography>
            <Paper elevation={2} sx={{ mb: 2, borderRadius: 3, overflow: 'hidden' }}>
              <AnimatePresence>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
                  <thead>
                    <tr style={{ background: '#f3e5f5' }}>
                      <th style={{ padding: 8 }}>Food</th>
                      <th>Calories</th>
                      <th>Protein</th>
                      <th>Carbs</th>
                      <th>Fat</th>
                      <th>Meal</th>
                      <th>Portion</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 16, color: '#aaa' }}>No entries yet!</td></tr>
                    )}
                    {entries.map(entry => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        style={{ background: mealColors[entry.meal_type] || '#fff' }}
                      >
                        <td style={{ fontWeight: 600 }}>{entry.food}</td>
                        <td>{entry.calories}</td>
                        <td>{entry.protein}</td>
                        <td>{entry.carbs}</td>
                        <td>{entry.fat}</td>
                        <td>
                          {entry.meal_type && <Chip label={entry.meal_type} size="small" sx={{ bgcolor: mealColors[entry.meal_type] || '#e0e7ff', fontWeight: 600 }} />}
                        </td>
                        <td>{entry.portion}</td>
                        <td>
                          <IconButton color="primary" onClick={() => handleEdit(entry)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(entry.id)}><DeleteIcon /></IconButton>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </AnimatePresence>
            </Paper>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', mb: 2 }}>
              <Fade in={true} timeout={600}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3, bgcolor: '#e0f7fa', minWidth: 180 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00838f' }}>Daily Totals</Typography>
                  <Typography>Calories: <b>{totals.calories}</b></Typography>
                  <Typography>Protein: <b>{totals.protein}g</b></Typography>
                  <Typography>Carbs: <b>{totals.carbs}g</b></Typography>
                  <Typography>Fat: <b>{totals.fat}g</b></Typography>
                </Paper>
              </Fade>
              <Fade in={true} timeout={800}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#7c43bd', mb: 1 }}>Calories (Past 7 Days)</Typography>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={weekData}>
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="calories" fill="#7c43bd" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Fade>
            </Box>
          </CardContent>
        </Card>
      </Fade>
      {/* Edit Modal */}
      {editModalOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', bgcolor: 'rgba(0,0,0,0.2)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Fade in={editModalOpen}>
            <Card sx={{ minWidth: 320, p: 3, borderRadius: 3, boxShadow: 6 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Edit Entry</Typography>
                <form onSubmit={handleEditSubmit}>
                  <TextField name="food" label="Food" value={editForm.food} onChange={handleEditChange} required fullWidth sx={{ mb: 2 }} />
                  <TextField name="calories" label="Calories" type="number" value={editForm.calories} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
                  <TextField name="protein" label="Protein (g)" type="number" value={editForm.protein} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
                  <TextField name="carbs" label="Carbs (g)" type="number" value={editForm.carbs} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
                  <TextField name="fat" label="Fat (g)" type="number" value={editForm.fat} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
                  <TextField name="meal_type" label="Meal Type" value={editForm.meal_type} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
                  <TextField name="portion" label="Portion" value={editForm.portion} onChange={handleEditChange} fullWidth sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button onClick={() => setEditModalOpen(false)} color="secondary" variant="outlined">Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      )}
    </Box>
  );
};

export default FoodDiary; 