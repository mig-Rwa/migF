const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const config = require('../config/config');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, user) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Database error'
                });
            }

            if (user) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User already exists'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                function(err) {
                    if (err) {
                        return res.status(500).json({
                            status: 'error',
                            message: 'Error creating user'
                        });
                    }

                    // Generate token
                    const token = jwt.sign(
                        { id: this.lastID, username },
                        config.jwtSecret,
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        status: 'success',
                        data: {
                            token,
                            user: {
                                id: this.lastID,
                                username,
                                email
                            }
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Database error'
                });
            }

            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid credentials'
                });
            }

            // Generate token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                config.jwtSecret,
                { expiresIn: '24h' }
            );

            res.json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    }
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server error'
        });
    }
});

module.exports = router; 