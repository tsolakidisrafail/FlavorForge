// backend/server.js
const mongoose = require('mongoose');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT || 3001;
const Recipe = require('./models/Recipe');

require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

connectDB();



app.post('/api/recipes', async (req, res) => {
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
            // userID
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

// API endpoint to get all recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes from DB:', error);
        res.status(500).json({ message: 'Server Error: Could not fetch recipes' });
    }
});

app.get('/api/recipes/:id', async (req, res) => {
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
        console.error('Error fetching single recipe:', error);
        res.status(500).json({ message: 'Server Error: Could not fetch recipe' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello from FlavorForge Backend!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});