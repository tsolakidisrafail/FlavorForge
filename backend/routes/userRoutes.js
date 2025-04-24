// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // 1. Check if user already exists
        const userExists = await User.findOne({ email: email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // 2. Create new user
        // Το password θα κρυπτογραφηθεί αυτόματα λόγω του middleware στο μοντέλο User
        const user = await User.create({
            name,
            email,
            password,
        });

        // 3. Send response
        if (user) {
            // Επιτυχής εγγραφή
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                message: 'User registered successfully'
            });
        } else {
            // Αποτυχία εγγραφής
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error during user registration:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error during registration' });
    }
});

// @desc    Authenticate a user and get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // 2. Εύρεση χρήστη με βάση το email
        const user = await User.findOne({ email }).select('+password'); // Επιλέγουμε και το password για σύγκριση

        // 3. Έλεγχος αν ο χρήστης υπάρχει και αν το password είναι σωστό
        if (user && (await user.matchPassword(password))) {
            // Δημιουργία token
            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            // Αποστολή απάντησης
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token
            });
        } else {
            // Αποτυχία σύνδεσης
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server Error during login' });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    if (req.user) {
        try {
            const userProfile = await User.findById(req.user._id);
            if (userProfile) {
                res.json({
                    _id: userProfile._id,
                    name: userProfile.name,
                    email: userProfile.email,
                    points: userProfile.points,
                    badges: userProfile.badges,
                    createdAt: userProfile.createdAt
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error fetching user profile data:', error);
            res.status(500).json({ message: 'Server Error: Could not fetch user profile' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no user found' });
    }
});


module.exports = router;