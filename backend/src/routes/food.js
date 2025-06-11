const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Add a food entry
router.post('/', auth, (req, res) => {
    const { date, food, calories, protein, carbs, fat, meal_type, portion } = req.body;
    if (!date || !food) {
        return res.status(400).json({ status: 'error', message: 'Date and food name are required' });
    }
    db.run(
        `INSERT INTO food_entries (user_id, date, food, calories, protein, carbs, fat, meal_type, portion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, date, food, calories, protein, carbs, fat, meal_type, portion],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 'error', message: 'Error adding food entry' });
            }
            res.status(201).json({
                status: 'success',
                data: {
                    id: this.lastID,
                    user_id: req.user.id,
                    date, food, calories, protein, carbs, fat, meal_type, portion
                }
            });
        }
    );
});

// Get all food entries for a user for a specific date
router.get('/', auth, (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ status: 'error', message: 'Date is required' });
    }
    db.all(
        `SELECT * FROM food_entries WHERE user_id = ? AND date = ? ORDER BY id DESC`,
        [req.user.id, date],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 'error', message: 'Error fetching food entries' });
            }
            res.json({ status: 'success', data: rows });
        }
    );
});

// Edit a food entry
router.put('/:id', auth, (req, res) => {
    const { food, calories, protein, carbs, fat, meal_type, portion } = req.body;
    db.run(
        `UPDATE food_entries SET food = ?, calories = ?, protein = ?, carbs = ?, fat = ?, meal_type = ?, portion = ? WHERE id = ? AND user_id = ?`,
        [food, calories, protein, carbs, fat, meal_type, portion, req.params.id, req.user.id],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 'error', message: 'Error updating food entry' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ status: 'error', message: 'Food entry not found' });
            }
            res.json({ status: 'success', message: 'Food entry updated' });
        }
    );
});

// Delete a food entry
router.delete('/:id', auth, (req, res) => {
    db.run(
        `DELETE FROM food_entries WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user.id],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: 'error', message: 'Error deleting food entry' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ status: 'error', message: 'Food entry not found' });
            }
            res.json({ status: 'success', message: 'Food entry deleted' });
        }
    );
});

module.exports = router; 