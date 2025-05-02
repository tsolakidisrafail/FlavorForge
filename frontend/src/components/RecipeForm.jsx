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
import IconButton from '@mui/material/IconButton'; // Για κουμπί διαγραφής
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Εικονίδιο για προσθήκη
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Εικονίδιο για διαγραφή
import Stack from '@mui/material/Stack'; // Για διάταξη συστατικών

function RecipeForm() {
    // --- Βασικά States Φόρμας ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [steps, setSteps] = useState(''); // Τα βήματα παραμένουν απλό string προς το παρόν

    // --- ΝΕΑ States για Μερίδες & Δομημένα Συστατικά ---
    const [servings, setServings] = useState(4); // Default μερίδες
    const [ingredientsList, setIngredientsList] = useState([
        { quantity: '', unit: '', name: '', notes: '' } // Ξεκινάμε με ένα κενό πεδίο
    ]);

    // --- States για Loading/Errors ---
    const [error, setError] = useState(null); // Γενικό σφάλμα API
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({}); // Σφάλματα ανά πεδίο

    const { user } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);
    const navigate = useNavigate();

    // --- Handlers για Δυναμική Λίστα Συστατικών ---

    // Ενημέρωση ενός πεδίου σε ένα συγκεκριμένο συστατικό
    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredientsList];
        newIngredients[index][field] = value;
        setIngredientsList(newIngredients);
        // Προαιρετικά: Καθάρισμα σφάλματος για το συγκεκριμένο συστατικό αν υπάρχει
        if (formErrors.ingredients && formErrors.ingredients[index] && formErrors.ingredients[index][field]) {
            const newFieldErrors = { ...formErrors.ingredients[index] };
            delete newFieldErrors[field];
            const newIngredientErrors = { ...formErrors.ingredients };
            newIngredientErrors[index] = newFieldErrors;
            setFormErrors({ ...formErrors, ingredients: newIngredientErrors });
        }
    };

    // Προσθήκη νέας κενής γραμμής συστατικού
    const addIngredientField = () => {
        setIngredientsList([...ingredientsList, { quantity: '', unit: '', name: '', notes: '' }]);
    };

    // Αφαίρεση μιας γραμμής συστατικού
    const removeIngredientField = (index) => {
        const newIngredients = ingredientsList.filter((_, i) => i !== index);
        setIngredientsList(newIngredients);
        // Προαιρετικά: Καθάρισμα σφαλμάτων για τη γραμμή που αφαιρέθηκε
        if (formErrors.ingredients && formErrors.ingredients[index]) {
            const newIngredientErrors = { ...formErrors.ingredients };
            delete newIngredientErrors[index];
             // Αν δεν υπάρχουν άλλα σφάλματα συστατικών, καθάρισε και το κεντρικό κλειδί
            if (Object.keys(newIngredientErrors).length === 0) {
               const newFormErrors = {...formErrors};
               delete newFormErrors.ingredients;
               setFormErrors(newFormErrors);
            } else {
                 setFormErrors({ ...formErrors, ingredients: newIngredientErrors });
            }
        }
    };

    // --- Συνάρτηση Επικύρωσης (Ενημερωμένη) ---
    const validateForm = () => {
        let errors = {};
        let ingredientErrors = {}; // Ξεχωριστό αντικείμενο για σφάλματα συστατικών

        if (!title.trim()) errors.title = 'Ο τίτλος είναι υποχρεωτικός.';
        if (!category) errors.category = 'Η κατηγορία είναι υποχρεωτική.';
        if (!servings || servings < 1) errors.servings = 'Οι μερίδες πρέπει να είναι τουλάχιστον 1.';

        // Έλεγχος συστατικών
        if (ingredientsList.length === 0 || ingredientsList.every(ing => !ing.name.trim())) {
            // Αν δεν υπάρχει κανένα ή όλα έχουν κενό όνομα
             errors.ingredientsGeneral = 'Πρέπει να προστεθεί τουλάχιστον ένα συστατικό με όνομα.';
        } else {
             ingredientsList.forEach((ingredient, index) => {
                 let currentIngredientErrors = {};
                 if (!ingredient.name.trim()) {
                     currentIngredientErrors.name = 'Το όνομα είναι υποχρεωτικό.';
                 }
                 // Προαιρετικά: έλεγχος αν η ποσότητα είναι αριθμός αν έχει δοθεί
                 if (ingredient.quantity && isNaN(Number(ingredient.quantity))) {
                     currentIngredientErrors.quantity = 'Η ποσότητα πρέπει να είναι αριθμός.';
                 }
                 if (Object.keys(currentIngredientErrors).length > 0) {
                    ingredientErrors[index] = currentIngredientErrors;
                 }
             });
        }
         if (Object.keys(ingredientErrors).length > 0) {
             errors.ingredients = ingredientErrors; // Πρόσθεσε τα σφάλματα συστατικών στο κύριο αντικείμενο
         }


        // (Προαιρετικός έλεγχος για βήματα)
        // if (!steps.trim()) errors.steps = 'Τα βήματα εκτέλεσης είναι υποχρεωτικά.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // --- Ενημερωμένη handleSubmit ---
     const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return; // Σταμάτα αν η φόρμα δεν είναι έγκυρη
        }

        setLoading(true);

        if (!user || !user.token) {
             showSnackbar('Απαιτείται σύνδεση.', 'error');
             setLoading(false);
             return;
        }

        // Καθαρισμός συστατικών από εντελώς κενές γραμμές (αν υπάρχουν)
        // και μετατροπή quantity σε αριθμό όπου είναι δυνατόν
        const cleanedIngredients = ingredientsList
            .filter(ing => ing.name.trim() !== '') // Κράτα μόνο όσα έχουν όνομα
            .map(ing => ({
                ...ing,
                quantity: ing.quantity ? Number(ing.quantity) : undefined // Μετατροπή σε αριθμό ή undefined
            }));

        const newRecipeData = {
            title: title.trim(),
            description: description.trim(),
            servings: Number(servings), // Μετατροπή σε αριθμό
            ingredients: cleanedIngredients, // Ο καθαρισμένος πίνακας αντικειμένων
            steps: steps.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map(line => line.trim()).filter(line => line !== ''), // Εφαρμογή βελτιωμένου split στα βήματα
            category,
        };

        try {
            const response = await fetch('/api/recipes', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${user.token}` },
                 body: JSON.stringify(newRecipeData),
             });
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Αποτυχία δημιουργίας συνταγής.');
             }
             showSnackbar('Η συνταγή προστέθηκε με επιτυχία!', 'success');
             navigate('/');
        } catch (err) {
             setError(err.message);
             showSnackbar(err.message, 'error');
        } finally {
             setLoading(false);
        }
     };

     // --- Handlers για καθαρισμό σφαλμάτων (Βελτιωμένοι) ---
     const handleFieldChange = (setter, fieldName, value) => {
        setter(value);
        if (formErrors[fieldName]) {
            setFormErrors(prevErrors => ({ ...prevErrors, [fieldName]: '' }));
        }
     };


      return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, maxWidth: '700px', margin: 'auto', mt: 4 }}> {/* Αυξημένο maxWidth */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 2}}> Προσθήκη Νέας Συνταγής </Typography>
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

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


              {/* --- ΝΕΑ ΕΝΟΤΗΤΑ: Δυναμική Λίστα Συστατικών --- */}
              <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}> Συστατικά </Typography>
              {formErrors.ingredientsGeneral && <Alert severity="error" sx={{ mb: 1 }}>{formErrors.ingredientsGeneral}</Alert>}
              {ingredientsList.map((ingredient, index) => (
                 <Stack direction="row" spacing={1} key={index} sx={{ mb: 1, alignItems: 'flex-start' }}> {/* Χρήση Stack για καλύτερη στοίχιση */}
                    <TextField
                        label="Ποσότητα"
                        variant="outlined"
                        size="small"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        sx={{ width: '100px' }}
                        error={!!(formErrors.ingredients && formErrors.ingredients[index]?.quantity)}
                        helperText={formErrors.ingredients && formErrors.ingredients[index]?.quantity || ''}
                    />
                    <TextField
                        label="Μονάδα"
                        variant="outlined"
                        size="small"
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        sx={{ width: '120px' }}
                        // Δεν έχουμε error state για μονάδα προς το παρόν
                    />
                     <TextField
                        label="Όνομα Συστατικού"
                        variant="outlined"
                        size="small"
                        required
                        value={ingredient.name}
                        onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        sx={{ flexGrow: 1 }} // Να πιάνει τον υπόλοιπο χώρο
                         error={!!(formErrors.ingredients && formErrors.ingredients[index]?.name)}
                         helperText={formErrors.ingredients && formErrors.ingredients[index]?.name || ''}
                    />
                     <TextField
                        label="Σημειώσεις"
                        variant="outlined"
                        size="small"
                        value={ingredient.notes}
                        onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                        sx={{ width: '150px' }}
                        // Δεν έχουμε error state για σημειώσεις προς το παρόν
                    />
                    {ingredientsList.length > 1 && ( // Εμφάνιση διαγραφής μόνο αν υπάρχει πάνω από μία γραμμή
                         <IconButton onClick={() => removeIngredientField(index)} color="error" sx={{ mt: '5px' }} aria-label="delete ingredient">
                            <DeleteOutlineIcon />
                        </IconButton>
                    )}
                 </Stack>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={addIngredientField}
                startIcon={<AddCircleOutlineIcon />}
                sx={{ mt: 1 }}
              >
                Προσθήκη Συστατικού
              </Button>
              {/* --- ΤΕΛΟΣ ΕΝΟΤΗΤΑΣ ΣΥΣΤΑΤΙΚΩΝ --- */}


              {/* --- Πεδίο Βημάτων (Παραμένει Textarea) --- */}
              <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}> Βήματα Εκτέλεσης </Typography>
              <TextField
                 margin="normal"
                 fullWidth
                 id="steps"
                 label="Βήματα (ένα ανά γραμμή)"
                 name="steps"
                 multiline
                 rows={8}
                 value={steps}
                 onChange={(e) => handleFieldChange(setSteps, 'steps', e.target.value)} // Ενημέρωση για καθαρισμό σφάλματος
                 disabled={loading}
                 helperText="Γράψτε κάθε βήμα σε νέα γραμμή."
                 error={!!formErrors.steps} // Αν προσθέσεις validation για βήματα
                 // helperText={formErrors.steps || "Γράψτε κάθε βήμα σε νέα γραμμή."}
               />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Αποθήκευση Συνταγής'}
              </Button>
            </Box>
          </Box>
        </Paper>
      );
}
export default RecipeForm;