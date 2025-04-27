// frontend/src/components/RecipeEditForm.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
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
    const [ingredients, setIngredients] = useState(['']);
    const [steps, setSteps] = useState(['']);
    const [category, setCategory] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { id: recipeId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        setInitialLoading(true);
        fetch(`/api/recipes/${recipeId}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch recipe data');
                return res.json();
            })
            .then(data => {
                setTitle(data.title);
                setDescription(data.description || '');
                setIngredients(data.ingredients ? data.ingredients.join('\n') : '');
                setSteps(data.steps ? data.steps.join('\n') : '');
                setCategory(data.category || '');
                setInitialLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError("Αποτυχία φόρτωσης δεδομένων συνταγής.");
                setInitialLoading(false);
            });
    }, [recipeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!user || !user.token) {
            setError('Απαιτείται σύνδεση για να επεξεργαστείτε τη συνταγή.');
            setLoading(false);
            return;
        }
        if (!title.trim() || !category) {
            setError('Ο τίτλος και η κατηγορία είναι υποχρεωτικά.');
            setLoading(false);
            return;
        }

        const updatedRecipeData = {
            title,
            description,
            ingredients: ingredients.split('\n').filter(line => line.trim() !== ''),
            steps: steps.split('\n').filter(line => line.trim() !== ''),
            category
        };

        try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(updatedRecipeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'HTTP error! status: ${response.status}');
            }

            console.log('Recipe updated successfully');
            navigate(`/recipes/${recipeId}`); // Redirect to the recipe detail page after successful update

        } catch (err) {
            console.error('Failed to update recipe:', err);
            setError(err.message || 'Η ενημέρωση απέτυχε.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return ( <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box> );
    }

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, maxWidth: '600px', margin: 'auto', mt: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                    Επεξεργασία Συνταγής
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                    <TextField margin="normal" required fullWidth id="edit-title" label="Τίτλος Συνταγής" name="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading}/>
                    <TextField margin="normal" fullWidth id="edit-description" label="Περιγραφή" name="description" multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading}/>
                    <FormControl fullWidth required margin="normal" disabled={loading}>
                        <InputLabel id="category-select-label">Κατηγορία</InputLabel>
                        <Select
                            labelId="category-select-label"
                            id="category-select"
                            value={category}
                            label="Κατηγορία"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Επιλέξτε Κατηγορία</em>
                            </MenuItem>

                            <MenuItem value={'Ορεκτικό'}>Ορεκτικό</MenuItem>
                            <MenuItem value={'Κυρίως Πιάτο'}>Κυρίως Πιάτο</MenuItem>
                            <MenuItem value={'Σαλάτα'}>Σαλάτα</MenuItem>
                            <MenuItem value={'Σούπα'}>Σούπα</MenuItem>
                            <MenuItem value={'Γλυκό'}>Γλυκό</MenuItem>
                            <MenuItem value={'Ρόφημα'}>Ρόφημα</MenuItem>
                            <MenuItem value={'Άλλο'}>Άλλο</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField margin="normal" fullWidth id="edit-ingredients" label="Συστατικά (ένα ανά γραμμή)" name="ingredients" multiline rows={5} value={ingredients} onChange={(e) => setIngredients(e.target.value)} disabled={loading} helperText="Γράψτε κάθε συστατικό σε νέα γραμμή."/>
                    <TextField margin="normal" fullWidth id="edit-steps" label="Βήματα (ένα ανά γραμμή)" name="steps" multiline rows={8} value={steps} onChange={(e) => setSteps(e.target.value)} disabled={loading} helperText="Γράψτε κάθε βήμα σε νέα γραμμή."/>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading || initialLoading}
                        >

                            {loading ? <CircularProgress size={24} /> : 'Αποθήκευση Αλλαγών'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        );
    }

export default RecipeEditForm;