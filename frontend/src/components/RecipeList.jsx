// frontend/src/components/RecipeList.jsx
import React, { useEffect, useState } from 'react';

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the backend API
    fetch('/api/recipes')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setRecipes(data);
        setLoading(false);
      })
        .catch((error) => {
            console.error('Error fetching recipes:', error);
            setError(error.message);
            setLoading(false);
        });
  }, []);

  if (loading) {
    return <div>Loading recipes...</div>;
  }

  if (error) {
    return <div>Error loading recipes: {error}</div>;
  }

  return (
    <div>
        <h2>Συνταγές</h2>
        {recipes.length > 0 ? (
            <ul>
                {recipes.map(recipe => (
                    <li key={recipe.id}>
                        <h3>{recipe.title}</h3>
                        <p>{recipe.description}</p>
                    </li>
                ))}
            </ul>
        ) : (
        <p>Δεν βρέθηκαν συνταγές.</p>
        )}
    </div>
    );
}

export default RecipeList;