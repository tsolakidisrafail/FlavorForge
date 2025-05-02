// backend/models/Recipe.js
const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    quantity: { 
      type: Number,
      required: false
    },
    unit: {
      type: String,
      required: false,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true
    },
    notes: {
      type: String,
      required: false,
      trim: true
    }
  }, { _id: false }); // Ορίζουμε το _id ως false για να μην δημιουργείται αυτόματα id για κάθε στοιχείο του πίνακα

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
    description: { 
      type: String, 
      required: false 
    },
    servings: {
      type: Number,
      required: [true, 'Please add the number of servings'],
      min: [1, 'Servings must be at least 1'],
      default: 4
    },
    // --- ΕΝΗΜΕΡΩΜΕΝΟ: Συστατικά ως Πίνακας Αντικειμένων ---
    ingredients: [ingredientSchema], // Χρησιμοποιούμε το ingredientSchema εδώ
    // ---
    steps: { 
        type: [String],
        required: false
    },
    category: { 
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Ορεκτικό', 'Κυρίως Πιάτο', 'Σαλάτα', 'Σούπα', 'Γλυκό', 'Ρόφημα', 'Άλλο']
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    reviews: [reviewSchema], 
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recipe', recipeSchema);