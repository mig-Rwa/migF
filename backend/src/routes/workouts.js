const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get all workouts for a user (with exercises)
router.get('/', auth, (req, res) => {
    db.all('SELECT * FROM workouts WHERE user_id = ?', [req.user.id], (err, workouts) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error fetching workouts'
            });
        }
        const workoutIds = workouts.map(w => w.id);
        if (workoutIds.length === 0) {
            return res.json({ status: 'success', data: [] });
        }
        db.all(
            `SELECT * FROM exercises WHERE workout_id IN (${workoutIds.map(() => '?').join(',')})`,
            workoutIds,
            (err2, exercises) => {
                if (err2) {
                    return res.status(500).json({ status: 'error', message: 'Error fetching exercises' });
                }
                const workoutsWithExercises = workouts.map(w => ({
                    ...w,
                    exercises: exercises.filter(e => e.workout_id === w.id)
                }));
                res.json({ status: 'success', data: workoutsWithExercises });
            }
        );
    });
});

// Get a single workout (with exercises)
router.get('/:id', auth, (req, res) => {
    db.get('SELECT * FROM workouts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, workout) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error fetching workout'
            });
        }
        if (!workout) {
            return res.status(404).json({
                status: 'error',
                message: 'Workout not found'
            });
        }
        db.all('SELECT * FROM exercises WHERE workout_id = ?', [workout.id], (err2, exercises) => {
            if (err2) {
                return res.status(500).json({ status: 'error', message: 'Error fetching exercises' });
            }
            res.json({ status: 'success', data: { ...workout, exercises } });
        });
    });
});

// Create a new workout
router.post('/', auth, (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({
            status: 'error',
            message: 'Workout name is required'
        });
    }

    db.run(
        'INSERT INTO workouts (user_id, name, description) VALUES (?, ?, ?)',
        [req.user.id, name, description],
        function(err) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: 'error',
                    message: 'Error creating workout'
                });
            }
            res.status(201).json({
                status: 'success',
                data: {
                    id: this.lastID,
                    user_id: req.user.id,
                    name,
                    description
                }
            });
        }
    );
});

// Update a workout
router.put('/:id', auth, (req, res) => {
    const { name, description } = req.body;
    
    if (!name) {
        return res.status(400).json({
            status: 'error',
            message: 'Workout name is required'
        });
    }

    db.run(
        'UPDATE workouts SET name = ?, description = ? WHERE id = ? AND user_id = ?',
        [name, description, req.params.id, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Error updating workout'
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Workout not found'
                });
            }
            res.json({
                status: 'success',
                data: {
                    id: req.params.id,
                    user_id: req.user.id,
                    name,
                    description
                }
            });
        }
    );
});

// Delete a workout
router.delete('/:id', auth, (req, res) => {
    db.run('DELETE FROM workouts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error deleting workout'
            });
        }
        if (this.changes === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Workout not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Workout deleted successfully'
        });
    });
});

module.exports = router; 