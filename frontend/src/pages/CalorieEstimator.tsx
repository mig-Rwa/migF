import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Radio, RadioGroup, FormControlLabel, FormLabel, MenuItem, Fade, Divider, Paper, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import Grid from '@mui/material/Grid';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import HomeIcon from '@mui/icons-material/Home';

const activityLevels = [
  { value: 1.2, label: 'Sedentary (little or no exercise)' },
  { value: 1.375, label: 'Lightly Active (1-3 days/week)' },
  { value: 1.55, label: 'Active (3-5 days/week)' },
  { value: 1.725, label: 'Very Active (6-7 days/week)' },
];
const goals = [
  { value: 'lose', label: 'Lose Weight' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'gain', label: 'Gain Weight' },
];

function calculateBMR({ gender, age, height, weight }: { gender: string; age: number; height: number; weight: number; }) {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

const generateMealPlan = (calorieTarget: number, protein: number, fat: number, carbs: number) => {
  const mealCalories = {
    breakfast: Math.round(calorieTarget * 0.25),
    lunch: Math.round(calorieTarget * 0.35),
    dinner: Math.round(calorieTarget * 0.30),
    snack: Math.round(calorieTarget * 0.10)
  };

  const mealMacros = {
    breakfast: {
      protein: Math.round(protein * 0.25),
      fat: Math.round(fat * 0.25),
      carbs: Math.round(carbs * 0.25)
    },
    lunch: {
      protein: Math.round(protein * 0.35),
      fat: Math.round(fat * 0.35),
      carbs: Math.round(carbs * 0.35)
    },
    dinner: {
      protein: Math.round(protein * 0.30),
      fat: Math.round(fat * 0.30),
      carbs: Math.round(carbs * 0.30)
    },
    snack: {
      protein: Math.round(protein * 0.10),
      fat: Math.round(fat * 0.10),
      carbs: Math.round(carbs * 0.10)
    }
  };

  return {
    meals: [
      {
        name: 'Breakfast',
        icon: <FreeBreakfastIcon />,
        calories: mealCalories.breakfast,
        suggestions: [
          'Oatmeal with berries and nuts',
          'Greek yogurt with granola and honey',
          'Scrambled eggs with whole grain toast',
          'Smoothie with protein powder, banana, and peanut butter'
        ],
        macros: mealMacros.breakfast
      },
      {
        name: 'Lunch',
        icon: <LunchDiningIcon />,
        calories: mealCalories.lunch,
        suggestions: [
          'Grilled chicken salad with olive oil dressing',
          'Quinoa bowl with vegetables and tofu',
          'Turkey wrap with whole grain tortilla',
          'Salmon with sweet potato and steamed vegetables'
        ],
        macros: mealMacros.lunch
      },
      {
        name: 'Dinner',
        icon: <DinnerDiningIcon />,
        calories: mealCalories.dinner,
        suggestions: [
          'Lean beef stir-fry with brown rice',
          'Baked fish with roasted vegetables',
          'Chicken breast with quinoa and steamed broccoli',
          'Lentil curry with brown rice'
        ],
        macros: mealMacros.dinner
      },
      {
        name: 'Snack',
        icon: <LocalCafeIcon />,
        calories: mealCalories.snack,
        suggestions: [
          'Handful of mixed nuts',
          'Protein bar or shake',
          'Apple with almond butter',
          'Cottage cheese with fruit'
        ],
        macros: mealMacros.snack
      }
    ]
  };
};

const CalorieEstimator: React.FC = () => {
  const [form, setForm] = useState({ gender: 'male', age: '', height: '', weight: '', activity: 1.2, goal: 'maintain' });
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { gender, age, height, weight, activity, goal } = form;
    const a = Number(age), h = Number(height), w = Number(weight), act = Number(activity);
    if (!a || !h || !w) return;
    const bmr = calculateBMR({ gender, age: a, height: h, weight: w });
    const tdee = bmr * act;
    let calorieTarget = tdee;
    if (goal === 'lose') calorieTarget -= 500;
    if (goal === 'gain') calorieTarget += 400;
    // Macros
    const protein = Math.round(w * 2); // 2g/kg
    const fat = Math.round((calorieTarget * 0.25) / 9); // 25% of cals, 9 cal/g
    const carbs = Math.round((calorieTarget - (protein * 4 + fat * 9)) / 4);
    const results = { bmr: Math.round(bmr), tdee: Math.round(tdee), calorieTarget: Math.round(calorieTarget), protein, fat, carbs };
    setResult(results);
    setMealPlan(generateMealPlan(results.calorieTarget, results.protein, results.fat, results.carbs));
    setShowResult(true);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 6, p: 2 }}>
      {/* Back to Home Button */}
      <Button
        variant="outlined"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{
          mb: 3,
          borderRadius: 3,
          borderColor: '#818cf8',
          color: '#6366f1',
          fontWeight: 700,
          fontSize: 20,
          px: 3,
          py: 1,
          boxShadow: 'none',
          background: 'white',
          '&:hover': {
            background: '#f3f4f6',
            borderColor: '#6366f1',
            boxShadow: 'none',
          },
        }}
      >
        BACK TO HOME
      </Button>
      <Fade in={true} timeout={700}>
        <Card sx={{ borderRadius: 4, boxShadow: 4, bgcolor: '#fffde7' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <EmojiEventsIcon color="secondary" fontSize="large" />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Calorie & Nutrition Estimator</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FormLabel>Gender</FormLabel>
              <RadioGroup row name="gender" value={form.gender} onChange={handleChange} sx={{ mb: 2 }}>
                <FormControlLabel value="male" control={<Radio color="primary" />} label="Male" />
                <FormControlLabel value="female" control={<Radio color="secondary" />} label="Female" />
              </RadioGroup>
              <TextField label="Age" name="age" type="number" value={form.age} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField label="Height (cm)" name="height" type="number" value={form.height} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} required sx={{ mb: 2 }} />
              <TextField select label="Activity Level" name="activity" value={form.activity} onChange={handleSelectChange} sx={{ mb: 2 }}>
                {activityLevels.map(level => (
                  <MenuItem key={level.value} value={level.value}>{level.label}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Goal" name="goal" value={form.goal} onChange={handleChange} sx={{ mb: 2 }}>
                {goals.map(g => (
                  <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                ))}
              </TextField>
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 700, mt: 1 }}>Estimate</Button>
            </form>
            {showResult && result && (
              <Fade in={showResult} timeout={600}>
                <Box sx={{ mt: 4 }}>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#e1f5fe', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0288d1', mb: 1 }}>Your Results</Typography>
                    <Typography>BMR: <b>{result.bmr}</b> kcal/day</Typography>
                    <Typography>TDEE: <b>{result.tdee}</b> kcal/day</Typography>
                    <Typography>Calorie Target: <b>{result.calorieTarget}</b> kcal/day</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#43a047', mb: 1 }}>Suggested Macros</Typography>
                    <Typography>Protein: <b>{result.protein}g</b> &nbsp; | &nbsp; Fat: <b>{result.fat}g</b> &nbsp; | &nbsp; Carbs: <b>{result.carbs}g</b></Typography>
                  </Paper>

                  {mealPlan && (
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: '#f3e5f5', mt: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#7b1fa2', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalDiningIcon /> Suggested Meal Plan
                      </Typography>
                      <Grid container spacing={2}>
                        {mealPlan.meals.map((meal: any) => (
                          <Grid item xs={12} sm={6} key={meal.name}>
                            <Paper sx={{ p: 2, height: '100%', bgcolor: 'white' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {meal.icon}
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{meal.name}</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {meal.calories} kcal | P: {meal.macros.protein}g | F: {meal.macros.fat}g | C: {meal.macros.carbs}g
                              </Typography>
                              <List dense>
                                {meal.suggestions.map((suggestion: string, index: number) => (
                                  <ListItem key={index}>
                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                      <RestaurantIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={suggestion} />
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  )}

                  <Typography sx={{ color: '#888', fontSize: 15, mt: 2 }}>
                    * This is an estimate. Adjust based on your progress and how you feel!
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <RestaurantIcon color="primary" />
                    <Typography variant="caption" sx={{ color: '#888' }}>Eat well, train smart, and enjoy the journey!</Typography>
                  </Box>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default CalorieEstimator; 