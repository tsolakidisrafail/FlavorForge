import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from './context/SnackbarProvider';


const theme = createTheme({
  palette: {
    primary: {
      main: '#885133',
    },
    secondary: {
      main: '#f4f0ec',
    },
    background: {
      default: '#f0e6d7',
    },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });
      


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <BrowserRouter>
      <AuthProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);