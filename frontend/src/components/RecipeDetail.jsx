// frontend/src/components/RecipeDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function RecipeDetail() {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/api/recipes/${id}`)
            .then(response => {
                if (!response.ok) {
                    if(response.status === 404) {
                        throw new Error('Recipe not found');
                    }
                    throw new Error(`HTTP Error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setRecipe(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching recipe details:', error);
                setError(error.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div>Loading recipe details...</div>;
    }

    if (error) {
        return <div>Error: {error === 'Recipe not found' ? 'Η συνταγή δεν βρέθηκε.' : error}</div>;
    }

    if (!recipe) {
        return <div>Recipe data is unavailable.</div>;
    }


    return (
        <div>
            <h2>{recipe.title}</h2>
            <p>{recipe.description}</p>

            <h3>Συστατικά:</h3>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>
            ) : (
                <p>Δεν έχουν καταχωρηθεί συστατικά.</p>
            )}

            <h3>Βήματα:</h3>
            {recipe.steps && recipe.steps.length > 0 ? (
                <ol>
                    {recipe.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ol>
            ) : (
                <p>Δεν έχουν καταχωρηθεί βήματα.</p>
            )}
            <br />
            <Link to="/">Επιστροφή στη λίστα συνταγών</Link>
        </div>
    );
}

export default RecipeDetail;