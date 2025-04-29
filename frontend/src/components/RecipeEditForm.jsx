// frontend/src/components/RecipeEditForm.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import SnackbarContext from '../context/SnackbarContext'; // Assuming setup
// MUI Imports
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function RecipeEditForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState(''); // <-- String state
    const [steps, setSteps] = useState('');         // <-- String state
    const [category, setCategory] = useState('');
    // ΟΧΙ state για servings
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { id: recipeId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showSnackbar } = useContext(SnackbarContext);

    // Fetch initial data
    useEffect(() => {
        const fetchRecipe = async () => {
            setInitialLoading(true); setError(null);
            try {
                const response = await fetch(`/api/recipes/${recipeId}`); // Correct fetch URL
                if (!response.ok) { throw new Error((await response.json()).message || 'Failed to fetch'); }
                const data = await response.json();
                setTitle(data.title || '');
                setDescription(data.description || '');
                setCategory(data.category || '');
                // ΟΧΙ servings
                // Μετατροπή πινάκων σε string για τα textareas
                setIngredients(Array.isArray(data.ingredients) ? data.ingredients.join('\n') : (data.ingredients || ''));
                setSteps(Array.isArray(data.steps) ? data.steps.join('\n') : (data.steps || ''));
            } catch (err) { setError(err.message); }
             finally { setInitialLoading(false); }
        };
        fetchRecipe();
    }, [recipeId]);

    // Handle Submit (sending strings for ingredients/steps)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);
        if (!user || !user.token) { /* ... */ return; }
        if (!title.trim() || !category) { setError('Τίτλος και κατηγορία απαιτούνται.'); setLoading(false); return; }

        const updatedRecipeData = {
            title: title.trim(),
            description: description.trim(),
            ingredients: ingredients.split('\n').filter(line => line.trim() !== ''), // <-- Split string
            steps: steps.split('\n').filter(line => line.trim() !== ''),             // <-- Split string
            category,
            // ΟΧΙ servings
        };

        try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(updatedRecipeData),
            });
            if (!response.ok) { throw new Error((await response.json()).message || 'Failed'); }
            showSnackbar('Οι αλλαγές αποθηκεύτηκαν!', 'success');
            navigate(`/recipes/${recipeId}`);
        } catch (err) { setError(err.message); showSnackbar(err.message, 'error'); }
         finally { setLoading(false); }
    };

    if (initialLoading) { return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> ); }

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, maxWidth: '600px', margin: 'auto', mt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 2}}> Επεξεργασία Συνταγής </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
              {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

              <TextField margin="normal" required fullWidth id="title" label="Τίτλος Συνταγής" name="title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading}/>
               {/* ΟΧΙ πεδίο servings */}
              <TextField margin="normal" fullWidth id="description" label="Περιγραφή" name="description" multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading}/>
              <FormControl fullWidth required margin="normal" disabled={loading}>
                  <InputLabel id="category-select-label">Κατηγορία</InputLabel>
                  <Select labelId="category-select-label" id="category-select" name="category" value={category} label="Κατηγορία" onChange={(e) => setCategory(e.target.value)} >
                      <MenuItem value=""><em>Επιλέξτε Κατηγορία</em></MenuItem>
                      {['Ορεκτικό', 'Κυρίως Πιάτο', 'Σαλάτα', 'Σούπα', 'Γλυκό', 'Ρόφημα', 'Άλλο'].map((cat) => ( <MenuItem key={cat} value={cat}>{cat}</MenuItem> ))}
                  </Select>
              </FormControl>

               {/* Απλό TextField για Ingredients */}
              <TextField margin="normal" fullWidth id="ingredients" label="Συστατικά (ένα ανά γραμμή)" name="ingredients" multiline rows={5} value={ingredients} onChange={(e) => setIngredients(e.target.value)} disabled={loading} helperText="Γράψτε κάθε συστατικό σε νέα γραμμή."/>

               {/* Απλό TextField για Steps */}
              <TextField margin="normal" fullWidth id="steps" label="Βήματα (ένα ανά γραμμή)" name="steps" multiline rows={8} value={steps} onChange={(e) => setSteps(e.target.value)} disabled={loading} helperText="Γράψτε κάθε βήμα σε νέα γραμμή."/>

              <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} disabled={loading || initialLoading} > {loading ? <CircularProgress size={24} /> : 'Αποθήκευση Αλλαγών'} </Button>
            </Box>
          </Box>
        </Paper>
      );
}
export default RecipeEditForm;