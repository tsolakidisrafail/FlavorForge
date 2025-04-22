// frontend/src/components/RecipeForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RecipeForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [steps, setSteps] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!title.trim()) {
            setError('Ο τίτλος είναι υποχρεωτικός');
            setLoading(false);
            return;
        }

        const newRecipeData = {
            title,
            description,
            ingredients: ingredients.split('\n').filter(line => line.trim() !== ''),
            steps: steps.split('\n').filter(line => line.trim() !== '')
        };

        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newRecipeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'HTTP error! status: ${response.status}');
            }

            const savedRecipe = await response.json();
            console.log('Recipe saved:', savedRecipe);
            navigate('/');

        } catch (err) {
            console.error('Failed to submit recipe:', err);
            setError(err.message || 'Αποτυχία αποστολής της συνταγής');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Προσθήκη Νέας Συνταγής</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="title">Τίτλος:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="description">Περιγραφή:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="ingredients">Συστατικά (ένα ανά γραμμή):</label>
                <textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    rows="5"
                />
            </div>
            <div>
                <label htmlFor="steps">Βήματα (ένα ανά γραμμή):</label>
                <textarea
                    id="steps"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    rows="8"
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Αποθήκευση...' : 'Αποθήκευση Συνταγής'}
            </button>
        </form>
    );
}

export default RecipeForm;