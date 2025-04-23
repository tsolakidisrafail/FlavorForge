// frontend/src/components/RecipeEditForm.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function RecipeEditForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState(['']);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { id: recipeId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        setInitialLoading(true);
        fetch(`/api/recipes/${recipeId}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch recipe data');
                return res.json();
            })
            .then(data => {
                setTitle(data.title);
                setDescription(data.description || '');
                setIngredients(data.ingredients ? data.ingredients.join('\n') : '');
                setSteps(data.steps ? data.steps.join('\n') : '');
                setInitialLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError("Αποτυχία φόρτωσης δεδομένων συνταγής.");
                setInitialLoading(false);
            });
    }, [recipeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!user || !user.token) {
            setError('Απαιτείται σύνδεση για να επεξεργαστείτε τη συνταγή.');
            setLoading(false);
            return;
        }
        if (!title.trim()) {
            setError('Ο τίτλος είναι υποχρεωτικός.');
            setLoading(false);
            return;
        }

        const updatedRecipeData = {
            title,
            description,
            ingredients: ingredients.split('\n').filter(line => line.trim() !== ''),
            steps: steps.split('\n').filter(line => line.trim() !== '')
        };

        try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(updatedRecipeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'HTTP error! status: ${response.status}');
            }

            console.log('Recipe updated successfully');
            navigate(`/recipes/${recipeId}`); // Redirect to the recipe detail page after successful update

        } catch (err) {
            console.error('Failed to update recipe:', err);
            setError(err.message || 'Η ενημέρωση απέτυχε.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div>Loading recipe data for editing...</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Επεξεργασία Συνταγής</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="edit-title">Τίτλος:</label>
                <input type="text" id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
                <label htmlFor="edit-description">Περιγραφή:</label>
                <textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
                <label htmlFor="edit-ingredients">Συστατικά (ένα ανά γραμμή):</label>
                <textarea id="edit-ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows="5" />
            </div>
            <div>
                <label htmlFor="edit-steps">Βήματα (ένα ανά γραμμή):</label>
                <textarea id="edit-steps" value={steps} onChange={(e) => setSteps(e.target.value)} rows="8" />
            </div>
            <button type="submit" disabled={loading || initialLoading}>
                {loading ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}
            </button>
        </form>
    );
}

export default RecipeEditForm;