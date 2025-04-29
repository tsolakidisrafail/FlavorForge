import { createContext } from 'react';

const SnackbarContext = createContext({
    // eslint-disable-next-line no-unused-vars
    showSnackbar: (message, severity) => {
        console.warn('showSnackbar called outside of SnackbarProvider');
    }
});

export default SnackbarContext;