// backend/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware
const User = require('../models/User'); // Import the User model

// @desc Create a new recipe
// @route GET /api/recipes
// @access Public
router.get('/', async (req, res) => {
    try {
        const searchTerm = req.query.search || ''; // Get the search term from query params
        const categoryFilter = req.query.category || ''; // Get the category filter from query params
        
        let filter = {};

        if (searchTerm) {
            // Use regex to create a case-insensitive search
            filter.title = { $regex: searchTerm, $options: 'i' };
        }

        if (categoryFilter) {
            filter.category = categoryFilter; // Filter by category if provided
        }

        console.log("Fetching recipes with filter:", filter); // Log the filter being used
        const recipes = await Recipe.find(filter);
        
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
        const { title, description, ingredients, steps, category } = req.body;

        if (!title || !category) {
            return res.status(400).json({ message: 'Title and category are required' });
        }

        const newRecipe = new Recipe({
            title,
            description,
            ingredients,
            steps,
            category,
            user: req.user._id // Use the user ID from the request
        });

        const savedRecipe = await newRecipe.save();

        try {
            const user = await User.findById(req.user._id);
            if (user) {
                user.points = (user.points || 0) + 10; // Add points for creating a recipe

                const recipeCount = await Recipe.countDocuments({ user: req.user._id });
                if (recipeCount === 1 && !user.badges.includes('First Recipe')) {
                    user.badges.push('First Recipe'); // Add badge for first recipe
                    console.log(`Awarded 'First Recipe' badge to user ${user.email}`);
                }

                await user.save(); // Save the updated user points and badges
                console.log(`User ${user.email} points updated to ${user.points}`);
            } 
        } catch (gamificationError) {
            console.error('Gamification error after recipe creation:', gamificationError);
        }

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

// @desc Update a recipe by ID
// @route PUT /api/recipes/:id
// @access Private
router.put('/:id', protect, async (req, res) => {
    try {
        const recipeId = req.params.id;
        const { title, description, ingredients, steps, category } = req.body;

        // Check if the recipe ID is valid
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: 'Invalid Recipe ID format' });
        }

        // Find the recipe by ID
        const recipe = await Recipe.findById(recipeId);

        // Check if the recipe exists
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if the user is the owner of the recipe
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to update this recipe' });
        }

        // Check if the title is provided
        if (!title || !category) {
            return res.status(400).json({ message: 'Title and category are required' });
        }

        // Update the recipe fields
        recipe.title = title || recipe.title;
        recipe.description = description || recipe.description;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.steps = steps || recipe.steps;
        recipe.category = category || recipe.category;

        // Save the updated recipe
        const updatedRecipe = await recipe.save();
        res.json(updatedRecipe);
    } catch (error) {
        console.error('Error updating recipe:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error: Could not update recipe' });
    }
});

// @desc Delete a recipe by ID
// @route DELETE /api/recipes/:id
// @access Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const recipeId = req.params.id;

        // Check if the recipe ID is valid
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: 'Invalid Recipe ID format' });
        }

        // Find the recipe by ID
        const recipe = await Recipe.findById(recipeId);

        // Check if the recipe exists
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if the user is the owner of the recipe
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this recipe' });
        }

        // Delete the recipe
        await recipe.deleteOne();

        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ message: 'Server Error: Could not delete recipe' });
    }
});

// @desc Add a review to a recipe
// @route POST /api/recipes/:id/reviews
// @access Private
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ message: 'Rating and comment are required' });
    }
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    try {
        const recipeId = req.params.id;

        // Βρίσκει τη συνταγή στην οποία θα προστεθεί η κριτική
        const recipe = await Recipe.findById(recipeId);

        if (recipe) {
            const alreadyReviewed = recipe.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                res.status(400).json({ message: 'Recipe already reviewed' });
                return;
            }

            const review = {
                name: req.user.name,
                rating: numericRating,
                comment: comment,
                user: req.user._id,
            };

            recipe.reviews.push(review);
            recipe.numReviews = recipe.reviews.length;

            recipe.rating =
                recipe.reviews.reduce((acc, item) => item.rating + acc, 0) /
                recipe.reviews.length;
            await recipe.save();

            try {
                const user = await User.findById(req.user._id);
                if (user) {
                    user.points = (user.points || 0) + 2; // Add points for reviewing a recipe

                    if (!user.badges.includes('First Review')) {
                        user.badges.push('First Review'); // Add badge for first review
                        console.log(`Awarded 'First Review' badge to user ${user.email}`);
                    }

                    await user.save(); // Save the updated user points and badges
                    console.log(`User ${user.email} points updated to ${user.points}`);
                }
            } catch (gamificationError) {
                console.error('Gamification error after review creation:', gamificationError);
            }

            res.status(201).json({ message: 'Review added successfully' });
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        console.error('Error adding review:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error: Could not add review' });
    }
});

module.exports = router;