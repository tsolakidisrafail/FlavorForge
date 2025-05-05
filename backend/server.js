// backend/server.js
const mongoose = require('mongoose');
const express = require('express');
const mealPlanRoutes = require('./routes/mealPlanRoutes'); // Import the meal plan routes
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT || 3001;

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

app.get('/', (req, res) => {
    res.send('Hello from FlavorForge Backend!');
});

app.use('/api/users', require('./routes/userRoutes')); // Mount the user routes
app.use('/api/recipes', require('./routes/recipeRoutes')); // Mount the recipe routes
app.use('/api/mealplans', mealPlanRoutes); // Mount the meal plan routes

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});