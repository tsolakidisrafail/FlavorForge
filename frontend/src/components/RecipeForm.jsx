// frontend/src/components/RecipeForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import SnackbarContext from '../context/SnackbarContext';
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
import FormHelperText from '@mui/material/FormHelperText';


function RecipeForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState(''); // <-- String state
    const [steps, setSteps] = useState('');         // <-- String state
    const [category, setCategory] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formErrors, setFormErrors] = useState({});

    const { user } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);
    const navigate = useNavigate();

    const validateForm = () => {
        let errors = {};
        if (!title.trim()) {
            errors.title = 'Ο τίτλος είναι υποχρεωτικός.';
        }
        if (!category) {
            errors.category = 'Η κατηγορία είναι υποχρεωτική.';
        }
        if (!ingredients.trim()) {
            errors.ingredients = 'Τα συστατικά είναι υποχρεωτικά.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Επιστρέφει true αν δεν υπάρχουν σφάλματα
    };

     const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return; // Αν υπάρχουν σφάλματα, σταματάμε την υποβολή
        }

        setLoading(true);

        if (!user || !user.token) { setError('Απαιτείται σύνδεση.'); setLoading(false); return; }

        // Προετοιμασία δεδομένων (split ingredients/steps)
        const newRecipeData = {
            title: title.trim(),
            description: description.trim(),
            ingredients: ingredients.split('\n').filter(line => line.trim() !== ''), // <-- Split string
            steps: steps.split('\n').filter(line => line.trim() !== ''),             // <-- Split string
            category,
        };

        try {
            const response = await fetch('/api/recipes', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${user.token}` },
                 body: JSON.stringify(newRecipeData),
             });
             if (!response.ok) { throw new Error((await response.json()).message || 'Failed'); }
             showSnackbar('Η συνταγή προστέθηκε!', 'success');
             navigate('/');
        } catch (err) { setError(err.message); showSnackbar(err.message || 'Κάτι πήγε στραβά!', 'error'); 
          
        } finally { setLoading(false); }
     };

     const handleTitleChange = (e) => {
        setTitle(e.target.value);
        if (formErrors.title) {
            setFormErrors({ ...formErrors, title: '' });
        }
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        if (formErrors.category) {
            setFormErrors({ ...formErrors, category: '' });
        }
    };

      return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, maxWidth: '600px', margin: 'auto', mt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 2}}> Προσθήκη Νέας Συνταγής </Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
              
              <TextField margin="normal" required fullWidth id="title" label="Τίτλος Συνταγής" name="title" autoFocus value={title} onChange={handleTitleChange} disabled={loading} error={!!formErrors.title} helperText={formErrors.title || ''}/>
              <TextField margin="normal" fullWidth id="description" label="Περιγραφή" name="description" multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading}/>
              <FormControl fullWidth required margin="normal" disabled={loading} error={!!formErrors.category}>
                   <InputLabel id="category-select-label">Κατηγορία</InputLabel>
                   <Select labelId="category-select-label" id="category-select" name="category" value={category} label="Κατηγορία" onChange={handleCategoryChange}>
                       <MenuItem value=""><em>Επιλέξτε Κατηγορία</em></MenuItem>
                       {['Ορεκτικό', 'Κυρίως Πιάτο', 'Σαλάτα', 'Σούπα', 'Γλυκό', 'Ρόφημα', 'Άλλο'].map((cat) => ( <MenuItem key={cat} value={cat}>{cat}</MenuItem> ))}
                   </Select>
                    {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
               </FormControl>

                {/* Απλό TextField για Ingredients */}
               <TextField margin="normal" fullWidth id="ingredients" label="Συστατικά (ένα ανά γραμμή)" name="ingredients" multiline rows={5} value={ingredients} onChange={(e) => setIngredients(e.target.value)} disabled={loading} helperText="Γράψτε κάθε συστατικό σε νέα γραμμή."/>

               {/* Απλό TextField για Steps */}
               <TextField margin="normal" fullWidth id="steps" label="Βήματα (ένα ανά γραμμή)" name="steps" multiline rows={8} value={steps} onChange={(e) => setSteps(e.target.value)} disabled={loading} helperText="Γράψτε κάθε βήμα σε νέα γραμμή."/>

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading} > {loading ? <CircularProgress size={24} /> : 'Αποθήκευση Συνταγής'} </Button>
            </Box>
          </Box>
        </Paper>
      );
}
export default RecipeForm;