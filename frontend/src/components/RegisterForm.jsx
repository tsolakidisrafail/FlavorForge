import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Registering:', { name, email });

    if (password.length < 6) {
        setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
        setLoading(false);
        return;
    }

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        console.log('Registration successful:', data);
        navigate('/login');

    } catch (error) {
        console.error('Registration failed:', error);
        setError(error.message || 'Η εγγραφή απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: '400px', margin: 'auto', mt: 4 }}>
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Εγγραφή Νέου Χρήστη
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Όνομα"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="register-email"
            label="Διεύθυνση Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            type="email"
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Κωδικός Πρόσβασης"
            type="password"
            id="register-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Εγγραφή'}
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  {"Έχετε ήδη λογαριασμό; Σύνδεση"}
                </Typography>
              </RouterLink>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
export default RegisterForm;