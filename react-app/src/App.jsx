import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import './App.css';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState('home');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setUser({ nombre_usuario: 'j.doe', roles: ['Administrador (Admin)'] });
            setIsAuthenticated(true);
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('authToken', userData.token);
        setUser(userData.usuario);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
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