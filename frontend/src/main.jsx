// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import Router dan AuthProvider
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* URUTAN Wajib: BrowserRouter membungkus semuanya */}
    <BrowserRouter>
      {/* AuthProvider membungkus App */}
      <AuthProvider>
        <App /> 
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
