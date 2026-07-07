import React, { useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

/**
 * ProtectedRoute component that guards authenticated routes.
 * Redirects to login page if user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
    const { token, navigate } = useContext(ShopContext);

    useEffect(() => {
        if (!token) {
            toast.error("Please login to access this page");
            navigate('/login');
        }
    }, [token, navigate]);

    // If no token, don't render children (will redirect)
    if (!token) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
