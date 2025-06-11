import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
  Box, Button, Card, CardContent, Typography, Avatar, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, IconButton, Switch, AppBar, Toolbar, CssBaseline, Modal, TextField, Fade, ListItemButton, MenuItem, Select, InputLabel, FormControl, RadioGroup, Radio
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { getWorkouts, addWorkout, updateWorkout, deleteWorkout, addExercise, deleteExercise, updateExercise } from '../services/workoutService';
import { getProgress, addProgress } from '../services/progressService';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import ExerciseLibraryModal from '../components/ExerciseLibraryModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TokenPayload {
  id: number;
  username: string;
}

const motivationalQuotes = [
  "Push yourself, because no one else is going to do it for you.",
  "Success starts with self-discipline.",
  "The body achieves what the mind believes.",
  "Don't limit your challenges. Challenge your limits.",
  "It never gets easier, you just get stronger."
];

const sections = [
  { key: 'workouts', label: 'Workouts', icon: <FitnessCenterIcon /> },
  { key: 'progress', label: 'Progress', icon: <TimelineIcon /> },
  { key: 'add', label: 'Add Workout', icon: <AddCircleIcon /> },
  { key: 'food-diary', label: 'Food Diary', icon: <RestaurantIcon /> },
  { key: 'bmi', label: 'BMI Calculator', icon: <FitnessCenterIcon /> },
  { key: 'body-fat', label: 'Body Fat Calculator', icon: <FitnessCenterIcon /> },
  { key: 'calorie-estimator', label: 'Calorie Estimator', icon: <LocalDiningIcon /> },
];

