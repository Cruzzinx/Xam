// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
// Sesuaikan jalur import AuthContext dari folder 'components' ke 'src/context'
import { useAuth } from '../context/AuthContext.jsx'; 

/**
 * Komponen pembungkus untuk mengamankan rute.
 * @param {object} props
 * @param {JSX.Element} props.children - Komponen yang ingin dilindungi (misalnya <Dashboard/>).
 * @param {string[]} props.requiredRole - Array peran yang diizinkan (misalnya: ['siswa', 'guru', 'admin']).
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    // Ambil status autentikasi dan data user dari Auth Context
    const { user, isAuthenticated } = useAuth();

    // 1. Cek Autentikasi
    if (!isAuthenticated) {
        // Jika belum login, redirect ke halaman login (rute "/")
        // 'replace' memastikan pengguna tidak bisa kembali ke halaman yang dilindungi dengan tombol back
        return <Navigate to="/" replace />;
    }

    // 2. Cek Otorisasi (Peran/Role)
    if (requiredRole && user && !requiredRole.includes(user.role)) {
        // Jika peran pengguna (user.role) tidak ada di dalam requiredRole, 
        // redirect ke halaman yang aman (misalnya dashboard utama)
        
        // Catatan: Anda bisa mengganti '/dashboard' dengan rute 403 (Forbidden)
        return <Navigate to="/dashboard" replace />; 
    }

    // Jika sudah login dan memiliki peran yang benar, render komponen yang diminta
    return children;
};

export default ProtectedRoute;