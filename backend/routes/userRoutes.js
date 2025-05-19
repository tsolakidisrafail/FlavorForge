// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware

const {
    calculateLevel,
    getLevelName,
    getPointsForNextLevel,
    getPointsForLevel
} = require('../utils/gamificationUtils'); // Import gamification utility functions

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

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
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        

        // 2. Create new user
        // Το password θα κρυπτογραφηθεί αυτόματα λόγω του middleware στο μοντέλο User
        const user = await User.create({
            name,
            email,
            password: password, // Χρησιμοποιούμε το κρυπτογραφημένο password
            points: 0, // Αρχικοί πόντοι
            badges: [], // Αρχικά κενό array για τα badges
            level: 1 // Αρχικό επίπεδο
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
    const { email, password } = req.body;
    
    try {       

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // 2. Εύρεση χρήστη με βάση το email
        const user = await User.findOne({ email }).select('+password'); // Επιλέγουμε και το password για σύγκριση

        // 3. Έλεγχος αν ο χρήστης υπάρχει και αν το password είναι σωστό
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id), // Δημιουργία token
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
        try {
            const user = await User.findById(req.user.id);
            
            if (user) {
                const currentLevel = user.level; // Calculate level based on points if not set
                const levelName = getLevelName(currentLevel); // Get level name based on level
                const pointsForNext = getPointsForNextLevel(currentLevel); // Get points needed for next level
                const basePointsCurrentLevel = getPointsForLevel(currentLevel); // Get base points for current level

                const progressData = {
                    currentLevelBasePoints: basePointsCurrentLevel,
                    pointsForNextLevel: pointsForNext,
                };

                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    points: user.points,
                    badges: user.badges,
                    level: currentLevel,
                    levelName: levelName,
                    progress: progressData,
                    createdAt: user.createdAt,
                });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error fetching user profile data:', error);
            res.status(500).json({ message: 'Server Error: Could not fetch user profile' });
        }
    });

module.exports = router;