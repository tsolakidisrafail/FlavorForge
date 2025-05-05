// backend/routes/mealPlanRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan'); // Import το νέο model
const Recipe = require('../models/Recipe'); // Θα χρειαστεί για populate
const { protect } = require('../middleware/authMiddleware'); // Προστασία routes

// --- GET /api/mealplans?weekStartDate=YYYY-MM-DD ---
// Λήψη του πλάνου για μια συγκεκριμένη εβδομάδα για τον συνδεδεμένο χρήστη
router.get('/', protect, async (req, res) => {
    try {
        const { weekStartDate } = req.query;

        // Validation της ημερομηνίας
        if (!weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
            return res.status(400).json({ message: 'Please provide a valid weekStartDate in YYYY-MM-DD format' });
        }

        // Μετατροπή σε Date object (UTC για συνέπεια)
        const startDate = new Date(weekStartDate + 'T00:00:00.000Z'); // Προσθήκη ώρας για να γίνει UTC

        // Εύρεση του πλάνου
        let mealPlan = await MealPlan.findOne({
            user: req.user._id,
            weekStartDate: startDate
        })
        // Populate τις συνταγές
        .populate({
             path: 'days.recipes', // Το path μέσα στο mealPlan document
             model: 'Recipe',      // Το model για populate
             select: 'title category _id' // Επιλογή πεδίων (πρόσθεσα το _id)
         });

        // Αν δεν βρεθεί πλάνο, επιστρέφεται μια default δομή
        if (!mealPlan) {
            mealPlan = {
                _id: null, // Δείχνει ότι δεν υπάρχει στη βάση
                user: req.user._id,
                weekStartDate: startDate,
                days: Array.from({ length: 7 }, () => ({ recipes: [] })) // 7 μέρες με κενά recipes
            };
        }

        res.json(mealPlan);

    } catch (error) {
        console.error('Error fetching meal plan:', error);
        res.status(500).json({ message: 'Server Error fetching meal plan' });
    }
});


// --- POST /api/mealplans ---
// Δημιουργία ή Ενημέρωση (Upsert) ενός εβδομαδιαίου πλάνου
router.post('/', protect, async (req, res) => {
    try {
        let { weekStartDate, days } = req.body; // Το days να μπορεί να αλλάξει

        // Validation
        if (!weekStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
            return res.status(400).json({ message: 'Please provide a valid weekStartDate in YYYY-MM-DD format' });
        }
        if (!days || !Array.isArray(days) || days.length !== 7) {
             return res.status(400).json({ message: 'Invalid data: days array must have 7 elements.' });
        }

        const startDate = new Date(weekStartDate + 'T00:00:00.000Z'); // UTC Date

        // Προετοιμασία του 'days' array - κράτα μόνο τα IDs των συνταγών
        const formattedDays = days.map(day => ({
            recipes: (day.recipes || []) // Έλεγχος αν υπάρχει το recipes array
                       .map(recipe => recipe?._id ?? recipe) // Πάρε το _id αν είναι object, αλλιώς πάρε την τιμή (αν είναι ήδη ID)
                       .filter(id => mongoose.Types.ObjectId.isValid(id)) // Κράτα μόνο τα έγκυρα ObjectIds
        }));

        // Upsert: Ενημέρωσε αν υπάρχει, δημιούργησε αν δεν υπάρχει
        const updatedPlan = await MealPlan.findOneAndUpdate(
            { user: req.user._id, weekStartDate: startDate }, // Πώς θα βρεθεί το πλάνο
            { $set: { days: formattedDays, user: req.user._id, weekStartDate: startDate } }, // Τι θα ενημερωθεί/δημιουργηθεί
            {
                new: true, // Επιστροφή του νέου εγγράφου
                upsert: true, // Δημιουργία αν δεν βρεθεί
                runValidators: true, // Εκτέλεση των Mongoose validators
                setDefaultsOnInsert: true // Εφαρμογή των defaults του schema κατά τη δημιουργία
            }
        )
        .populate({ // Populate και το αποτέλεσμα
             path: 'days.recipes',
             model: 'Recipe',
             select: 'title category _id'
         });


        res.status(200).json(updatedPlan);

    } catch (error) {
        console.error('Error saving meal plan:', error);
         if (error.name === 'ValidationError') {
           const messages = Object.values(error.errors).map(val => val.message);
           return res.status(400).json({ message: "Validation Error", errors: messages });
         }
        res.status(500).json({ message: 'Server Error saving meal plan' });
    }
});


module.exports = router;