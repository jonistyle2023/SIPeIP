import React, { useState, useEffect } from 'react';
import HomePage from '../features/home/HomePage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import '../shared/styles/App.css';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('home');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const usuario = localStorage.getItem('usuario');
        if (token && usuario) {
            setUser(JSON.parse(usuario));
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('usuario', JSON.stringify(userData.usuario)); // Guarda el usuario
        setUser(userData.usuario);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario'); // Elimina el usuario
        setUser(null);
        setIsAuthenticated(false);
        setCurrentPage('home');
    };

    const navigateToLogin = () => setCurrentPage('login');

    if (isAuthenticated) {
        return <DashboardLayout user={user} onLogout={handleLogout} />;
    }

    return (
        <div>
            {currentPage === 'home' && <HomePage onNavigateToLogin={navigateToLogin} />}
            {currentPage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
        </div>
    );
}