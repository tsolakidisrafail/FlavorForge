// backend/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User'); // Χρειάζεται για το gamification
const { protect } = require('../middleware/authMiddleware');

// GET /api/recipes (με search/category filter - παραμένει ίδιο)
router.get('/', async (req, res) => {
  try {
    const searchTerm = req.query.search || '';
    const categoryFilter = req.query.category || '';
    let filter = {};
    if (searchTerm) { filter.title = { $regex: searchTerm, $options: 'i' }; }
    if (categoryFilter) { filter.category = categoryFilter; }
    console.log("Fetching recipes with filter:", filter);
    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (error) { console.error('Error fetching recipes:', error); res.status(500).json({ message: 'Server Error' }); }
});

// POST /api/recipes (Δημιουργία - περιμένει ingredients/steps ως strings που θα γίνουν split)
router.post('/', protect, async (req, res) => {
  try {
    // ΔΕΝ περιμένουμε servings, τα ingredients/steps έρχονται από textarea (πρέπει να γίνουν split)
    const { title, description, ingredients, steps, category } = req.body;

    if (!title || !category) { // Δεν ελέγχουμε servings/ingredients εδώ άμεσα
      return res.status(400).json({ message: 'Title and category are required' });
    }

    const newRecipe = new Recipe({
      title: title.trim(),
      description: description.trim(),
      // Μετατροπή από string (ένα ανά γραμμή) σε πίνακα
      ingredients: ingredients ? ingredients.split('\n').filter(line => line.trim() !== '') : [],
      steps: steps ? steps.split('\n').filter(line => line.trim() !== '') : [],
      category,
      // ΟΧΙ servings
      user: req.user._id
    });

    const savedRecipe = await newRecipe.save();

    // --- GAMIFICATION LOGIC (παραμένει ίδιο) ---
     try {
         const user = await User.findById(req.user._id);
         if (user) {
             user.points = (user.points || 0) + 10;
             const recipeCount = await Recipe.countDocuments({ user: req.user._id });
             if (recipeCount === 1 && !user.badges.includes('First Recipe')) { user.badges.push('First Recipe'); }
             await user.save();
         }
     } catch (gamificationError) { console.error('Gamification error:', gamificationError); }
     // --- GAMIFICATION LOGIC END ---

    res.status(201).json(savedRecipe);

  } catch (error) {
    console.error('Error creating recipe:', error);
    if (error.name === 'ValidationError') { return res.status(400).json({ message: 'Validation Error', errors: error.errors }); }
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/recipes/:id (Λεπτομέρειες - παραμένει ίδιο)
router.get('/:id', async (req, res) => {
   try {
     const recipeId = req.params.id;
     if (!mongoose.Types.ObjectId.isValid(recipeId)) { return res.status(400).json({ message: 'Invalid ID' }); }
     const recipe = await Recipe.findById(recipeId); //.populate('user', 'name email'); // Optional populate
     if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
     res.json(recipe);
   } catch (error) { console.error('Error fetching single recipe:', error); res.status(500).json({ message: 'Server Error' }); }
});


// PUT /api/recipes/:id (Ενημέρωση - περιμένει ingredients/steps ως strings)
router.put('/:id', protect, async (req, res) => {
  try {
    const recipeId = req.params.id;
    // ΔΕΝ περιμένουμε servings, τα ingredients/steps έρχονται από textarea
    const { title, description, ingredients, steps, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) { return res.status(400).json({ message: 'Invalid ID' }); }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
    if (recipe.user.toString() !== req.user._id.toString()) { return res.status(401).json({ message: 'Not authorized' }); }

    // Ενημέρωσε τα πεδία
    recipe.title = title?.trim() ?? recipe.title; // Χρησιμοποίησε ?? για να επιτρέπεις κενό string αν θέλεις
    recipe.description = description?.trim() ?? recipe.description;
    // Μετατροπή string σε πίνακα κατά την ενημέρωση
    recipe.ingredients = ingredients ? ingredients.split('\n').filter(line => line.trim() !== '') : recipe.ingredients;
    recipe.steps = steps ? steps.split('\n').filter(line => line.trim() !== '') : recipe.steps;
    recipe.category = category ?? recipe.category;
    // ΟΧΙ servings

     // Έλεγχος αν τα υποχρεωτικά είναι ΟΚ *μετά* την ενημέρωση
     if (!recipe.title || !recipe.category) {
         return res.status(400).json({ message: 'Title and category are required after update' });
     }

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);

  } catch (error) {
    console.error('Error updating recipe:', error);
     if (error.name === 'ValidationError') { return res.status(400).json({ message: 'Validation Error', errors: error.errors }); }
    res.status(500).json({ message: 'Server Error' });
  }
});


// DELETE /api/recipes/:id (Διαγραφή - παραμένει ίδιο)
router.delete('/:id', protect, async (req, res) => {
  try {
    const recipeId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(recipeId)) { return res.status(400).json({ message: 'Invalid ID' }); }
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
    if (recipe.user.toString() !== req.user._id.toString()) { return res.status(401).json({ message: 'Not authorized' }); }
    await recipe.deleteOne();
    res.json({ message: 'Recipe removed' });
  } catch (error) { console.error('Error deleting recipe:', error); res.status(500).json({ message: 'Server Error' }); }
});

// POST /api/recipes/:id/reviews (Προσθήκη review - παραμένει ίδιο)
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    if (!rating || !comment || isNaN(numericRating) || numericRating < 1 || numericRating > 5) { return res.status(400).json({ message: 'Valid rating (1-5) and comment are required' }); }

    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
        const alreadyReviewed = recipe.reviews.some(r => r.user.toString() === req.user._id.toString());
        if (alreadyReviewed) { return res.status(400).json({ message: 'Already reviewed' }); }

        const review = { name: req.user.name, rating: numericRating, comment, user: req.user._id };
        recipe.reviews.push(review);
        recipe.numReviews = recipe.reviews.length;
        recipe.rating = recipe.reviews.reduce((acc, item) => item.rating + acc, 0) / recipe.reviews.length;
        await recipe.save();

        // --- GAMIFICATION LOGIC (παραμένει ίδιο) ---
         try {
             const user = await User.findById(req.user._id);
             if (user) {
                 user.points = (user.points || 0) + 2;
                 if (!user.badges.includes('First Review')) { user.badges.push('First Review');}
                 await user.save();
             }
         } catch (gamificationError) { console.error('Gamification error after review:', gamificationError); }
         // --- GAMIFICATION LOGIC END ---

        res.status(201).json({ message: 'Review added' });
    } catch (error) { console.error('Error adding review:', error); res.status(500).json({ message: 'Server Error' }); }
});


module.exports = router;