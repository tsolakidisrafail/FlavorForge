// frontend/src/components/MealPlanner.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react'; // Αφαιρέθηκε το useCallback
import { Link as RouterLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import SnackbarContext from '../context/SnackbarContext';
// MUI Imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Link from '@mui/material/Link'; // Για τα links συνταγών
// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';

// Import το (τροποποιημένο) RecipeList component
import RecipeList from './RecipeList'; // Προσαρμόστε το path αν χρειάζεται

// --- Βοηθητικές Συναρτήσεις Ημερομηνιών (Ίδιες) ---
const getStartOfWeek = (date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const monday = new Date(d.setDate(diff)); monday.setHours(0, 0, 0, 0); return monday; };
const formatDateYYYYMMDD = (date) => { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; };
const addDays = (date, days) => { const result = new Date(date); result.setDate(result.getDate() + days); return result; };

// --- Το Component ---
function MealPlanner() {
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [recipeSelectModalOpen, setRecipeSelectModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const dayNames = useMemo(() => ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'], []);

  // useEffect για φόρτωση
  useEffect(() => {
    const fetchMealPlan = async () => {
      if (!user?.token) return;
      setLoading(true); setError(null); setHasChanges(false);
      const formattedDate = formatDateYYYYMMDD(currentWeekStart);
      try {
        const response = await fetch(`/api/mealplans?weekStartDate=${formattedDate}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch meal plan');
        setMealPlan(data);
      } catch (err) { setError(err.message); setMealPlan(null); }
      finally { setLoading(false); }
    };
    fetchMealPlan();
  }, [currentWeekStart, user?.token]);

  // Handlers πλοήγησης εβδομάδας
  const handlePreviousWeek = () => { setCurrentWeekStart(prevDate => addDays(prevDate, -7)); };
  const handleNextWeek = () => { setCurrentWeekStart(prevDate => addDays(prevDate, 7)); };
  const currentWeekEnd = useMemo(() => addDays(currentWeekStart, 6), [currentWeekStart]);

  // Handlers Modal
  const handleAddRecipeClick = (dayIndex) => { setSelectedDayIndex(dayIndex); setRecipeSelectModalOpen(true); };
  const handleCloseRecipeSelectModal = () => { setRecipeSelectModalOpen(false); setSelectedDayIndex(null); };

  // Handler επιλογής συνταγής από το modal
  const handleRecipeSelect = (recipe) => {
     if (selectedDayIndex === null || !mealPlan) return;
      const updatedPlan = JSON.parse(JSON.stringify(mealPlan));
      const dayRecipes = updatedPlan.days[selectedDayIndex].recipes;
       if (dayRecipes.some(r => r._id === recipe._id)) {
           showSnackbar('Αυτή η συνταγή υπάρχει ήδη στο πλάνο για αυτή τη μέρα.', 'warning');
           return;
       }
      dayRecipes.push({ _id: recipe._id, title: recipe.title, category: recipe.category });
      setMealPlan(updatedPlan);
      setHasChanges(true);
      handleCloseRecipeSelectModal();
      // showSnackbar(`Η συνταγή "${recipe.title}" προστέθηκε.`, 'success'); // Ίσως περιττό αν κλείνει το modal
  };

  // Handler αφαίρεσης συνταγής
  const handleRemoveRecipe = (dayIndex, recipeId) => {
      if (!mealPlan) return;
      const updatedPlan = JSON.parse(JSON.stringify(mealPlan));
      const recipeToRemove = updatedPlan.days[dayIndex].recipes.find(r => r._id === recipeId); // Για το μήνυμα
      updatedPlan.days[dayIndex].recipes = updatedPlan.days[dayIndex].recipes.filter(r => r._id !== recipeId);
      setMealPlan(updatedPlan);
      setHasChanges(true);
      if (recipeToRemove) {
         showSnackbar(`Η συνταγή "${recipeToRemove.title}" αφαιρέθηκε.`, 'info');
      }
  };

  // Handler αποθήκευσης
  const saveMealPlan = async () => {
      if (!mealPlan || !hasChanges) return;
      setSaveLoading(true); setError(null);
      const formattedDate = formatDateYYYYMMDD(currentWeekStart);
      const daysWithOnlyIds = mealPlan.days.map(day => ({ recipes: day.recipes.map(recipe => recipe._id) }));
      const payload = { weekStartDate: formattedDate, days: daysWithOnlyIds };

      try {
          const response = await fetch('/api/mealplans', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` }, body: JSON.stringify(payload) });
          const data = await response.json(); // Η απάντηση περιέχει το populated plan
          if (!response.ok) throw new Error(data.message || 'Failed to save meal plan');
          setMealPlan(data); // Ενημέρωση με τα νέα populated δεδομένα
          setHasChanges(false);
          showSnackbar('Το πλάνο γευμάτων αποθηκεύτηκε!', 'success');
      } catch (err) { setError(err.message); showSnackbar(`Σφάλμα αποθήκευσης: ${err.message}`, 'error'); }
      finally { setSaveLoading(false); }
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 4 }}>
      {/* Header Πλοήγησης Εβδομάδας */}
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
           <IconButton onClick={handlePreviousWeek} aria-label="previous week" disabled={loading || saveLoading}> <ChevronLeftIcon /> </IconButton>
           <Typography variant="h5" component="h1" textAlign="center">
               Εβδομαδιαίο Πλάνο <br /> ({currentWeekStart.toLocaleDateString('el-GR')} - {currentWeekEnd.toLocaleDateString('el-GR')})
           </Typography>
           <IconButton onClick={handleNextWeek} aria-label="next week" disabled={loading || saveLoading}> <ChevronRightIcon /> </IconButton>
       </Box>

      {/* Loading / Error */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ my: 2 }}>Σφάλμα: {error}</Alert>}

      {/* Grid Ημερών */}
      {!loading && !error && mealPlan && (
        <Grid container spacing={1}> {/* Μικρότερο spacing */}
          {dayNames.map((dayName, index) => (
            <Grid item xs={12} sm={6} md={4} lg={12/7} key={index}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                    title={dayName}
                    titleTypographyProps={{ align: 'center', variant: 'subtitle1', sx:{fontSize: '0.9rem'} }} // Πιο μικρό
                    sx={{ backgroundColor: 'action.hover', py: 0.5, px: 1 }} // Πιο μικρό padding
                    action={
                       <IconButton size="small" onClick={() => handleAddRecipeClick(index)} aria-label={`add recipe to ${dayName}`}>
                            <AddCircleOutlineIcon fontSize="inherit"/>
                       </IconButton>
                    }
                 />
                <Divider />
                <CardContent sx={{ flexGrow: 1, p: 1 }}> {/* Μικρότερο padding */}
                  {mealPlan.days[index]?.recipes.length > 0 ? (
                    <List dense disablePadding>
                      {mealPlan.days[index].recipes.map((recipe) => (
                        <ListItem key={recipe._id} disablePadding sx={{ pl: 0.5, pr: 0, mb: 0.5 }} // Λιγότερο padding
                          secondaryAction={
                            <IconButton edge="end" size="small" onClick={() => handleRemoveRecipe(index, recipe._id)} aria-label={`remove ${recipe.title}`} sx={{ mr: -1 }}> {/* Αρνητικό margin */}
                              <DeleteOutlineIcon sx={{fontSize: '1rem'}}/>
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={
                               <Link component={RouterLink} to={`/recipes/${recipe?._id}`} underline="hover" variant="body2" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}> {/* Χειρισμός μεγάλων τίτλων */}
                                    {recipe?.title || 'Άγνωστη Συνταγή'}
                               </Link>
                            }
                         />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="caption" color="text.secondary" align="center" sx={{ fontStyle: 'italic', display: 'block', mt: 1 }}> (Κενό) </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

       {/* Κουμπί Αποθήκευσης */}
       <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={saveMealPlan} disabled={loading || saveLoading || !hasChanges || !mealPlan || !!error}>
                {saveLoading ? <CircularProgress size={24} /> : 'Αποθήκευση Αλλαγών Πλάνου'}
            </Button>
       </Box>

       {/* Modal Επιλογής Συνταγής */}
       <Dialog open={recipeSelectModalOpen} onClose={handleCloseRecipeSelectModal} fullWidth maxWidth="md" aria-labelledby="recipe-select-dialog-title">
            <DialogTitle id="recipe-select-dialog-title">
                Επιλογή Συνταγής για {selectedDayIndex !== null ? dayNames[selectedDayIndex] : ''}
                <IconButton aria-label="close" onClick={handleCloseRecipeSelectModal} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}> <CloseIcon /> </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                 {/* Εδώ φορτώνεται το τροποποιημένο RecipeList */}
                 <RecipeList onRecipeSelect={handleRecipeSelect} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseRecipeSelectModal}>Άκυρο</Button>
            </DialogActions>
       </Dialog>

    </Paper>
  );
}
export default MealPlanner;