// frontend/src/components/RecipeEditForm.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Stack from '@mui/material/Stack';

function RecipeEditForm() {
    // --- States Φόρμας ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [steps, setSteps] = useState(''); // Παραμένει string

    // --- ΝΕΑ States για Μερίδες & Δομημένα Συστατικά ---
    const [servings, setServings] = useState(''); // Ξεκινά κενό, θα γεμίσει από το fetch
    const [ingredientsList, setIngredientsList] = useState([
        // Αρχικοποιείται κενό, θα γεμίσει από το fetch
    ]);

    // --- States για Loading/Errors ---
    const [initialLoading, setInitialLoading] = useState(true); // Για τη φόρτωση αρχικών δεδομένων
    const [error, setError] = useState(null); // Γενικό σφάλμα API (fetch ή submit)
    const [loading, setLoading] = useState(false); // Για το submit
    const [formErrors, setFormErrors] = useState({}); // Σφάλματα ανά πεδίο

    const { id: recipeId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showSnackbar } = useContext(SnackbarContext);

    // --- useEffect για Φόρτωση Δεδομένων Συνταγής ---
    useEffect(() => {
        const fetchRecipe = async () => {
            setInitialLoading(true);
            setError(null);
            setFormErrors({}); // Καθαρισμός παλιών σφαλμάτων φόρμας
            try {
                const response = await fetch(`/api/recipes/${recipeId}`);
                if (!response.ok) {
                    throw new Error((await response.json()).message || 'Αποτυχία φόρτωσης συνταγής');
                }
                const data = await response.json();

                // Έλεγχος αν ο χρήστης είναι ο ιδιοκτήτης (πρόσθετη ασφάλεια)
                 if (!user || !data || !data.user || typeof data.user !== 'object' || data.user._id !== user._id) {
                    showSnackbar('Δεν έχετε δικαίωμα επεξεργασίας αυτής της συνταγής.', 'error');
                    navigate(`/recipes/${recipeId}`); // Redirect αν δεν είναι ιδιοκτήτης
                    return;
                 }


                // --- Γέμισμα των States με τα Φορτωμένα Δεδομένα ---
                setTitle(data.title || '');
                setDescription(data.description || '');
                setCategory(data.category || '');
                setServings(data.servings || ''); // Γέμισμα servings

                // Γέμισμα steps (παραμένει string)
                setSteps(Array.isArray(data.steps) ? data.steps.join('\n') : (data.steps || ''));

                // Γέμισμα ingredientsList (με έλεγχο για κενά)
                if (data.ingredients && data.ingredients.length > 0) {
                    // Βεβαιώσου ότι κάθε αντικείμενο έχει όλα τα πεδία για να αποφύγεις errors
                     const formattedIngredients = data.ingredients.map(ing => ({
                        quantity: ing.quantity ?? '', // Χρησιμοποίησε ?? για null/undefined
                        unit: ing.unit ?? '',
                        name: ing.name ?? '',
                        notes: ing.notes ?? ''
                     }));
                    setIngredientsList(formattedIngredients);
                } else {
                    // Αν δεν υπάρχουν συστατικά, βάλε μια κενή γραμμή
                    setIngredientsList([{ quantity: '', unit: '', name: '', notes: '' }]);
                }

            } catch (err) {
                setError(err.message);
                showSnackbar(err.message, 'error');
                // Ίσως redirect αν η συνταγή δεν βρεθεί
                 if (err.message.includes('not found')) {
                     navigate('/');
                 }
            } finally {
                setInitialLoading(false);
            }
        };
        // Κάλεσε το fetch μόνο αν υπάρχει recipeId και user token
         if (recipeId && user?.token) {
             fetchRecipe();
         } else if (!user?.token) {
              showSnackbar('Απαιτείται σύνδεση για επεξεργασία.', 'warning');
              navigate('/login');
         }
         // Πρόσθεσε user?.token στις εξαρτήσεις
    }, [recipeId, user?.token, navigate, showSnackbar, user]);


    // --- Handlers για Δυναμική Λίστα Συστατικών (Ίδιοι με RecipeForm) ---
    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredientsList];
        newIngredients[index][field] = value;
        setIngredientsList(newIngredients);
        if (formErrors.ingredients && formErrors.ingredients[index] && formErrors.ingredients[index][field]) {
            const newFieldErrors = { ...formErrors.ingredients[index] };
            delete newFieldErrors[field];
            const newIngredientErrors = { ...formErrors.ingredients };
            newIngredientErrors[index] = newFieldErrors;
             if (Object.keys(newIngredientErrors[index]).length === 0) delete newIngredientErrors[index]; // Remove if empty
             if (Object.keys(newIngredientErrors).length === 0) {
                const newFormErrors = {...formErrors}; delete newFormErrors.ingredients; setFormErrors(newFormErrors);
             } else { setFormErrors({ ...formErrors, ingredients: newIngredientErrors }); }
        }
    };
    const addIngredientField = () => {
        setIngredientsList([...ingredientsList, { quantity: '', unit: '', name: '', notes: '' }]);
    };
    const removeIngredientField = (index) => {
        const newIngredients = ingredientsList.filter((_, i) => i !== index);
        setIngredientsList(newIngredients);
         if (formErrors.ingredients && formErrors.ingredients[index]) {
            const newIngredientErrors = { ...formErrors.ingredients }; delete newIngredientErrors[index];
             if (Object.keys(newIngredientErrors).length === 0) {
                const newFormErrors = {...formErrors}; delete newFormErrors.ingredients; setFormErrors(newFormErrors);
             } else { setFormErrors({ ...formErrors, ingredients: newIngredientErrors }); }
        }
    };

    // --- Συνάρτηση Επικύρωσης (Ίδια με RecipeForm) ---
    const validateForm = () => {
        let errors = {}; let ingredientErrors = {};
        if (!title.trim()) errors.title = 'Ο τίτλος είναι υποχρεωτικός.';
        if (!category) errors.category = 'Η κατηγορία είναι υποχρεωτική.';
        if (!servings || servings < 1) errors.servings = 'Οι μερίδες πρέπει να είναι τουλάχιστον 1.';
        if (ingredientsList.length === 0 || ingredientsList.every(ing => !ing.name.trim())) {
             errors.ingredientsGeneral = 'Πρέπει να προστεθεί τουλάχιστον ένα συστατικό με όνομα.';
        } else {
             ingredientsList.forEach((ingredient, index) => {
                 let currentIngredientErrors = {};
                 if (!ingredient.name.trim()) currentIngredientErrors.name = 'Το όνομα είναι υποχρεωτικό.';
                 if (ingredient.quantity && isNaN(Number(ingredient.quantity))) currentIngredientErrors.quantity = 'Η ποσότητα πρέπει να είναι αριθμός.';
                 if (Object.keys(currentIngredientErrors).length > 0) ingredientErrors[index] = currentIngredientErrors;
             });
        }
         if (Object.keys(ingredientErrors).length > 0) errors.ingredients = ingredientErrors;
        // if (!steps.trim()) errors.steps = 'Τα βήματα εκτέλεσης είναι υποχρεωτικά.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // --- Ενημερωμένη handleSubmit (για PUT request) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) { return; } // Stop if form has errors

        setLoading(true); // Start loading for submit

        if (!user || !user.token) {
            showSnackbar('Απαιτείται σύνδεση.', 'error');
            setLoading(false);
            return;
        }

         const cleanedIngredients = ingredientsList
            .filter(ing => ing.name.trim() !== '')
            .map(ing => ({
                quantity: ing.quantity ? Number(ing.quantity) : undefined,
                unit: ing.unit?.trim() ?? '', // Trim unit
                name: ing.name.trim(),
                notes: ing.notes?.trim() ?? '' // Trim notes
            }));

        const updatedRecipeData = {
            title: title.trim(),
            description: description.trim(),
            servings: Number(servings), // Convert to number
            ingredients: cleanedIngredients, // Updated structured ingredients
            steps: steps.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map(line => line.trim()).filter(line => line !== ''), // Process steps string
            category,
        };

        try {
            const response = await fetch(`/api/recipes/${recipeId}`, { // Use recipeId
                method: 'PUT', // Use PUT method
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify(updatedRecipeData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Αποτυχία ενημέρωσης συνταγής');
            }
            showSnackbar('Οι αλλαγές αποθηκεύτηκαν!', 'success');
            navigate(`/recipes/${recipeId}`); // Redirect to recipe detail page
        } catch (err) {
            setError(err.message);
            showSnackbar(err.message, 'error');
        } finally {
            setLoading(false); // Stop loading for submit
        }
    };

     // --- Handler για καθαρισμό σφαλμάτων ---
     const handleFieldChange = (setter, fieldName, value) => {
        setter(value);
        if (formErrors[fieldName]) {
            setFormErrors(prevErrors => ({ ...prevErrors, [fieldName]: '' }));
        }
     };


    // --- Εμφάνιση κατά τη φόρτωση των αρχικών δεδομένων ---
    if (initialLoading) {
        return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> );
    }
     // --- Εμφάνιση αν υπήρξε σφάλμα κατά την αρχική φόρτωση ---
    if (error && !title) { // Αν υπάρχει σφάλμα και δεν φορτώθηκε καν ο τίτλος
         return <Alert severity="error" sx={{ mt: 2 }}>Σφάλμα φόρτωσης: {error}</Alert>;
    }

    // --- JSX Φόρμας (Παρόμοιο με RecipeForm, αλλά με αρχικές τιμές) ---
    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, maxWidth: '700px', margin: 'auto', mt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 2}}> Επεξεργασία Συνταγής </Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>} {/* Για σφάλματα submit */}

             <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>

              {/* --- Βασικά Πεδία --- */}
              <TextField margin="normal" required fullWidth id="title" label="Τίτλος Συνταγής" name="title" autoFocus value={title} onChange={(e) => handleFieldChange(setTitle, 'title', e.target.value)} disabled={loading} error={!!formErrors.title} helperText={formErrors.title || ''} />
              <TextField margin="normal" fullWidth id="description" label="Περιγραφή" name="description" multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
              <FormControl fullWidth required margin="normal" disabled={loading} error={!!formErrors.category}>
                   <InputLabel id="category-select-label">Κατηγορία</InputLabel>
                   <Select labelId="category-select-label" id="category-select" name="category" value={category} label="Κατηγορία" onChange={(e) => handleFieldChange(setCategory, 'category', e.target.value)}>
                       <MenuItem value=""><em>Επιλέξτε Κατηγορία</em></MenuItem>
                       {['Ορεκτικό', 'Κυρίως Πιάτο', 'Σαλάτα', 'Σούπα', 'Γλυκό', 'Ρόφημα', 'Άλλο'].map((cat) => ( <MenuItem key={cat} value={cat}>{cat}</MenuItem> ))}
                   </Select>
                   {formErrors.category && <FormHelperText error>{formErrors.category}</FormHelperText>}
               </FormControl>
               <TextField margin="normal" required fullWidth id="servings" label="Μερίδες" name="servings" type="number" InputProps={{ inputProps: { min: 1 } }} value={servings} onChange={(e) => handleFieldChange(setServings, 'servings', e.target.value)} disabled={loading} error={!!formErrors.servings} helperText={formErrors.servings || ''} />


               {/* --- Δυναμική Λίστα Συστατικών (Ίδιο JSX με RecipeForm) --- */}
               <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}> Συστατικά </Typography>
               {formErrors.ingredientsGeneral && <Alert severity="error" sx={{ mb: 1 }}>{formErrors.ingredientsGeneral}</Alert>}
               {ingredientsList.map((ingredient, index) => (
                 <Stack direction="row" spacing={1} key={index} sx={{ mb: 1, alignItems: 'flex-start' }}>
                    <TextField label="Ποσότητα" variant="outlined" size="small" value={ingredient.quantity} onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)} sx={{ width: '100px' }} error={!!(formErrors.ingredients && formErrors.ingredients[index]?.quantity)} helperText={formErrors.ingredients && formErrors.ingredients[index]?.quantity || ''}/>
                    <TextField label="Μονάδα" variant="outlined" size="small" value={ingredient.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)} sx={{ width: '120px' }} />
                    <TextField label="Όνομα Συστατικού" variant="outlined" size="small" required value={ingredient.name} onChange={(e) => handleIngredientChange(index, 'name', e.target.value)} sx={{ flexGrow: 1 }} error={!!(formErrors.ingredients && formErrors.ingredients[index]?.name)} helperText={formErrors.ingredients && formErrors.ingredients[index]?.name || ''}/>
                    <TextField label="Σημειώσεις" variant="outlined" size="small" value={ingredient.notes} onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)} sx={{ width: '150px' }}/>
                    {ingredientsList.length > 1 && (<IconButton onClick={() => removeIngredientField(index)} color="error" sx={{ mt: '5px' }} aria-label="delete ingredient"><DeleteOutlineIcon /></IconButton>)}
                 </Stack>
              ))}
              <Button variant="outlined" size="small" onClick={addIngredientField} startIcon={<AddCircleOutlineIcon />} sx={{ mt: 1 }}> Προσθήκη Συστατικού </Button>


              {/* --- Πεδίο Βημάτων (Παραμένει Textarea) --- */}
              <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}> Βήματα Εκτέλεσης </Typography>
               <TextField margin="normal" fullWidth id="steps" label="Βήματα (ένα ανά γραμμή)" name="steps" multiline rows={8} value={steps} onChange={(e) => handleFieldChange(setSteps, 'steps', e.target.value)} disabled={loading} helperText="Γράψτε κάθε βήμα σε νέα γραμμή." error={!!formErrors.steps}/>

              {/* Κουμπί Υποβολής */}
              <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} disabled={loading || initialLoading} >
                  {loading ? <CircularProgress size={24} /> : 'Αποθήκευση Αλλαγών'}
              </Button>
            </Box>
          </Box>
        </Paper>
      );
}
export default RecipeEditForm;