const progressTypes = [
  { value: 'workout', label: 'Workout Progress' },
  { value: 'nutrition', label: 'Nutrition Progress' },
  { value: 'strength', label: 'Weight/Strength Progress' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('workouts');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ name: '', description: '' });
  const token = localStorage.getItem('token');
  let username = '';
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      username = decoded.username;
    } catch (e) {
      username = '';
    }
  }
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState<any[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState('');
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressNotes, setProgressNotes] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [progressSuccess, setProgressSuccess] = useState(false);
  const [error, setError] = useState('');
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [workoutEdit, setWorkoutEdit] = useState(false);
  const [workoutEditData, setWorkoutEditData] = useState({ name: '', description: '' });
  const [workoutSuccess, setWorkoutSuccess] = useState(false);
  const [workoutError, setWorkoutError] = useState('');
  const [progressEditModalOpen, setProgressEditModalOpen] = useState(false);
  const [progressEditData, setProgressEditData] = useState({ id: null, notes: '' });
  const [progressEditLoading, setProgressEditLoading] = useState(false);
  const [progressEditSuccess, setProgressEditSuccess] = useState(false);
  const [progressEditError, setProgressEditError] = useState('');
  const [addExerciseModalOpen, setAddExerciseModalOpen] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ name: '', sets: '', reps: '', weight: '', rest: '', notes: '' });
  const [exerciseTargetWorkout, setExerciseTargetWorkout] = useState<any>(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseError, setExerciseError] = useState('');
  const [deleteExerciseLoading, setDeleteExerciseLoading] = useState(false);
  const [deleteExerciseId, setDeleteExerciseId] = useState<number | null>(null);
  const [deleteExerciseConfirmOpen, setDeleteExerciseConfirmOpen] = useState(false);
  const [editExerciseModalOpen, setEditExerciseModalOpen] = useState(false);
  const [editExerciseForm, setEditExerciseForm] = useState({ id: null, name: '', sets: '', reps: '', weight: '', rest: '', notes: '' });
  const [editExerciseLoading, setEditExerciseLoading] = useState(false);
  const [editExerciseError, setEditExerciseError] = useState('');
  const [progressType, setProgressType] = useState('workout');
  const [progressWorkoutId, setProgressWorkoutId] = useState<number | null>(null);
  const [nutritionFields, setNutritionFields] = useState({ calories: '', protein: '', carbs: '', fat: '' });
  const [strengthFields, setStrengthFields] = useState({ exercise: '', previousWeight: '', newWeight: '', reps: '' });
  const [progressTypeFilter, setProgressTypeFilter] = useState('all');
  const [exerciseLibraryOpen, setExerciseLibraryOpen] = useState(false);
  const [exerciseLibraryTargetWorkout, setExerciseLibraryTargetWorkout] = useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      setProgressLoading(true);
      try {
        const workoutData = await getWorkouts(token);
        setWorkouts(workoutData.data || []);
        const progressData = await getProgress(token);
        setProgress(progressData.data || []);
      } catch (e: any) {
        setError('Failed to load data.');
        setWorkouts([]);
        setProgress([]);
      } finally {
        setLoading(false);
        setProgressLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  // Placeholder stats and activity
  const stats = {
    workouts: 12,
    progress: 34,
    streak: 5
  };
  const recentActivity = [
    { type: 'workout', name: 'Morning Run', date: '2025-05-01' },
    { type: 'progress', name: 'Upper Body', date: '2025-04-30' },
    { type: 'workout', name: 'Yoga', date: '2025-04-29' },
  ];

  // Calculate streak (consecutive days with progress)
  const getStreak = () => {
    if (!progress.length) return 0;
    const dates = Array.from(new Set(progress.map((p: any) => p.date?.slice(0, 10)))).sort((a, b) => b.localeCompare(a));
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      if ((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24) === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // Section content
  const renderSection = () => {
    switch (activeSection) {
      case 'workouts':
        return (
          <>
            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Card sx={{ minWidth: 180, p: 2, bgcolor: '#6366f1', color: '#fff', borderRadius: 3, boxShadow: 3, transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 8 } }}>
                <CardContent>
                  <Typography variant="h6">Workouts</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{workouts.length}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ minWidth: 180, p: 2, bgcolor: '#818cf8', color: '#fff', borderRadius: 3, boxShadow: 3, transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 8 } }}>
                <CardContent>
                  <Typography variant="h6">Progress</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{progress.length}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ minWidth: 180, p: 2, bgcolor: '#a5b4fc', color: '#18181b', borderRadius: 3, boxShadow: 3, transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 8 } }}>
                <CardContent>
                  <Typography variant="h6">Streak</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{getStreak()} days</Typography>
                </CardContent>
              </Card>
            </Box>
            {/* Recent Activity */}
            <Card sx={{ width: '100%', maxWidth: 600, mb: 4, borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
                {loading && progressLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {workouts.length === 0 && progress.length === 0 && (
                      <Typography color="text.secondary">No activity yet. Start by adding a workout or logging progress!</Typography>
                    )}
                    {workouts.slice(0, 3).map((item, idx) => (
                      <Fade in={true} timeout={400 + idx * 100} key={item.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, p: 2, borderRadius: 2, boxShadow: 1, bgcolor: '#f8fafc' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">🏋️‍♂️ {item.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ color: 'text.secondary' }}>{item.created_at?.slice(0, 10)}</Typography>
                              <Button size="small" variant="outlined" color="primary" startIcon={<AssignmentTurnedInIcon />} sx={{ ml: 1, borderRadius: 2 }} onClick={e => { e.stopPropagation(); setSelectedWorkout(item); setProgressModalOpen(true); }}>Log Progress</Button>
                            </Box>
                          </Box>
                          {/* Exercises List */}
                          {item.exercises && item.exercises.length > 0 && (
                            <Box sx={{ ml: 2, mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: '#6366f1', mb: 1 }}>Exercises:</Typography>
                              {item.exercises.map((ex: any) => (
                                <Box key={ex.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5, p: 1, bgcolor: '#e0e7ff', borderRadius: 1 }}>
                                  <Typography sx={{ fontWeight: 500 }}>{ex.name}</Typography>
                                  <Typography variant="body2">Sets: {ex.sets || '-'}</Typography>
                                  <Typography variant="body2">Reps: {ex.reps || '-'}</Typography>
                                  <Typography variant="body2">Weight: {ex.weight || '-'} kg</Typography>
                                  <Typography variant="body2">Rest: {ex.rest || '-'}s</Typography>
                                  {ex.notes && <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#64748b' }}>({ex.notes})</Typography>}
                                  <IconButton color="error" size="small" onClick={() => handleDeleteExerciseClick(ex.id)}><DeleteForeverIcon /></IconButton>
                                  <IconButton color="primary" size="small" onClick={() => handleOpenEditExerciseModal(ex)}><EditIcon /></IconButton>
                                </Box>
                              ))}
                            </Box>
                          )}
                          <Button variant="contained" color="secondary" size="small" sx={{ mt: 1, width: 'fit-content' }} onClick={() => handleOpenExerciseLibrary(item)}>
                            Exercise Library
                          </Button>
                        </Box>
                      </Fade>
                    ))}
                    {progress.slice(0, 3).map((item, idx) => (
                      <Fade in={true} timeout={600 + idx * 100} key={item.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                          <Typography>📈 {item.notes || 'Progress logged'}</Typography>
                          <Typography sx={{ color: 'text.secondary' }}>{item.date?.slice(0, 10)}</Typography>
                        </Box>
                      </Fade>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        );
      case 'progress':
        // Prepare chart data
        const progressByDate: Record<string, number> = {};
        progress.forEach((item: any) => {
          const date = item.date?.slice(0, 10);
          if (date) progressByDate[date] = (progressByDate[date] || 0) + 1;
        });
        const chartLabels = Object.keys(progressByDate).sort();
        const chartData = chartLabels.map(date => progressByDate[date]);
        const data = {
          labels: chartLabels,
          datasets: [
            {
              label: 'Progress Entries',
              data: chartData,
              fill: false,
              borderColor: '#6366f1',
              backgroundColor: '#818cf8',
              tension: 0.3,
            },
          ],
        };
        const options = {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Progress Over Time', color: '#6366f1', font: { size: 18 } },
          },
          scales: {
            x: { ticks: { color: '#6366f1' } },
            y: { beginAtZero: true, ticks: { color: '#6366f1' } },
          },
        };
        return (
          <Card sx={{ width: '100%', maxWidth: 700, mb: 4, borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              {/* Progress Type Filter Dropdown */}
              <FormControl sx={{ mb: 2, minWidth: 180 }}>
                <InputLabel id="progress-type-filter-label">Filter by Type</InputLabel>
                <Select
                  labelId="progress-type-filter-label"
                  value={progressTypeFilter}
                  label="Filter by Type"
                  onChange={e => setProgressTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="workout">Workout</MenuItem>
                  <MenuItem value="nutrition">Nutrition</MenuItem>
                  <MenuItem value="strength">Strength</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mb: 4 }}>
                <Line data={data} options={options} />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>All Progress Entries</Typography>
              <Button variant="contained" color="primary" sx={{ mb: 2, borderRadius: 2 }} onClick={() => setProgressModalOpen(true)}>
                Add Progress
              </Button>
              {progressLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
                  <CircularProgress />
                </Box>
              ) : progress.length === 0 ? (
                <Typography color="text.secondary">No progress entries yet. Log your first progress!</Typography>
              ) : (
                progress
                  .filter(item => progressTypeFilter === 'all' || (item.type || 'workout') === progressTypeFilter)
                  .map((item, idx) => {
                    let extra = null;
                    if (item.data) {
                      try { extra = JSON.parse(item.data); } catch {}
                    }
                    return (
                      <Fade in={true} timeout={400 + idx * 100} key={item.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center', p: 1, borderRadius: 2, bgcolor: idx % 2 === 0 ? '#f3f4f6' : '#e0e7ff', boxShadow: 1 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>{item.date?.slice(0, 10)}</Typography>
                            <Typography variant="body2">{item.notes || 'Progress logged'}</Typography>
                            <Typography variant="caption" color="text.secondary">Type: {item.type || 'workout'}</Typography>
                            {item.type === 'nutrition' && extra && (
                              <Typography variant="caption" color="secondary" sx={{ display: 'block' }}>
                                Calories: {extra.calories}, Protein: {extra.protein}g, Carbs: {extra.carbs}g, Fat: {extra.fat}g
                              </Typography>
                            )}
                            {item.type === 'strength' && extra && (
                              <Typography variant="caption" color="secondary" sx={{ display: 'block' }}>
                                Exercise: {extra.exercise}, Previous: {extra.previousWeight}kg, New: {extra.newWeight}kg, Reps: {extra.reps}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">Workout ID: {item.workout_id}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton color="primary" onClick={() => openProgressEditModal(item)}><EditNoteIcon /></IconButton>
                            <IconButton color="error" onClick={() => handleProgressDelete(item.id)}><DeleteForeverIcon /></IconButton>
                          </Box>
                        </Box>
                      </Fade>
                    );
                  })
              )}
            </CardContent>
          </Card>
        );
      case 'add':
        setAddModalOpen(true);
        setActiveSection('workouts');
        return null;
      case 'food-diary':
        navigate('/food-diary');
        return null;
      case 'bmi':
        navigate('/bmi');
        return null;
      case 'body-fat':
        navigate('/body-fat');
        return null;
      case 'calorie-estimator':
        navigate('/calorie-estimator');
        return null;
      default:
        return null;
    }
  };

  // Add Workout Modal
  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await addWorkout(token, newWorkout.name, newWorkout.description);
      setSuccess(true);
      setAddModalOpen(false);
      setNewWorkout({ name: '', description: '' });
      // Refresh workouts
      const data = await getWorkouts(token);
      setWorkouts(data.data || []);
    } catch (e) {
      setError('Failed to add workout.');
    } finally {
      setLoading(false);
    }
  };

  // Add Progress Modal
  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    let workoutId = selectedWorkout?.id || progressWorkoutId;
    if (!workoutId) return;
    setProgressLoading(true);
    try {
      let notes = progressNotes;
      let extra = {};
      if (progressType === 'nutrition') {
        notes = `Calories: ${nutritionFields.calories}, Protein: ${nutritionFields.protein}, Carbs: ${nutritionFields.carbs}, Fat: ${nutritionFields.fat}. ${progressNotes}`;
        extra = nutritionFields;
      } else if (progressType === 'strength') {
        notes = `Exercise: ${strengthFields.exercise}, Previous Weight: ${strengthFields.previousWeight}, New Weight: ${strengthFields.newWeight}, Reps: ${strengthFields.reps}. ${progressNotes}`;
        extra = strengthFields;
      }
      await addProgress(token, workoutId, notes); // Optionally pass extra/type to backend if supported
      setProgressSuccess(true);
      setProgressModalOpen(false);
      setProgressNotes('');
      setSelectedWorkout(null);
      setProgressWorkoutId(null);
      setNutritionFields({ calories: '', protein: '', carbs: '', fat: '' });
      setStrengthFields({ exercise: '', previousWeight: '', newWeight: '', reps: '' });
      // Refresh progress
      const progressData = await getProgress(token);
      setProgress(progressData.data || []);
    } catch (e) {
      setProgressError('Failed to log progress.');
    } finally {
      setProgressLoading(false);
    }
  };

  // Workout details/edit modal handlers
  const openWorkoutModal = (workout: any) => {
    setSelectedWorkout(workout);
    setWorkoutEdit(false);
    setWorkoutEditData({ name: workout.name, description: workout.description });
    setWorkoutModalOpen(true);
  };
  const handleWorkoutEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedWorkout) return;
    setLoading(true);
    try {
      await updateWorkout(token, selectedWorkout.id, workoutEditData.name, workoutEditData.description);
      setWorkoutSuccess(true);
      setWorkoutModalOpen(false);
      // Refresh workouts
      const data = await getWorkouts(token);
      setWorkouts(data.data || []);
    } catch (e) {
      setWorkoutError('Failed to update workout.');
    } finally {
      setLoading(false);
    }
  };
  const handleWorkoutDelete = async () => {
    if (!token || !selectedWorkout) return;
    setLoading(true);
    try {
      await deleteWorkout(token, selectedWorkout.id);
      setWorkoutSuccess(true);
      setWorkoutModalOpen(false);
      // Refresh workouts
      const data = await getWorkouts(token);
      setWorkouts(data.data || []);
    } catch (e) {
      setWorkoutError('Failed to delete workout.');
    } finally {
      setLoading(false);
    }
  };

  // Progress edit/delete handlers
  const openProgressEditModal = (entry: any) => {
    setProgressEditData({ id: entry.id, notes: entry.notes });
    setProgressEditModalOpen(true);
  };
  const handleProgressEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !progressEditData.id) return;
    setProgressEditLoading(true);
    try {
      // We'll use addProgress for now, but you can add an updateProgress API call for real editing
      await addProgress(token, progress.find(p => p.id === progressEditData.id)?.workout_id, progressEditData.notes);
      setProgressEditSuccess(true);
      setProgressEditModalOpen(false);
      // Refresh progress
      const progressData = await getProgress(token);
      setProgress(progressData.data || []);
    } catch (e) {
      setProgressEditError('Failed to update progress.');
    } finally {
      setProgressEditLoading(false);
    }
  };
  const handleProgressDelete = async (id: number) => {
    // You can add a deleteProgress API call for real deletion
    setProgressEditLoading(true);
    try {
      // For now, just close the modal and refresh
      setProgressEditModalOpen(false);
      // Refresh progress
      if (token) {
        const progressData = await getProgress(token);
        setProgress(progressData.data || []);
      }
    } catch (e) {
      setProgressEditError('Failed to delete progress.');
    } finally {
      setProgressEditLoading(false);
    }
  };

  // Exercise handlers
  const handleOpenAddExerciseModal = (workout: any) => {
    setExerciseTargetWorkout(workout);
    setExerciseForm({ name: '', sets: '', reps: '', weight: '', rest: '', notes: '' });
    setExerciseError('');
    setAddExerciseModalOpen(true);
  };
  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !exerciseTargetWorkout) return;
    setExerciseLoading(true);
    setExerciseError('');
    try {
      await addExercise(token, exerciseTargetWorkout.id, {
        name: exerciseForm.name,
        sets: exerciseForm.sets ? Number(exerciseForm.sets) : undefined,
        reps: exerciseForm.reps ? Number(exerciseForm.reps) : undefined,
        weight: exerciseForm.weight ? Number(exerciseForm.weight) : undefined,
        rest: exerciseForm.rest ? Number(exerciseForm.rest) : undefined,
        notes: exerciseForm.notes,
      });
      setAddExerciseModalOpen(false);
      setExerciseForm({ name: '', sets: '', reps: '', weight: '', rest: '', notes: '' });
      // Refresh workouts
      const data = await getWorkouts(token);
      setWorkouts(data.data || []);
    } catch (e) {
      setExerciseError('Failed to add exercise.');
    } finally {
      setExerciseLoading(false);
    }
  };

  const handleDeleteExerciseClick = (exerciseId: number) => {
    setDeleteExerciseId(exerciseId);
    setDeleteExerciseConfirmOpen(true);
  };
  const handleDeleteExercise = async () => {
    if (!token || !deleteExerciseId) return;
    setDeleteExerciseLoading(true);
    try {
      await deleteExercise(token, deleteExerciseId);
      setDeleteExerciseConfirmOpen(false);
      setDeleteExerciseId(null);
      // Refresh workouts
      const data = await getWorkouts(token);
      setWorkouts(data.data || []);
    } catch (e) {
      setError('Failed to delete exercise.');
    } finally {
      setDeleteExerciseLoading(false);
    }
  };

  const handleOpenEditExerciseModal = (exercise: any) => {
    setEditExerciseForm({
      id: exercise.id,
      name: exercise.name || '',
      sets: exercise.sets?.toString() || '',
      reps: exercise.reps?.toString() || '',
      weight: exercise.weight?.toString() || '',
      rest: exercise.rest?.toString() || '',
      notes: exercise.notes || ''
    });
    setEditExerciseError('');
    setEditExerciseModalOpen(true);
  };
  const handleEditExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editExerciseForm.id) return;
    setEditExerciseLoading(true);
    setEditExerciseError('');
    try {
      await updateExercise(token, editExerciseForm.id, {
        name: editExerciseForm.name,
        sets: editExerciseForm.sets ? Number(editExerciseForm.sets) : undefined,
        reps: editExerciseForm.reps ? Number(editExerciseForm.reps) : undefined,
        weight: editExerciseForm.weight ? Number(editExerciseForm.weight) : undefined,
        rest: editExerciseForm.rest ? Number(editExerciseForm.rest) : undefined,
        notes: editExerciseForm.notes,
      });
      setEditExerciseModalOpen(false);
      // Refresh workouts
      const data = await getWorkouts(token);
      setWorkouts(data.data || []);
    } catch (e) {
      setEditExerciseError('Failed to update exercise.');
    } finally {
      setEditExerciseLoading(false);
    }
  };

  const handleOpenExerciseLibrary = (workout: any) => {
    setExerciseLibraryTargetWorkout(workout);
    setExerciseLibraryOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: darkMode ? '#18181b' : '#f8fafc', minHeight: '100vh' }}>
      <CssBaseline />
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 220,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box', bgcolor: darkMode ? '#27272a' : '#6366f1', color: '#fff', transition: 'background 0.3s' },
        }}
      >
        <Toolbar />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          <Avatar sx={{ bgcolor: '#fff', color: '#6366f1', width: 64, height: 64, mb: 1, boxShadow: 2 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{username}</Typography>
        </Box>
        <Divider sx={{ my: 2, bgcolor: '#a5b4fc' }} />
        <List>
          {sections.map((section, idx) => (
            <React.Fragment key={section.key}>
              <ListItemButton
                selected={activeSection === section.key}
                onClick={() => {
                  setActiveSection(section.key);
                  if (section.key === 'food-diary') navigate('/food-diary');
                  if (section.key === 'bmi') navigate('/bmi');
                  if (section.key === 'body-fat') navigate('/body-fat');
                  if (section.key === 'calorie-estimator') navigate('/calorie-estimator');
                }}
                sx={{ borderRadius: 2, mb: 1 }}
              >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.label} />
              </ListItemButton>
              {/* Insert Exercise Library button right after Add Workout */}
              {section.key === 'add' && (
                <ListItemButton
                  onClick={() => setExerciseLibraryOpen(true)}
                  sx={{ borderRadius: 2, mb: 1, ml: 3, bgcolor: '#a5b4fc', color: '#18181b', '&:hover': { bgcolor: '#818cf8', color: '#fff' } }}
                >
                  <ListItemIcon><FitnessCenterIcon /></ListItemIcon>
                  <ListItemText primary="Exercise Library" />
                </ListItemButton>
              )}
            </React.Fragment>
          ))}
        </List>
        <Divider sx={{ my: 2, bgcolor: '#a5b4fc' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <WbSunnyIcon />
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} color="default" />
          <DarkModeIcon />
        </Box>
        <Button startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ color: '#fff', mb: 2, borderRadius: 2, '&:hover': { bgcolor: '#a5b4fc', color: '#18181b' } }}>
          Logout
        </Button>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4 }}>
          <Toolbar>
            <Typography variant="h4" sx={{ flexGrow: 1, color: darkMode ? '#fff' : '#18181b', fontWeight: 700 }}>
              Hey {username ? username : 'User'}!
            </Typography>
          </Toolbar>
        </AppBar>
        {renderSection()}
        {/* Motivational Quote */}
        <Fade in={true} timeout={800}>
          <Card sx={{ width: '100%', maxWidth: 600, borderRadius: 3, boxShadow: 2, mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontStyle: 'italic', color: '#6366f1' }}>
                "{quote}"
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      </Box>
      {/* Add Workout Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <Fade in={addModalOpen}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 6, minWidth: 320 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Add Workout</Typography>
            <form onSubmit={handleAddWorkout}>
              <TextField
                label="Workout Name"
                value={newWorkout.name}
                onChange={e => setNewWorkout({ ...newWorkout, name: e.target.value })}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Description"
                value={newWorkout.description}
                onChange={e => setNewWorkout({ ...newWorkout, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setAddModalOpen(false)} color="secondary" variant="outlined">Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Add'}</Button>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>
      {/* Add Progress Modal */}
      <Modal open={progressModalOpen} onClose={() => setProgressModalOpen(false)}>
        <Fade in={progressModalOpen}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 6, minWidth: 320 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Log Progress</Typography>
            <form onSubmit={handleAddProgress}>
              {/* Progress Type Selector */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="progress-type-label">Progress Type</InputLabel>
                <Select
                  labelId="progress-type-label"
                  value={progressType}
                  label="Progress Type"
                  onChange={e => setProgressType(e.target.value)}
                >
                  {progressTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Workout Selector if not selected */}
              {(!selectedWorkout || !selectedWorkout.id) && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="workout-select-label">Workout</InputLabel>
                  <Select
                    labelId="workout-select-label"
                    value={progressWorkoutId || ''}
                    label="Workout"
                    onChange={e => setProgressWorkoutId(Number(e.target.value))}
                    required
                  >
                    {workouts.map(w => (
                      <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {/* Nutrition Fields */}
              {progressType === 'nutrition' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <TextField label="Calories" type="number" value={nutritionFields.calories} onChange={e => setNutritionFields(f => ({ ...f, calories: e.target.value }))} />
                  <TextField label="Protein (g)" type="number" value={nutritionFields.protein} onChange={e => setNutritionFields(f => ({ ...f, protein: e.target.value }))} />
                  <TextField label="Carbs (g)" type="number" value={nutritionFields.carbs} onChange={e => setNutritionFields(f => ({ ...f, carbs: e.target.value }))} />
                  <TextField label="Fat (g)" type="number" value={nutritionFields.fat} onChange={e => setNutritionFields(f => ({ ...f, fat: e.target.value }))} />
                </Box>
              )}
              {/* Strength Fields */}
              {progressType === 'strength' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <TextField label="Exercise" value={strengthFields.exercise} onChange={e => setStrengthFields(f => ({ ...f, exercise: e.target.value }))} />
                  <TextField label="Previous Weight (kg)" type="number" value={strengthFields.previousWeight} onChange={e => setStrengthFields(f => ({ ...f, previousWeight: e.target.value }))} />
                  <TextField label="New Weight (kg)" type="number" value={strengthFields.newWeight} onChange={e => setStrengthFields(f => ({ ...f, newWeight: e.target.value }))} />
                  <TextField label="Reps" type="number" value={strengthFields.reps} onChange={e => setStrengthFields(f => ({ ...f, reps: e.target.value }))} />
                </Box>
              )}
              {/* Notes Field */}
              <TextField
                label="Notes"
                value={progressNotes}
                onChange={e => setProgressNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setProgressModalOpen(false)} color="secondary" variant="outlined">Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={progressLoading}>{progressLoading ? <CircularProgress size={20} /> : 'Log Progress'}</Button>
              </Box>
            </form>
            {progressError && <Typography color="error" sx={{ mt: 2 }}>{progressError}</Typography>}
          </Box>
        </Fade>
      </Modal>
      {/* Workout Details/Edit Modal */}
      <Modal open={workoutModalOpen} onClose={() => setWorkoutModalOpen(false)}>
        <Fade in={workoutModalOpen}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 6, minWidth: 340, maxWidth: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Workout Details</Typography>
            {!workoutEdit ? (
              <>
                <Typography sx={{ mb: 1 }}><b>Name:</b> {selectedWorkout?.name}</Typography>
                <Typography sx={{ mb: 1 }}><b>Description:</b> {selectedWorkout?.description || 'No description'}</Typography>
                <Typography sx={{ mb: 2 }}><b>Created:</b> {selectedWorkout?.created_at?.slice(0, 10)}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button startIcon={<EditIcon />} onClick={() => setWorkoutEdit(true)} variant="outlined">Edit</Button>
                  <Button startIcon={<DeleteIcon />} onClick={handleWorkoutDelete} color="error" variant="contained">Delete</Button>
                </Box>
              </>
            ) : (
              <form onSubmit={handleWorkoutEdit}>
                <TextField
                  label="Workout Name"
                  value={workoutEditData.name}
                  onChange={e => setWorkoutEditData({ ...workoutEditData, name: e.target.value })}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Description"
                  value={workoutEditData.description}
                  onChange={e => setWorkoutEditData({ ...workoutEditData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button onClick={() => setWorkoutEdit(false)} color="secondary" variant="outlined">Cancel</Button>
                  <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Save'}</Button>
                </Box>
              </form>
            )}
            {workoutError && <Typography color="error" sx={{ mt: 2 }}>{workoutError}</Typography>}
          </Box>
        </Fade>
      </Modal>
      {/* Progress Edit Modal */}
      <Modal open={progressEditModalOpen} onClose={() => setProgressEditModalOpen(false)}>
        <Fade in={progressEditModalOpen}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 6, minWidth: 320 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Edit Progress</Typography>
            <form onSubmit={handleProgressEdit}>
              <TextField
                label="Notes"
                value={progressEditData.notes}
                onChange={e => setProgressEditData({ ...progressEditData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setProgressEditModalOpen(false)} color="secondary" variant="outlined">Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={progressEditLoading}>{progressEditLoading ? <CircularProgress size={20} /> : 'Save'}</Button>
              </Box>
            </form>
            {progressEditError && <Typography color="error" sx={{ mt: 2 }}>{progressEditError}</Typography>}
          </Box>
        </Fade>
      </Modal>
      {/* Success Snackbar for Progress */}
      <Snackbar open={progressSuccess} autoHideDuration={3000} onClose={() => setProgressSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setProgressSuccess(false)} severity="success">
          Progress logged successfully!
        </MuiAlert>
      </Snackbar>
      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setError('')} severity="error">
          {error}
        </MuiAlert>
      </Snackbar>
      {/* Workout Success Snackbar */}
      <Snackbar open={workoutSuccess} autoHideDuration={3000} onClose={() => setWorkoutSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setWorkoutSuccess(false)} severity="success">
          Workout updated!
        </MuiAlert>
      </Snackbar>
      {/* Progress Edit Success Snackbar */}
      <Snackbar open={progressEditSuccess} autoHideDuration={3000} onClose={() => setProgressEditSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setProgressEditSuccess(false)} severity="success">
          Progress updated!
        </MuiAlert>
      </Snackbar>
      {/* Add Exercise Modal */}
      <Modal open={addExerciseModalOpen} onClose={() => setAddExerciseModalOpen(false)}>
        <Fade in={addExerciseModalOpen}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 6, minWidth: 320 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Add Exercise to {exerciseTargetWorkout?.name}</Typography>
            <form onSubmit={handleAddExercise}>
              <TextField label="Exercise Name" value={exerciseForm.name} onChange={e => setExerciseForm({ ...exerciseForm, name: e.target.value })} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Sets" type="number" value={exerciseForm.sets} onChange={e => setExerciseForm({ ...exerciseForm, sets: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Reps" type="number" value={exerciseForm.reps} onChange={e => setExerciseForm({ ...exerciseForm, reps: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Weight (kg)" type="number" value={exerciseForm.weight} onChange={e => setExerciseForm({ ...exerciseForm, weight: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Rest (seconds)" type="number" value={exerciseForm.rest} onChange={e => setExerciseForm({ ...exerciseForm, rest: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Notes" value={exerciseForm.notes} onChange={e => setExerciseForm({ ...exerciseForm, notes: e.target.value })} fullWidth multiline rows={2} sx={{ mb: 2 }} />
              {exerciseError && <Typography color="error" sx={{ mb: 2 }}>{exerciseError}</Typography>}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setAddExerciseModalOpen(false)} color="secondary" variant="outlined">Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={exerciseLoading}>{exerciseLoading ? <CircularProgress size={20} /> : 'Add'}</Button>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>
      {/* Delete Exercise Confirmation Modal */}
      <Modal open={deleteExerciseConfirmOpen} onClose={() => setDeleteExerciseConfirmOpen(false)}>
        <Fade in={deleteExerciseConfirmOpen}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 6, minWidth: 320 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Delete Exercise</Typography>
            <Typography sx={{ mb: 2 }}>Are you sure you want to delete this exercise?</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setDeleteExerciseConfirmOpen(false)} color="secondary" variant="outlined">Cancel</Button>
              <Button onClick={handleDeleteExercise} variant="contained" color="error" disabled={deleteExerciseLoading}>{deleteExerciseLoading ? <CircularProgress size={20} /> : 'Delete'}</Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
      {/* Edit Exercise Modal */}
      <Modal open={editExerciseModalOpen} onClose={() => setEditExerciseModalOpen(false)}>
        <Fade in={editExerciseModalOpen}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#fff', p: 4, borderRadius: 3, boxShadow: 6, minWidth: 320 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Edit Exercise</Typography>
            <form onSubmit={handleEditExercise}>
              <TextField label="Exercise Name" value={editExerciseForm.name} onChange={e => setEditExerciseForm({ ...editExerciseForm, name: e.target.value })} fullWidth required sx={{ mb: 2 }} />
              <TextField label="Sets" type="number" value={editExerciseForm.sets} onChange={e => setEditExerciseForm({ ...editExerciseForm, sets: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Reps" type="number" value={editExerciseForm.reps} onChange={e => setEditExerciseForm({ ...editExerciseForm, reps: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Weight (kg)" type="number" value={editExerciseForm.weight} onChange={e => setEditExerciseForm({ ...editExerciseForm, weight: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Rest (seconds)" type="number" value={editExerciseForm.rest} onChange={e => setEditExerciseForm({ ...editExerciseForm, rest: e.target.value })} fullWidth sx={{ mb: 2 }} />
              <TextField label="Notes" value={editExerciseForm.notes} onChange={e => setEditExerciseForm({ ...editExerciseForm, notes: e.target.value })} fullWidth multiline rows={2} sx={{ mb: 2 }} />
              {editExerciseError && <Typography color="error" sx={{ mb: 2 }}>{editExerciseError}</Typography>}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setEditExerciseModalOpen(false)} color="secondary" variant="outlined">Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={editExerciseLoading}>{editExerciseLoading ? <CircularProgress size={20} /> : 'Save'}</Button>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>
      {/* Exercise Library Modal */}
      <ExerciseLibraryModal
        open={exerciseLibraryOpen}
        onClose={() => {
          setExerciseLibraryOpen(false);
          setExerciseLibraryTargetWorkout(null);
        }}
        onAdd={async (selectedExercises) => {
          if (!token || !exerciseLibraryTargetWorkout) return;
          for (const ex of selectedExercises) {
            await addExercise(token, exerciseLibraryTargetWorkout.id, {
              name: ex.name,
            });
          }
          setExerciseLibraryOpen(false);
          setExerciseLibraryTargetWorkout(null);
          // Refresh workouts
          const data = await getWorkouts(token);
          setWorkouts(data.data || []);
        }}
      />
    </Box>
  );
};

export default Dashboard; 