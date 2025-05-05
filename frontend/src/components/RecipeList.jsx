// frontend/src/components/RecipeList.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// MUI Imports
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Icon for Select button
import Divider from '@mui/material/Divider';


// --- ΝΕΟ: Προσθήκη onRecipeSelect στα props ---
function RecipeList({ onRecipeSelect = null }) { // Default σε null αν δεν δοθεί
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['Ορεκτικό', 'Κυρίως Πιάτο', 'Σαλάτα', 'Σούπα', 'Γλυκό', 'Ρόφημα', 'Άλλο'];

  // useEffect for debouncing search term (Παραμένει ίδιο)
  useEffect(() => {
    const timerId = setTimeout(() => { setDebouncedSearchTerm(searchTerm); }, 500);
    return () => { clearTimeout(timerId); };
  }, [searchTerm]);

  // useEffect for fetching data (Παραμένει ίδιο)
  useEffect(() => {
    setLoading(true); setError(null);
    const params = new URLSearchParams();
    const termToSearch = debouncedSearchTerm.trim();
    if (termToSearch) params.append('search', termToSearch);
    if (selectedCategory) params.append('category', selectedCategory);
    const queryString = params.toString();
    const apiUrl = `/api/recipes${queryString ? `?${queryString}` : ''}`;

    // console.log(`Workspaceing recipes for list/modal: ${apiUrl}`); // Debug
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => { setRecipes(data); setLoading(false); })
      .catch(error => { console.error('Error fetching recipes:', error); setError(error.message); setLoading(false); });
  }, [debouncedSearchTerm, selectedCategory]);

  const handleSearchChange = (event) => { setSearchTerm(event.target.value); };

  // --- Loading Skeleton (Ίδιο) ---
  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, mt: 2 }}> {/* Reduced mt */}
        {/* {!onRecipeSelect && <Skeleton variant="text" width="40%" sx={{ mb: 1, fontSize: '2rem' }} />} */} {/* Title only if not in modal? */}
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={140} /> {/* Slightly smaller */}
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              <Skeleton variant="text" width="80%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // --- Error Display (Ίδιο) ---
   if (error) { return <Alert severity="error" sx={{ mt: 2 }}>Σφάλμα φόρτωσης συνταγών: {error}</Alert>; }

  // --- JSX Εμφάνισης ---
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Εμφάνιση τίτλου/φίλτρων μόνο αν *δεν* είμαστε σε modal (δηλ. δεν δόθηκε onRecipeSelect) */}
      {!onRecipeSelect && (
          <Typography variant="h4" component="h2" gutterBottom>Συνταγές</Typography>
      )}
       <TextField label="Αναζήτηση συνταγής..." variant="outlined" fullWidth value={searchTerm} onChange={handleSearchChange} sx={{ mb: 2 }} size="small"/> {/* Μικρότερο μέγεθος */}
       <FormControl fullWidth margin="normal" sx={{ mb: onRecipeSelect ? 2 : 4 }} size="small"> {/* Μικρότερο μέγεθος & margin αν είμαστε σε modal */}
           <InputLabel id="category-filter-label">Φίλτρο Κατηγορίας</InputLabel>
           <Select labelId="category-filter-label" id="category-filter" name="categoryFilter" value={selectedCategory} label="Φίλτρο Κατηγορίας" onChange={(e) => setSelectedCategory(e.target.value)} >
                <MenuItem value=""><em>Όλες οι Κατηγορίες</em></MenuItem>
                {categories.map((categoryName) => ( <MenuItem key={categoryName} value={categoryName}>{categoryName}</MenuItem> ))}
           </Select>
       </FormControl>

      {/* Λίστα Συνταγών */}
      {recipes.length > 0 ? (
        <Grid container spacing={2}>
          {recipes.map((recipe) => (
            <Grid item xs={12} sm={onRecipeSelect ? 12 : 6} md={onRecipeSelect ? 6 : 4} key={recipe._id}> {/* Διαφορετικό layout στο modal */}
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, py: 1, px: 1.5 }}> {/* Λιγότερο padding */}
                  <Typography gutterBottom variant="h6" component="div" sx={{fontSize: '1rem'}}> {/* Μικρότερος τίτλος */}
                     {recipe.title}
                  </Typography>
                  {/* Μπορούμε να κρύψουμε περιγραφή/rating στο modal για οικονομία χώρου */}
                   {!onRecipeSelect && (
                       <>
                           <Typography variant="body2" color="text.secondary">
                               {recipe.description?.substring(0, 80)}{recipe.description?.length > 80 ? '...' : ''}
                           </Typography>
                           <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                               Κατηγορία: {recipe.category} | Βαθμ: {recipe.rating ? recipe.rating.toFixed(1) : 'N/A'} ({recipe.numReviews || 0})
                           </Typography>
                       </>
                   )}
                   {/* Εμφάνιση κατηγορίας πάντα (ίσως χρήσιμο) */}
                    {onRecipeSelect && (
                         <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                             Κατηγορία: {recipe.category}
                         </Typography>
                    )}
                </CardContent>
                 <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                   {/* --- ΑΛΛΑΓΗ ΕΔΩ: Εμφάνιση κουμπιού ανάλογα το prop --- */}
                   {onRecipeSelect ? (
                       <Button
                           size="small"
                           variant="contained" // Καλύτερο για επιλογή
                           color="primary"
                           onClick={() => onRecipeSelect(recipe)} // Καλεί τη συνάρτηση που δόθηκε
                           startIcon={<CheckCircleOutlineIcon />}
                        >
                           Επιλογή
                       </Button>
                   ) : (
                       <Button
                           size="small"
                           component={RouterLink}
                           to={`/recipes/${recipe._id}`}
                        >
                            Δες Λεπτομέρειες
                       </Button>
                   )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
         <Typography sx={{ mt: 2 }}> Δεν βρέθηκαν συνταγές{searchTerm || selectedCategory ? ` για τα τρέχοντα φίλτρα.` : '.'} </Typography>
      )}
    </Box>
  );
}
export default RecipeList;