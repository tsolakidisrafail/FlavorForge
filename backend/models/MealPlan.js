// backend/models/MealPlan.js
const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  recipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: false
  }]
}, { _id: false });

// The arrayLimit function checks if the length of the array is exactly 7
// This is used to validate the days array in the meal plan schema
const arrayLimit = (val) => {
  return val.length === 7;
};

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    days: {
      type: [daySchema],
      required: true,
      default: () => Array.from({ length: 7 }, () => ({ recipes: [] })),
      validate: [arrayLimit, '{PATH} must have exactly 7 days']
    },
}
, { timestamps: true }
);

// Ensure that the user and weekStartDate combination is unique
// This ensures that a user cannot have multiple meal plans for the same week
mealPlanSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);