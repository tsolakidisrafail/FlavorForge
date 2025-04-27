// frontend/src/components/RecipeList.jsx
import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

function RecipeList() {
  // State variables
  const [selectedCategory, setSelectedCategory] = useState('');
  const categories = [
    'Ορεκτικό',
    'Κυρίως Πιάτο',
    'Σαλάτα',
    'Σούπα',
    'Γλυκό',
    'Ρόφημα',
    'Άλλο'
  ];
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Adjust the debounce delay as needed

    return () => {
      clearTimeout(timerId);
    }
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();

    const termToSearch = debouncedSearchTerm.trim();
    if (termToSearch) {
      params.append('search', termToSearch);
    }

    if (selectedCategory) {
      params.append('category', selectedCategory);
    }

    const queryString = params.toString();
    const apiUrl = `/api/recipes${queryString ? `?${queryString}` : ''}`;

    console.log(`Fetching recipes from (debounced + category): ${apiUrl}`);

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching recipes:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [debouncedSearchTerm, selectedCategory]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>Error loading recipes: {error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Συνταγές
      </Typography>

      <TextField
        label="Αναζήτηση συνταγής..."
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 4 }}
      />

      <FormControl fullWidth margin="normal" sx={{ mb: 4 }}>
        <InputLabel id="category-filter-label">Φίλτρο Κατηγορίας</InputLabel>
        <Select
          labelId="category-filter-label"
          id="category-filter"
          value={selectedCategory}
          label="Φίλτρο Κατηγορίας"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <MenuItem value="">
            <em>Όλες οι Κατηγορίες</em>
          </MenuItem>
          {categories.map((categoryName) => (
            <MenuItem key={categoryName} value={categoryName}>
              {categoryName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {recipes.length > 0 ? (
        <Grid container spacing={3}>
          {recipes.map((recipe => (
            <Grid item xs={12} sm={6} md={4} key={recipe._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {recipe.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recipe.description?.substring(0, 100)}{recipe.description?.length > 100 ? '...' : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Βαθμολογία: {recipe.rating ? recipe.rating.toFixed(1) : 'N/A'} ({recipe.numReviews || 0})
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/recipes/${recipe._id}`}
                  >
                    Δες Λεπτομέρειες
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )))}
        </Grid>
      ) : (
        <Typography sx={{ mt: 2}}>
          Δεν βρέθηκαν συνταγές{searchTerm ? ` για τον όρο "${searchTerm}"` : ''}.
        </Typography>
      )}
    </Box>
  );
}
export default RecipeList;