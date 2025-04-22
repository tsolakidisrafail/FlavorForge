// backend/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware

// @desc Create a new recipe
// @route GET /api/recipes
// @access Public
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes from DB:', error);
        res.status(500).json({ message: 'Server Error: Could not fetch recipes' });
    }
});

// @desc Create a new recipe
// @route POST /api/recipes
// @access Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, ingredients, steps } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            steps,
            user: req.user._id // Use the user ID from the request
        });

        const savedRecipe = await newRecipe.save();

        res.status(201).json(savedRecipe);

    } catch (error) {
        console.error('Error creating recipe:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error: Could not create recipe' });
    }
});

// @desc Get a recipe by ID
// @route GET /api/recipes/:id
// @access Public
router.get('/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: 'Invalid Recipe ID format' });
        }
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ message: 'Server Error: Could not fetch recipe' });
    }
});

module.exports = router;