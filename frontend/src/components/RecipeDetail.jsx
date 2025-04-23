// frontend/src/components/RecipeDetail.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Button from '@mui/material/Button';

function RecipeDetail() {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id: recipeId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/api/recipes/${recipeId}`)
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
    }, [recipeId]);

    const handleDelete = async () => {
        if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη συνταγή; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.')) {
            return;
        }

        if (!user || !user.token) {
            setError('Απαιτείται σύνδεση για να διαγράψετε τη συνταγή.');
            return;
        }

        try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                let errorMsg = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(errorMsg);
            }

            console.log('Recipe deleted successfully');
            navigate('/'); // Redirect to the home page after deletion
        } catch (err) {
            console.error('Failed to delete recipe:', err);
            setError(err.message || 'Η διαγραφή απέτυχε.');
        
    }
        console.log("Delete button clicked");
    };

    const handleEdit = () => {
        console.log("Edit button clicked, navigating...");
        navigate(`/recipes/${recipeId}/edit`);
    }

    const hasUserReviewed = recipe && user && recipe.reviews.some(review => review.user === user._id);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        setReviewError(null);

        if (!user || !user.token) {
            setReviewError("Απαιτείται σύνδεση για να υποβάλετε μια αξιολόγηση.");
            setReviewLoading(false);
            return;
        }
        if (newRating === 0 || !newComment.trim()) {
            setReviewError("Παρακαλώ δώστε μια βαθμολογία και ένα σχόλιο.");
            setReviewLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/recipes/${recipeId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ rating: newRating, comment: newComment })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! Status: ${response.status}`);
            }

            setReviewLoading(false);
            setNewRating(0);
            setNewComment('');
            alert ('Η αξιολόγηση υποβλήθηκε επιτυχώς! Κάντε refresh για να τη δείτε.');

        } catch (err) {
            console.error('Failed to submit review:', err);
            setReviewError(err.message || 'Η υποβολή της αξιολόγησης απέτυχε.');
            setReviewLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error === 'Recipe not found' ? 'Η συνταγή δεν βρέθηκε.' : error}</div>;
    }

    if (!recipe) {
        return <div>Recipe data is unavailable.</div>;
    }

    console.log('Checking ownership...');
    console.log('Logged-in User (from context):', user);
    console.log('Fetched Recipe Data:', recipe);

    const isOwner = user && recipe && recipe.user && user._id === recipe.user;
    console.log('Is Owner:', isOwner);

    return (
        <div>
            <h2>{recipe.title}</h2>
            <div>
                Βαθμολογία: {recipe.rating ? recipe.rating.toFixed(1) : 'N/A'} / 5 ({recipe.numReviews || 0} αξιολογήσεις)
            </div>
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

            {isOwner && (
                <div>
                    <button onClick={handleEdit} style={{ marginRight: '10px' }}>Επεξεργασία</button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Διαγραφή
                    </Button>
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />
            <h3>Αξιολογήσεις & Σχόλια ({recipe.numReviews || 0})</h3>
            {recipe.reviews && recipe.reviews.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {recipe.reviews.map((review) => (
                        <li key={review._id} style={{ borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '15px' }}>
                            <strong>{review.name}</strong>
                            <div style={{ color: '#f8d00b'}}>
                                Βαθμολογία: {review.rating}/5
                            </div>
                            <p>{review.comment}</p>
                            <small style={{ color: 'grey' }}>
                                Στις: {new Date(review.createdAt).toLocaleDateString()}
                            </small>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Δεν υπάρχουν αξιολογήσεις ή σχόλια για αυτή τη συνταγή.</p>
            )}

            <hr style={{ margin: '20px 0' }} />
            <h3>Προσθήκη Αξιολόγησης</h3>
            {user ? ( 
                hasUserReviewed ? (
                <p>Έχετε ήδη υποβάλει μια αξιολόγηση για αυτή τη συνταγή.</p>
            ) : (
                <form onSubmit={handleReviewSubmit}>
                    {reviewError && <p style={{ color: 'red' }}>{reviewError}</p>}
                    <div>
                        <label htmlFor="rating">Βαθμολογία:</label>
                        <select
                            id="rating"
                            value={newRating}
                            onChange={(e) => setNewRating(Number(e.target.value))}
                            required
                            disabled={reviewLoading}
                        >
                            <option value={0}>Επιλέξτε...</option>
                            <option value={1}>1 - Κακή</option>
                            <option value={2}>2 - Μέτρια</option>
                            <option value={3}>3 - Καλή</option>
                            <option value={4}>4 - Πολύ Καλή</option>
                            <option value={5}>5 - Εξαιρετική</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="comment">Σχόλιο:</label>
                        <textarea
                            id="comment"
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                            disabled={reviewLoading}
                        />
                    </div>
                    <button type="submit" disabled={reviewLoading}>
                        {reviewLoading ? 'Υποβολή...' : 'Υποβολή Αξιολόγησης'}
                    </button>
                </form>
            )
            ) : (
            <p>Παρακαλώ <Link to="/login">συνδεθείτε </Link>για να προσθέσετε αξιολόγηση.</p>
            )}

            <br />
            <Link to="/">Επιστροφή στη λίστα συνταγών</Link>
        </div>
    );
}

export default RecipeDetail;