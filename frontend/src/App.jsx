// frontend/src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import RecipeEditForm from './components/RecipeEditForm';
import './App.css';

function App() {
  const authContextValue = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContextValue) {
    console.error("AuthContext value is undefined. Ensure AuthProvider is used correctly.");
    return <div>Σφάλμα: Το AuthContext δεν είναι διαθέσιμο.</div>;
  }

  const { user, logout } = authContextValue;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              FlavorForge 🍳
            </RouterLink>
          </Typography>

          <Button color="inherit" component={RouterLink} to="/add-recipe">
            Προσθήκη Συνταγής
          </Button>
          {user ? (
            <>
              <Typography sx={{ mx: 2 }}>
                Καλώς ήρθες, {user.name}!
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Αποσύνδεση
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/register">
                Εγγραφή
              </Button>
              <Button color="inherit" component={RouterLink} to="/login">
                Σύνδεση
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/add-recipe" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
          <Route path="/recipes/:id/edit" element={<ProtectedRoute><RecipeEditForm /></ProtectedRoute>} />
        </Routes>
      </Container>

      <Box component="footer" sx={{ bgcolor: 'background.paper', p: 2, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            FlavorForge {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;