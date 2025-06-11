import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, IconButton, TextField, InputAdornment, Checkbox, Button, Chip, Fade, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SearchIcon from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';

const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

export interface Exercise {
  id: number;
  name: string;
  description: string;
  muscle_group: string;
  difficulty: string;
  image_url?: string;
  video_url?: string;
}

interface ExerciseLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (exercises: Exercise[]) => void;
}

const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({ open, onClose, onAdd }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState('');

  useEffect(() => {
    if (open && muscleGroup && difficulty) {
      fetchExercises(muscleGroup, difficulty, '');
      setSearch(''); // Clear search when filters change
    } else if (!open) {
      setExercises([]);
      setSelected([]);
      setMuscleGroup('');
      setDifficulty('');
      setSearch('');
      setPendingSearch('');
    }
    // eslint-disable-next-line
  }, [open, muscleGroup, difficulty]);

  const fetchExercises = async (mg: string, diff: string, searchTerm: string) => {
    setLoading(true);
    let url = '/api/exercises?';
    if (mg) url += `muscle_group=${encodeURIComponent(mg)}&`;
    if (diff) url += `difficulty=${encodeURIComponent(diff)}&`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setExercises(data.data || []);
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };

  const handleAdd = () => {
    const selectedExercises = exercises.filter(ex => selected.includes(ex.id));
    onAdd(selectedExercises);
    setSelected([]);
    onClose();
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  const handleSearch = () => {
    if (muscleGroup && difficulty) {
      setSearch(pendingSearch);
      fetchExercises(muscleGroup, difficulty, pendingSearch);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Fade in={open}>
        <Box sx={{ maxWidth: 700, mx: 'auto', mt: 8, bgcolor: '#fff', borderRadius: 4, boxShadow: 6, p: 4, outline: 'none', position: 'relative' }}>
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16 }}><CloseIcon /></IconButton>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FitnessCenterIcon color="primary" /> Exercise Library
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 140 }} size="small">
              <InputLabel>Muscle Group</InputLabel>
              <Select value={muscleGroup} label="Muscle Group" onChange={e => setMuscleGroup(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {muscleGroups.map(mg => <MenuItem key={mg} value={mg}>{mg}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 140 }} size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select value={difficulty} label="Difficulty" onChange={e => setDifficulty(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {difficulties.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search by name (optional)"
              value={pendingSearch}
              onChange={e => setPendingSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
              }}
              sx={{ flex: 1, minWidth: 180 }}
            />
          </Box>
          <Button variant="outlined" onClick={handleSearch} disabled={!muscleGroup || !difficulty} sx={{ height: 40 }}>
            Search
          </Button>
          <Grid container spacing={2} sx={{ maxHeight: 350, overflowY: 'auto', mb: 2 }}>
            {loading ? (
              <Typography sx={{ m: 2 }}>Loading...</Typography>
            ) : exercises.length === 0 ? (
              <Typography sx={{ m: 2 }}>No exercises found.</Typography>
            ) : exercises.map(ex => (
              <Grid item xs={12} sm={6} key={ex.id}>
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 3, p: 2, display: 'flex', alignItems: 'flex-start', gap: 2, bgcolor: selected.includes(ex.id) ? '#e3f2fd' : '#fafafa', cursor: 'pointer' }} onClick={() => handleToggle(ex.id)}>
                  <Checkbox checked={selected.includes(ex.id)} onChange={() => handleToggle(ex.id)} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{ex.name}</Typography>
                    <Chip label={ex.muscle_group} size="small" sx={{ mr: 1 }} />
                    <Chip label={ex.difficulty} size="small" color="secondary" />
                    <Typography variant="body2" sx={{ mt: 1 }}>{ex.description}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleClose} variant="outlined">Cancel</Button>
            <Button onClick={handleAdd} variant="contained" color="primary" disabled={selected.length === 0}>Add Selected to Workout</Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ExerciseLibraryModal; 