// frontend/src/components/RecipeDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
// MUI Imports
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// Context Imports
import SnackbarContext from '../context/SnackbarContext';
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
import StarIcon from '@mui/icons-material/Star';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

function RecipeDetail() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: recipeId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme(); // Ensure useTheme is called at the top level
  const { showSnackbar } = useContext(SnackbarContext); // Assuming SnackbarContext is set up

  // State for review form
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);


  // Fetch recipe data
  useEffect(() => {
      const fetchRecipeDetails = async () => { // Added async
          setLoading(true);
          setError(null);
          try {
              const response = await fetch(`/api/recipes/${recipeId}`);
              if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
              }
              const data = await response.json();
              setRecipe(data);
          } catch (err) {
              setError(err.message || "Failed to load recipe details.");
          } finally {
              setLoading(false);
          }
      };
      fetchRecipeDetails();
  }, [recipeId]); // Refetch if recipeId changes


  const handleDelete = async () => {
       if (!window.confirm('Είστε σίγουροι;')) return;
       if (!user || !user.token) { setError('Απαιτείται σύνδεση.'); return; }
       try {
           const response = await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${user.token}` } });
           if (!response.ok) { throw new Error((await response.json()).message || 'Failed to delete'); }
           showSnackbar('Η συνταγή διαγράφηκε.', 'success');
           navigate('/');
       } catch (err) { setError(err.message); showSnackbar(err.message, 'error'); }
   };

  const handleEdit = () => {
    navigate(`/recipes/${recipeId}/edit`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating === 0 || !newComment.trim()) { setReviewError("Βαθμολογία και σχόλιο απαιτούνται."); return; }
    if (!user || !user.token) { setReviewError("Απαιτείται σύνδεση."); return; }
    setReviewLoading(true); setReviewError(null);
    try {
        const response = await fetch(`/api/recipes/${recipeId}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}`}, body: JSON.stringify({ rating: newRating, comment: newComment }) });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || 'Failed to submit review'); }
        setNewRating(0); setNewComment('');
        showSnackbar('Η αξιολόγηση καταχωρήθηκε!', 'success');
        // Trigger refetch of recipe data to show new review
         setLoading(true); // Set loading to trigger useEffect refetch indirectly (or call fetchRecipeDetails directly)
         const refetchResponse = await fetch(`/api/recipes/${recipeId}`);
         const refetchData = await refetchResponse.json();
          if (refetchResponse.ok) setRecipe(refetchData);
         setLoading(false);

    } catch (err) { setReviewError(err.message); showSnackbar(err.message, 'error'); }
    finally { setReviewLoading(false); }
  };

  if (loading) { return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> ); }
  if (error && !recipe) { return <Alert severity="error" sx={{ mt: 2 }}>Σφάλμα: {error === 'Recipe not found' ? 'Η συνταγή δεν βρέθηκε.' : error}</Alert>; }
  if (!recipe) { return <Alert severity="warning" sx={{ mt: 2 }}>Δεν βρέθηκαν δεδομένα συνταγής.</Alert>; }

  // Moved calculations inside return or memoize them if needed
  const isOwner = user && recipe && recipe.user && user._id === recipe.user; // Assuming recipe.user is ID string
  const hasUserReviewed = recipe && user && recipe.reviews?.some(review => review.user === user._id);


  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom> {recipe.title} </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Rating name="recipe-rating" value={recipe.rating || 0} precision={0.5} readOnly emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
        <Typography variant="body1" sx={{ ml: 1 }}> ({recipe.numReviews || 0} αξιολογήσεις) </Typography>
      </Box>
      <Typography variant="body1" gutterBottom> {recipe.description} </Typography>
       <Typography variant="body2" color="text.secondary" gutterBottom>Κατηγορία: {recipe.category}</Typography> {/* Display Category */}
       {/* Display Original Servings */}
       {recipe.servings && <Typography variant="body2" color="text.secondary" gutterBottom>Μερίδες: {recipe.servings}</Typography>}


      {isOwner && ( <Box sx={{ mb: 2 }}> <Button variant="outlined" onClick={handleEdit} sx={{ mr: 1 }}>Επεξεργασία</Button> <Button variant="contained" color="error" onClick={handleDelete}>Διαγραφή</Button> </Box> )}
      <Divider sx={{ my: 2 }} />

      {/* Ingredients List (Simple String Array Version) */}
      <Typography variant="h5" component="h3" gutterBottom> Συστατικά </Typography>
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
         <List dense>
           {recipe.ingredients.map((ingredient, index) => ( // Now expects string array
             <ListItem key={index}>
               <ListItemIcon sx={{minWidth: '35px'}}><RestaurantMenuIcon fontSize="small" /></ListItemIcon>
               <ListItemText primary={ingredient} />
             </ListItem>
           ))}
         </List>
       ) : ( <Typography variant="body2" color="text.secondary">Δεν υπάρχουν.</Typography> )}
       <Divider sx={{ my: 2 }} />

      {/* Steps List (Simple String Array Version) */}
      <Typography variant="h5" component="h3" gutterBottom> Βήματα </Typography>
       {recipe.steps && recipe.steps.length > 0 ? (
         <List>
           {recipe.steps.map((step, index) => (
              <ListItem key={index} alignItems="flex-start">
                   <ListItemIcon sx={{minWidth: '35px', mt: '4px'}}><FormatListNumberedIcon fontSize="small" /></ListItemIcon>
                   <ListItemText primary={`${index + 1}. ${step}`} />
               </ListItem>
           ))}
         </List>
        ) : ( <Typography variant="body2" color="text.secondary">Δεν υπάρχουν.</Typography> )}
       <Divider sx={{ my: 2 }} />

      {/* Reviews Section */}
      <Typography variant="h5" component="h3" gutterBottom> Αξιολογήσεις & Σχόλια ({recipe.numReviews || 0}) </Typography>
      {recipe.reviews && recipe.reviews.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {recipe.reviews.map((review, index) => (
            <React.Fragment key={review._id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={ <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> <Typography variant="subtitle1" sx={{ mr: 1 }}>{review.name}</Typography> <Rating name={`review-rating-${review._id}`} value={review.rating} readOnly size="small" /> </Box> }
                  secondary={ <> <Typography component="span" variant="body2" color="text.primary">{review.comment}</Typography> <Typography component="span" display="block" variant="caption" color="text.secondary"> - {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Άγνωστη ημερομηνία'} </Typography> </> }
                />
              </ListItem>
              {index < recipe.reviews.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : ( <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>Δεν υπάρχουν αξιολογήσεις ακόμα.</Typography> )}

      {/* Review Form Section */}
      <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
         <Typography variant="h6" component="h4" gutterBottom> Προσθήκη Αξιολόγησης </Typography>
        {user ? ( hasUserReviewed ? ( <Typography variant="body2">Έχετε ήδη αξιολογήσει αυτή τη συνταγή.</Typography> )
               : ( <Box component="form" onSubmit={handleSubmitReview} noValidate sx={{ mt: 1 }}> {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>} <Box sx={{ mb: 2 }}> <Typography component="legend">Βαθμολογία:</Typography> <Rating name="new-rating" value={newRating} onChange={(_, newValue) => { setNewRating(newValue); }} /> </Box> <TextField margin="normal" required fullWidth id="comment" label="Το σχόλιό σας" name="comment" multiline rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={reviewLoading} /> <Button type="submit" variant="contained" disabled={reviewLoading || newRating === 0} sx={{ mt: 1, mb: 1 }} > {reviewLoading ? <CircularProgress size={24} /> : 'Υποβολή Αξιολόγησης'} </Button> </Box> )
        ) : ( <Typography variant="body2"> Παρακαλώ <RouterLink to="/login" style={{color: theme.palette.primary.main}}>συνδεθείτε</RouterLink> για να προσθέσετε αξιολόγηση. </Typography> )}
      </Paper>

      <Button component={RouterLink} to="/" sx={{ mt: 3 }}> Πίσω στη λίστα </Button>
    </Box>
  );
}

export default RecipeDetail;