// frontend/src/context/AuthProvider.js
import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user info from localStorage", error);
                localStorage.removeItem('userInfo'); // Clear invalid data
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    if (loading) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// export default AuthContext;