// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Do not return the password by default
    },
    points: {
        type: Number,
        default: 0 // Default points for new users
    },
    badges: {
        type: [String], // Array of strings to store badge names
        default: [] // Default empty array for badges
    },
    level: {
        type: Number,
        default: 1 // Default level for new users
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware (hook) του Mongoose: Κρυπτογράφηση του password πριν την αποθήκευση
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // Αν το password δεν έχει τροποποιηθεί, προχωράμε στο επόμενο middleware
    }

    try {
        const salt = await bcrypt.genSalt(10); // Δημιουργία salt
        this.password = await bcrypt.hash(this.password, salt); // Κρυπτογράφηση του password
        next(); // Προχωράμε στο επόμενο middleware
    } catch (error) {
        next(error); // Αν υπάρχει σφάλμα, το περνάμε στο επόμενο middleware
    }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Σύγκριση του κρυπτογραφημένου password με το εισαγόμενο password
};


module.exports = mongoose.model('User', userSchema); // Εξαγωγή του μοντέλου User