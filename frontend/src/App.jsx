// src/App.jsx (VERSI LENGKAP)

// Wajib ada untuk JSX
import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Pastikan semua komponen ini di-import
import Dashboard from "./pages/dashboard/Index";
import Login from "./pages/auth/index";
import Register from "./pages/register/index";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Exams from "./pages/exams/Index.jsx";
import ExamDetailPage from "./pages/exams/Index.jsx";
import ProfilePage from "./pages/profile/Index.jsx";
import HistoryPage from "./pages/grades/Index.jsx";
import Leaderboard from "./pages/grades/Leaderboard.jsx";
import ExamScene from "./pages/exams/examScene.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import ManageTeachers from "./pages/admin/ManageTeachers.jsx";
import ManageExams from "./pages/admin/ManageExams.jsx";
import DataNilai from "./pages/admin/DataNilai.jsx";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/exams/:subjectId/start" element={<ExamScene />} />

        {/* PENGGUNAAN PROTECTED ROUTE */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole={['siswa', 'guru', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Rute Admin/Guru */}
        <Route
          path="/manage-users"
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-teachers"
          element={
            <ProtectedRoute requiredRole={['admin']}>
              <ManageTeachers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-questions"
          element={
            <ProtectedRoute requiredRole={['guru', 'admin']}>
              <ManageExams />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-nilai"
          element={
            <ProtectedRoute requiredRole={['guru', 'admin']}>
              <DataNilai />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exams"
          element={
            <ProtectedRoute requiredRole={['siswa', 'guru', 'admin']}>
              <Exams />
            </ProtectedRoute>
          }
        />

        <Route path="/exams/:subjectId" element={<ExamDetailPage />} />
        <Route path="/grades" element={<HistoryPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<ProfilePage />} />

      </Routes>
    </>
  )
}

// BARIS INI WAJIB ADA UNTUK EXPORT DEFAULT
const AppWithProviders = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWithProviders;
