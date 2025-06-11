const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Get all progress entries for a user
router.get('/', auth, (req, res) => {
    db.all(
        `SELECT p.*, w.name as workout_name 
         FROM progress p 
         JOIN workouts w ON p.workout_id = w.id 
         WHERE p.user_id = ? 
         ORDER BY p.date DESC`,
        [req.user.id],
        (err, progress) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Error fetching progress'
                });
            }
            res.json({
                status: 'success',
                data: progress
            });
        }
    );
});

// Get progress for a specific workout
router.get('/workout/:workoutId', auth, (req, res) => {
    db.all(
        `SELECT p.*, w.name as workout_name 
         FROM progress p 
         JOIN workouts w ON p.workout_id = w.id 
         WHERE p.user_id = ? AND p.workout_id = ? 
         ORDER BY p.date DESC`,
        [req.user.id, req.params.workoutId],
        (err, progress) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Error fetching progress'
                });
            }
            res.json({
                status: 'success',
                data: progress
            });
        }
    );
});

// Create a new progress entry
router.post('/', auth, (req, res) => {
    const { workout_id, notes, type = 'workout', data = null } = req.body;

    if (!workout_id) {
        return res.status(400).json({
            status: 'error',
            message: 'Workout ID is required'
        });
    }

    // Verify workout belongs to user
    db.get('SELECT id FROM workouts WHERE id = ? AND user_id = ?', [workout_id, req.user.id], (err, workout) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error verifying workout'
            });
        }
        if (!workout) {
            return res.status(404).json({
                status: 'error',
                message: 'Workout not found'
            });
        }

        // Create progress entry
        db.run(
            'INSERT INTO progress (user_id, workout_id, notes, type, data) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, workout_id, notes, type, data ? JSON.stringify(data) : null],
            function(err) {
                if (err) {
                    return res.status(500).json({
                        status: 'error',
                        message: 'Error creating progress entry'
                    });
                }
                res.status(201).json({
                    status: 'success',
                    data: {
                        id: this.lastID,
                        user_id: req.user.id,
                        workout_id,
                        notes,
                        type,
                        data,
                        date: new Date().toISOString()
                    }
                });
            }
        );
    });
});

// Update a progress entry
router.put('/:id', auth, (req, res) => {
    const { notes, type, data } = req.body;
    db.run(
        'UPDATE progress SET notes = ?, type = ?, data = ? WHERE id = ? AND user_id = ?',
        [notes, type || 'workout', data ? JSON.stringify(data) : null, req.params.id, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Error updating progress'
                });
            }
            if (this.changes === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Progress entry not found'
                });
            }
            res.json({
                status: 'success',
                message: 'Progress updated successfully'
            });
        }
    );
});

// Delete a progress entry
router.delete('/:id', auth, (req, res) => {
    db.run('DELETE FROM progress WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error deleting progress entry'
            });
        }
        if (this.changes === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Progress entry not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Progress entry deleted successfully'
        });
    });
});

module.exports = router; 