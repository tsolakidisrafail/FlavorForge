// frontend/src/components/RecipeDetail.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import StarIcon from '@mui/icons-material/Star';

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
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !recipe) {
        return <Alert severity="error" sx={{ mt: 2 }}>Σφάλμα: {error === 'Recipe not found' ? 'Η συνταγή δεν βρέθηκε.' : error}</Alert>;
    }

    if (!recipe) {
        return <Alert severity="warning" sx={{ mt: 2 }}>Δεν βρέθηκαν δεδομένα συνταγής.</Alert>;
    }

    console.log('Checking ownership...');
    console.log('Logged-in User (from context):', user);
    console.log('Fetched Recipe Data:', recipe);

    const isOwner = user && recipe && recipe.user && user._id === recipe.user;
    console.log('Is Owner:', isOwner);

    return (
        <Box sx={{ my: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                {recipe.title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                    name="recipe-rating"
                    value={recipe.rating || 0}
                    precision={0.5}
                    readOnly
                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                />
                <Typography variant="body1" sx={{ ml: 1 }}>
                    ({recipe.numReviews || 0} αξιολογήσεις)
                </Typography>
            </Box>

            <Typography variant="body1" gutterBottom>
                {recipe.description}
            </Typography>

            {isOwner && (
                <Box sx={{ mb: 2 }}>
                    <Button variant="outlined" onClick={handleEdit} sx={{ mr: 1 }}>
                        Επεξεργασία
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Διαγραφή
                    </Button>
                </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h5" component="h3" gutterBottom>
                Συστατικά
            </Typography>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <List dense>
                    {recipe.ingredients.map((ingredient, index) => (
                        <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: '35px' }}>
                                <RestaurantMenuIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={ingredient} />
                        </ListItem>
                    ))}
                </List>
            ) : ( <Typography variant="body2" color="text.secondary">Δεν υπάρχουν.</Typography> )}

            
            <Divider sx={{ my: 2 }} />

            <Typography variant="h5" component="h3" gutterBottom>
                Βήματα
            </Typography>
            {recipe.steps && recipe.steps.length > 0 ? (
                <List>
                    {recipe.steps.map((step, index) => (
                        <ListItem key={index} alignItems="flex-start">
                            <ListItemIcon sx={{ minWidth: '35px', mt: '4px'}}>
                                <FormatListNumberedIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={`${index + 1}. ${step}`} />
                        </ListItem>
                    ))}
                </List>
                ) : ( <Typography variant="body2" color="text.secondary">Δεν υπάρχουν.</Typography> )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h5" component="h3" gutterBottom>
                    Αξιολογήσεις & Σχόλια ({recipe.numReviews || 0})
                </Typography>
                {recipe.reviews && recipe.reviews.length > 0 ? (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {recipe.reviews.map((review, index) => (
                            <React.Fragment key={review._id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ mr: 1 }}>{review.name}</Typography>
                                                <Rating name={`review-rating-${review._id}`} value={review.rating} readOnly size="small" />
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {review.comment}
                                                </Typography>
                                                <Typography component="span" display="block" variant="caption" color="text.secondary">
                                                    - {new Date(review.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                                {index < recipe.reviews.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Δεν υπάρχουν αξολογήσεις ακόμα.</Typography>
                )}

                <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
                    <Typography variant="h6" component="h4" gutterBottom>
                        Προσθήκη Αξιολόγησης
                    </Typography>
                    {user ? (
                        hasUserReviewed ? (
                            <Typography variant="body2">Έχετε ήδη αξιολογήσει αυτή τη συνταγή.</Typography>
                        ) : (
                            <Box component="form" onSubmit={handleReviewSubmit} noValidate sx={{ mt: 1 }}>
                                {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
                                <Box sx={{ mb: 2 }}>
                                    <Typography component="legend">Βαθμολογία:</Typography>
                                    <Rating
                                        name="new-rating"
                                        value={newRating}
                                        onChange={( _ , newValue) => {
                                            setNewRating(newValue);
                                        }}
                                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                    />
                                </Box>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="comment"
                                    label="Το σχόλιο σας"
                                    name="comment"
                                    multiline
                                    rows={4}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={reviewLoading}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={reviewLoading || newRating === 0}
                                    sx={{ mt: 1, mb: 1}}
                                >
                                    {reviewLoading ? 'Υποβολή...' : 'Υποβολή Αξιολόγησης'}
                                </Button>
                            </Box>
                        )
                    ) : (
                        <Typography variant="body2">
                            Παρακαλώ <RouterLink to="/login">συνδεθείτε</RouterLink> για να υποβάλετε μια αξιολόγηση.
                        </Typography>
                    )}
                </Paper>

                <Button component={RouterLink} to="/" sx={{ mt: 3 }}>
                    Επιστροφή στη Λίστα Συνταγών
                </Button>
            </Box>
        );
}

export default RecipeDetail;