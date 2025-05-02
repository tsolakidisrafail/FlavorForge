// backend/routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { calculateLevel } = require('../utils/gamificationUtils'); // Χρειάζεται για το gamification

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
  } catch (error) { 
    console.error('Error fetching recipes:', error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
});

// POST /api/recipes (Δημιουργία - περιμένει ingredients/steps ως strings που θα γίνουν split)
router.post('/', protect, async (req, res) => {
  try {
  
    const { title, description, servings, ingredients, steps, category } = req.body;

    if (!title || !category || !servings) {
      return res.status(400).json({ message: 'Title, category and servings are required' });
    }

    const newRecipe = new Recipe({
      title: title.trim(),
      description: description?.trim(),
      servings: servings,
      ingredients: ingredients,
      steps: steps,
      category: category,
      user: req.user._id
    });

    const savedRecipe = await newRecipe.save();

    // --- GAMIFICATION LOGIC ---
     try {
         const user = await User.findById(req.user._id);
         if (user) {
              const pointsForNewRecipe = 10;
              user.points = (user.points || 0) + pointsForNewRecipe; // Προσθήκη πόντων για τη νέα συνταγή

              const recipeCount = await Recipe.countDocuments({ user: req.user._id });
              if (recipeCount === 1 && !user.badges.includes('First Recipe')) {
                  user.badges.push('First Recipe'); // Προσθήκη badge για την πρώτη συνταγή
              }

              if (recipeCount === 5 && !user.badges.includes('Master Chef Lvl 1')) {
                  user.badges.push('Master Chef Lvl 1'); // Προσθήκη badge για 5 συνταγές
              }

              const newLevel = calculateLevel(user.points); // Υπολογισμός νέου επιπέδου
              if (newLevel !== user.level) {
                  user.level = newLevel; // Ενημέρωση επιπέδου
                  if (!user.badges.includes(`Level ${newLevel}`)) {
                      user.badges.push(`Level ${newLevel}`); // Προσθήκη badge για νέο επίπεδο
                  }
              }

              await user.save(); // Αποθήκευση αλλαγών στον χρήστη
         }
      } catch (gamificationError) {
          console.error('Gamification error during recipe creation:', gamificationError);
      }
     // --- GAMIFICATION LOGIC END ---

    res.status(201).json(savedRecipe);

  } catch (error) {
    console.error('Error creating recipe:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/recipes/:id (Λεπτομέρειες - παραμένει ίδιο)
router.get('/:id', async (req, res) => {
   try {
     const recipeId = req.params.id;
     if (!mongoose.Types.ObjectId.isValid(recipeId)) { 
      return res.status(400).json({ message: 'Invalid ID' }); 
    }
     const recipe = await Recipe.findById(recipeId).populate('user', 'name level');
     if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
     res.json(recipe);
   } catch (error) { console.error('Error fetching single recipe:', error); res.status(500).json({ message: 'Server Error' }); }
});


// PUT /api/recipes/:id (Ενημέρωση - περιμένει ingredients/steps ως strings)
router.put('/:id', protect, async (req, res) => {
  try {
    const recipeId = req.params.id;
    // ΔΕΝ περιμένουμε servings, τα ingredients/steps έρχονται από textarea
    const { title, description, servings, ingredients, steps, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) { return res.status(400).json({ message: 'Invalid ID' }); }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) { return res.status(404).json({ message: 'Recipe not found' }); }
    if (recipe.user.toString() !== req.user._id.toString()) { return res.status(401).json({ message: 'Not authorized' }); }

    recipe.title = title?.trim() ?? recipe.title;
    recipe.description = description?.trim() ?? recipe.description;
    recipe.servings = servings ?? recipe.servings; // Αν δεν υπάρχει servings, κρατάμε την παλιά τιμή
    recipe.ingredients = ingredients ?? recipe.ingredients; // Αν δεν υπάρχει ingredients, κρατάμε την παλιά τιμή
    recipe.steps = steps ?? recipe.steps; // Αν δεν υπάρχει steps, κρατάμε την παλιά τιμή
    recipe.category = category ?? recipe.category; // Αν δεν υπάρχει category, κρατάμε την παλιά τιμή

     // Έλεγχος αν τα υποχρεωτικά είναι ΟΚ *μετά* την ενημέρωση
     if (!recipe.title || !recipe.category || !recipe.servings) {
         return res.status(400).json({ message: 'Title, category and servings are required after update' });
     }

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);

  } catch (error) {
    console.error('Error updating recipe:', error);
     if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
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
  } catch (error) { 
    console.error('Error deleting recipe:', error); 
    res.status(500).json({ message: 'Server Error' }); 
  }
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

        // --- GAMIFICATION LOGIC ---
         try {
             const reviewUser = await User.findById(req.user._id);
             if (reviewUser) {
                  const pointsForReview = 2;
                  reviewUser.points = (reviewUser.points || 0) + pointsForReview; // Προσθήκη πόντων για τη νέα κριτική

                  if (!reviewUser.badges.includes('First Review')) {
                      const userReviewCount = await Recipe.countDocuments({ 'reviews.user': req.user._id });
                      if (userReviewCount === 1) {
                          reviewUser.badges.push('First Review'); // Προσθήκη badge για την πρώτη κριτική
                      }
                  }

                  const newLevel = calculateLevel(reviewUser.points); // Υπολογισμός νέου επιπέδου
                  if (newLevel !== reviewUser.level) {
                      reviewUser.level = newLevel; // Ενημέρωση επιπέδου
                      if (!reviewUser.badges.includes(`Level ${newLevel}`)) {
                          reviewUser.badges.push(`Level ${newLevel}`); // Προσθήκη badge για νέο επίπεδο
                      }
                  }
                  await reviewUser.save(); // Αποθήκευση αλλαγών στον χρήστη
              }
          } catch (gamificationErrorReviewer) {
              console.error('Gamification error for reviewer:', gamificationErrorReviewer);
          }
         // --- GAMIFICATION LOGIC REVIEWER END ---

         if (recipe.user.toString() !== req.user._id.toString()) {
             const popularRatingThreshold = 4.5; // Κατώφλι για δημοφιλή συνταγή
             const popularReviewCount = 5; // Αριθμός κριτικών για να θεωρηθεί δημοφιλής
             if (recipe.rating >= popularRatingThreshold && recipe.numReviews >= popularReviewCount) {
                 try {
                     const owner = await User.findById(recipe.user);
                     if (owner && !owner.badges.includes('Popular Plate')) {
                         owner.badges.push('Popular Plate'); // Προσθήκη badge για δημοφιλή συνταγή
                         owner.points = (owner.points || 0) + 15; // Προσθήκη πόντων για δημοφιλή συνταγή
                         const ownerNewLevel = calculateLevel(owner.points); // Υπολογισμός νέου επιπέδου
                         if (ownerNewLevel !== owner.level) {
                             owner.level = ownerNewLevel; // Ενημέρωση επιπέδου
                             if (!owner.badges.includes(`Level ${ownerNewLevel}`)) {
                                 owner.badges.push(`Level ${ownerNewLevel}`); // Προσθήκη badge για νέο επίπεδο
                             }
                         }
                         await owner.save(); // Αποθήκευση αλλαγών στον ιδιοκτήτη
                      }
                  } catch (gamificationErrorOwner) {
                      console.error('Gamification error for recipe owner:', gamificationErrorOwner);
                  }
             }
          }

        res.status(201).json({ message: 'Review added' });
    } catch (error) { console.error('Error adding review:', error); res.status(500).json({ message: 'Server Error' }); }
});


module.exports = router;