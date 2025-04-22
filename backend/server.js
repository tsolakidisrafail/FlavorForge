// backend/server.js
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const Recipe = require('./models/Recipe');

// Sample hardcoded data (replace with DB call later)
const sampleRecipes = [
    { id: 1, title: "Μακαρόνια με Κιμά", description: "Κλασική συνταγή..."},
    { id: 2, title: "Φακές Σούπα", description: "Θρεπτική και εύκολη..."},
    { id: 3, title: "Κοτόπουλο στο Φούρνο", description: "Με πατάτες..."}
];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

connectDB();

// API endpoint to get all recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes from DB:', error);
        res.status(500).json({ message: 'Server Error: Unable to fetch recipes' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello from FlavorForge Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});