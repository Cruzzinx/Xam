// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. BUAT CONTEXT
const AuthContext = createContext(null);

// 2. BUAT PROVIDER
export const AuthProvider = ({ children }) => {
    // Ambil token dan user dari localStorage saat inisialisasi
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error parsing user from localStorage", error);
            return null;
        }
    });

    // Simpan data ke localStorage setiap kali berubah
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user, token]);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const isAuthenticated = !!token && !!user;

    // Helper untuk request yang butuh Auth
    const getAuthHeaders = () => {
        return {
            'Authorization': `Bearer ${token}`
        };
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateUser, getAuthHeaders }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. CUSTOM HOOK
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};