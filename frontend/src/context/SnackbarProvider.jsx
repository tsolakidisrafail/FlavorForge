// frontend/src/components/SnackbarProvider.jsx
import React, { useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import SnackbarContext from '../context/SnackbarContext'; // <-- Κάνουμε import το Context

// Το Provider Component
export const SnackbarProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info'); // default severity: info, success, error, warning

    // Η συνάρτηση που θα καλείται από τα άλλα components
    // Χρησιμοποιούμε useCallback για βελτιστοποίηση, ώστε η συνάρτηση
    // να μην επαναδημιουργείται σε κάθε render αν δεν αλλάξουν οι εξαρτήσεις (εδώ καμία).
    const showSnackbar = useCallback((newMessage, newSeverity = 'success') => {
        setMessage(newMessage);
        setSeverity(newSeverity);
        setOpen(true);
    }, []);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    // Η τιμή που περνάμε μέσω του context είναι ένα αντικείμενο
    // που περιέχει τη συνάρτηση showSnackbar.
    const contextValue = {
        showSnackbar,
    };

    return (
        // Παρέχουμε την τιμή contextValue σε όλα τα children components
        <SnackbarContext.Provider value={contextValue}>
            {children} {/* Η υπόλοιπη εφαρμογή */}

            {/* Το MUI Snackbar που θα εμφανίζει τα μηνύματα */}
            <Snackbar
                open={open}
                autoHideDuration={6000} // 6 δευτερόλεπτα
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {/* Χρησιμοποιούμε Alert μέσα στο Snackbar για σωστή εμφάνιση */}
                <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};
