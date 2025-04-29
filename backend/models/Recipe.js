// backend/models/Recipe.js
const mongoose = require('mongoose');

// Schema για κάθε Review (Παραμένει ίδιο)
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    description: { type: String, required: false },

    // ---> ΕΠΑΝΑΦΟΡΑ: Υλικά ως πίνακας από strings <---
    ingredients: {
        type: [String], // Πίνακας από strings όπως πριν
        required: false
    },
    // ---> ΤΕΛΟΣ ΕΠΑΝΑΦΟΡΑΣ <---

    steps: { // Τα βήματα ήταν ήδη [String]
        type: [String],
        required: false
    },
    category: { // Η κατηγορία παραμένει
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Ορεκτικό', 'Κυρίως Πιάτο', 'Σαλάτα', 'Σούπα', 'Γλυκό', 'Ρόφημα', 'Άλλο']
    },
    user: { // Ο χρήστης παραμένει
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    reviews: [reviewSchema], // Τα reviews παραμένουν
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    // ΟΧΙ πεδίο servings
  },
  {
    timestamps: true, // Τα timestamps παραμένουν
  }
);

module.exports = mongoose.model('Recipe', recipeSchema);