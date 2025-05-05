// frontend/src/components/RecipeDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import SnackbarContext from '../context/SnackbarContext';
// MUI Imports
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
import StarIcon from '@mui/icons-material/Star';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import Tooltip from '@mui/material/Tooltip'; // Για βοήθεια στο servings input
import InputAdornment from '@mui/material/InputAdornment'; // Για label στο servings

function RecipeDetail() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: recipeId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showSnackbar } = useContext(SnackbarContext);

  // --- ΝΕΟ STATE: Για τις επιθυμητές μερίδες ---
  const [desiredServings, setDesiredServings] = useState(''); // Αρχικοποιείται κενό

  // State for review form
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);


  // Fetch recipe data
  useEffect(() => {
      const fetchRecipeDetails = async () => {
          setLoading(true);
          setError(null);
          setDesiredServings(''); // Καθαρισμός πριν το fetch
          try {
              const response = await fetch(`/api/recipes/${recipeId}`);
              if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
              }
              const data = await response.json();
              setRecipe(data);
              // --- Ορισμός αρχικών επιθυμητών μερίδων ΜΕΤΑ τη φόρτωση του recipe ---
              if (data && data.servings) {
                 setDesiredServings(data.servings);
              }
          } catch (err) {
              setError(err.message || "Failed to load recipe details.");
          } finally {
              setLoading(false);
          }
      };
      fetchRecipeDetails();
  }, [recipeId]); // Refetch if recipeId changes

  // --- Handlers για Επεξεργασία/Διαγραφή (Παραμένουν ίδια) ---
  const handleDelete = async () => {
       if (!window.confirm('Είστε σίγουροι;')) return;
       // ... (rest of delete logic remains the same) ...
       if (!user || !user.token) { setError('Απαιτείται σύνδεση.'); return; }
       try {
           const response = await fetch(`/api/recipes/${recipeId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${user.token}` } });
           if (!response.ok) { throw new Error((await response.json()).message || 'Failed to delete'); }
           showSnackbar('Η συνταγή διαγράφηκε.', 'success');
           navigate('/');
       } catch (err) { setError(err.message); showSnackbar(err.message, 'error'); }
   };
  const handleEdit = () => { navigate(`/recipes/${recipeId}/edit`); };

  // --- Handler Υποβολής Αξιολόγησης (Παραμένει ίδιος, με Refetch) ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    // ... (rest of submit review logic remains the same) ...
     if (newRating === 0 || !newComment.trim()) { setReviewError("Βαθμολογία και σχόλιο απαιτούνται."); return; }
    if (!user || !user.token) { setReviewError("Απαιτείται σύνδεση."); return; }
    setReviewLoading(true); setReviewError(null);
    try {
        const response = await fetch(`/api/recipes/${recipeId}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}`}, body: JSON.stringify({ rating: newRating, comment: newComment }) });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || 'Failed to submit review'); }
        setNewRating(0); setNewComment('');
        showSnackbar('Η αξιολόγηση καταχωρήθηκε!', 'success');
        // Trigger refetch of recipe data
         setLoading(true);
         const refetchResponse = await fetch(`/api/recipes/${recipeId}`);
         const refetchData = await refetchResponse.json();
          if (refetchResponse.ok) {
             setRecipe(refetchData);
             // Επανέφερε το desiredServings στο αρχικό αν χρειάζεται (ή άφησέ το ως έχει)
             // setDesiredServings(refetchData.servings || '');
          }
         setLoading(false);
    } catch (err) { setReviewError(err.message); showSnackbar(err.message, 'error'); }
    finally { setReviewLoading(false); }
  };

  // --- ΝΕΑ ΣΥΝΑΡΤΗΣΗ: Υπολογισμός Προσαρμοσμένης Ποσότητας ---
  const calculateAdjustedQuantity = (originalQuantity, baseServings, newServings) => {
      // Έλεγχος αν οι τιμές είναι έγκυρες
      if (typeof originalQuantity !== 'number' || isNaN(originalQuantity) ||
          !baseServings || !newServings || baseServings <= 0 || newServings <= 0) {
          return originalQuantity; // Επιστροφή της αρχικής τιμής (ή null/undefined/string) αν δεν μπορεί να γίνει υπολογισμός
      }

      const calculated = (originalQuantity / baseServings) * newServings;

      // Απλή στρογγυλοποίηση σε 1 δεκαδικό ψηφίο αν χρειάζεται
      if (calculated % 1 !== 0) {
          return parseFloat(calculated.toFixed(1));
      }
      return calculated;
  };

  // --- Έλεγχοι Φόρτωσης/Σφάλματος/Απουσίας Δεδομένων ---
  if (loading) { return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> ); }
  if (error && !recipe) { return <Alert severity="error" sx={{ mt: 2 }}>Σφάλμα: {error === 'Recipe not found' ? 'Η συνταγή δεν βρέθηκε.' : error}</Alert>; }
  if (!recipe) { return <Alert severity="warning" sx={{ mt: 2 }}>Δεν βρέθηκαν δεδομένα συνταγής.</Alert>; }

  // --- Υπολογισμός isOwner (Παραμένει ίδιος) ---
  // ΣΗΜΑΝΤΙΚΟ: Βεβαιώσου ότι το recipe.user είναι το ID string όπως περιμένει η σύγκριση
  // Αν το backend στέλνει object, χρησιμοποίησε: user._id === recipe.user._id
  console.log('BUTTON CHECK - User ID:', user?._id, typeof user?._id);
  console.log('BUTTON CHECK - Recipe User:', recipe?.user, typeof recipe?.user);
  const isOwner = user && recipe && recipe.user && typeof recipe.user === 'object' && user._id === recipe.user._id;
  console.log('BUTTON CHECK - Is Owner:', isOwner);
  const hasUserReviewed = recipe && user && recipe.reviews?.some(review => review.user === user._id);


  // --- JSX Εμφάνισης ---
  return (
    <Box sx={{ my: 2 }}>
      {/* --- Βασικές Πληροφορίες Συνταγής --- */}
      <Typography variant="h4" component="h1" gutterBottom> {recipe.title} </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> {/* Μειωμένο mb */}
        <Rating name="recipe-rating" value={recipe.rating || 0} precision={0.5} readOnly />
        <Typography variant="body1" sx={{ ml: 1 }}> ({recipe.numReviews || 0} αξιολογήσεις) </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>Κατηγορία: {recipe.category}</Typography>
      <Typography variant="body1" paragraph> {recipe.description} </Typography>

      {/* --- ΝΕΑ ΕΝΟΤΗΤΑ: Προσαρμογή Μερίδων --- */}
       <Paper variant="outlined" sx={{ p: 2, my: 2, maxWidth: '300px' }}>
         <Typography variant="h6" component="h3" gutterBottom> Μερίδες </Typography>
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             <TextField
                 label="Προσαρμογή"
                 type="number"
                 size="small"
                 InputProps={{
                     inputProps: { min: 1, style: { textAlign: 'center' } },
                     startAdornment: <InputAdornment position="start">Για:</InputAdornment>,
                     endAdornment: <InputAdornment position="end">{desiredServings === 1 ? 'μερίδα' : 'μερίδες'}</InputAdornment>,
                 }}
                 value={desiredServings}
                 onChange={(e) => {
                     const val = e.target.value;
                     // Ενημέρωση μόνο αν είναι κενό ή θετικός ακέραιος
                      if (val === '' || /^[1-9]\d*$/.test(val)) {
                           setDesiredServings(val === '' ? '' : parseInt(val, 10));
                      }
                 }}
                 sx={{ width: '180px' }}
             />
             <Tooltip title={`Αρχική συνταγή για ${recipe.servings} ${recipe.servings === 1 ? 'μερίδα' : 'μερίδες'}`}>
                 <Typography variant="body2" color="text.secondary">
                     (Αρχικές: {recipe.servings})
                 </Typography>
             </Tooltip>
         </Box>
       </Paper>
      {/* --- ΤΕΛΟΣ ΕΝΟΤΗΤΑΣ ΜΕΡΙΔΩΝ --- */}


      {/* Κουμπιά Επεξεργασίας/Διαγραφής */}
      {isOwner && ( <Box sx={{ mb: 2 }}> <Button variant="outlined" onClick={handleEdit} sx={{ mr: 1 }}>Επεξεργασια</Button> <Button variant="contained" color="error" onClick={handleDelete}>Διαγραφη</Button> </Box> )}
      <Divider sx={{ my: 2 }} />

      {/* --- ΕΝΗΜΕΡΩΜΕΝΗ ΛΙΣΤΑ ΣΥΣΤΑΤΙΚΩΝ --- */}
      <Typography variant="h5" component="h3" gutterBottom> Συστατικά </Typography>
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
         <List dense>
           {recipe.ingredients.map((ingredient, index) => {
            console.log(`INGREDIENT[${index}]:`, JSON.stringify(ingredient)); // Debugging log
             // Υπολογισμός νέας ποσότητας
             const adjustedQuantity = calculateAdjustedQuantity(ingredient.quantity, recipe.servings, desiredServings === '' ? recipe.servings : desiredServings);

              // Μορφοποίηση του κειμένου του συστατικού
              let ingredientText = '';
              if (typeof adjustedQuantity === 'number') {
                  ingredientText += `${adjustedQuantity} `;
              } else if (ingredient.quantity) {
                  // Αν η αρχική ποσότητα δεν ήταν αριθμός, δείξε την ως έχει
                   ingredientText += `${ingredient.quantity} `;
              }
               if (ingredient.unit) {
                   ingredientText += `${ingredient.unit} `;
               }
               ingredientText += ingredient.name;
                if(ingredient.notes) {
                    ingredientText += ` (${ingredient.notes})`;
                }
                console.log(`INGREDIENT[${index}] TEXT:`, ingredientText); // Debugging log


             return (
                 <ListItem key={index}>
                 <ListItemIcon sx={{minWidth: '35px'}}><RestaurantMenuIcon fontSize="small" /></ListItemIcon>
                 {/* Εμφάνιση του διαμορφωμένου κειμένου */}
                 <ListItemText primary={ingredientText} />
                 </ListItem>
             );
           })}
         </List>
       ) : ( <Typography variant="body2" color="text.secondary">Δεν υπάρχουν συστατικά.</Typography> )}
       <Divider sx={{ my: 2 }} />
       {/* --- ΤΕΛΟΣ ΛΙΣΤΑΣ ΣΥΣΤΑΤΙΚΩΝ --- */}


      {/* --- Λίστα Βημάτων (Παραμένει ίδια) --- */}
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
        ) : ( <Typography variant="body2" color="text.secondary">Δεν υπάρχουν βήματα.</Typography> )}
       <Divider sx={{ my: 2 }} />

      {/* --- Ενότητα Αξιολογήσεων (Παραμένει ίδια) --- */}
      <Typography variant="h5" component="h3" gutterBottom> Αξιολογήσεις & Σχόλια ({recipe.numReviews || 0}) </Typography>
       {/* ... (JSX για εμφάνιση λίστας reviews παραμένει ίδιο) ... */}
        {recipe.reviews && recipe.reviews.length > 0 ? (
         <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {recipe.reviews.map((review, index) => (
             <React.Fragment key={review._id}>
               <ListItem alignItems="flex-start">
                 <ListItemText
                  primary={
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>{review.name}</Typography>
                     {/* Προαιρετικά: Εμφάνιση level αν το στέλνει το backend */}
                     {/* {review.userLevel && (<Typography ...>Level {review.userLevel}</Typography>)} */}
                    <Rating name={`review-rating-${review._id}`} value={review.rating} readOnly size="small" />
                   </Box>
                  }
                  secondary={
                   <>
                    <Typography component="span" variant="body2" color="text.primary">{review.comment}</Typography>
                    <Typography component="span" display="block" variant="caption" color="text.secondary">
                      {' - '} {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Άγνωστη ημερομηνία'}
                    </Typography>
                   </>
                  }
                 />
               </ListItem>
               {index < recipe.reviews.length - 1 && <Divider variant="inset" component="li" />}
             </React.Fragment>
           ))}
         </List>
        ) : ( <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>Δεν υπάρχουν αξιολογήσεις ακόμα.</Typography> )}


      {/* --- Φόρμα Αξιολόγησης (Παραμένει ίδια) --- */}
      <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
         <Typography variant="h6" component="h4" gutterBottom> Προσθήκη Αξιολόγησης </Typography>
         {/* ... (JSX για φόρμα αξιολόγησης παραμένει ίδιο) ... */}
          {user ? ( hasUserReviewed ? ( <Typography variant="body2">Έχετε ήδη αξιολογήσει αυτή τη συνταγή.</Typography> )
               : ( <Box component="form" onSubmit={handleSubmitReview} noValidate sx={{ mt: 1 }}> {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>} <Box sx={{ mb: 2 }}> <Typography component="legend">Βαθμολογία:</Typography> <Rating name="new-rating" value={newRating} onChange={(_, newValue) => { setNewRating(newValue); }} /> </Box> <TextField margin="normal" required fullWidth id="comment" label="Το σχόλιό σας" name="comment" multiline rows={3} value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={reviewLoading} /> <Button type="submit" variant="contained" disabled={reviewLoading || newRating === 0} sx={{ mt: 1, mb: 1 }} > {reviewLoading ? <CircularProgress size={24} /> : 'Υποβολή Αξιολόγησης'} </Button> </Box> )
        ) : ( <Typography variant="body2"> Παρακαλώ <Link component={RouterLink} to="/login">συνδεθείτε</Link> για να προσθέσετε αξιολόγηση. </Typography> )} {/* Ενημέρωση Link */}
      </Paper>

      {/* Κουμπί Πίσω */}
      <Button component={RouterLink} to="/" sx={{ mt: 3 }}> Πίσω στη λίστα </Button>
    </Box>
  );
}

export default RecipeDetail;