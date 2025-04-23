// frontend/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (!user) {
        // Redirect to the login page if the user is not authenticated
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // If the user is authenticated, render the children components
    return children;
};

export default ProtectedRoute;