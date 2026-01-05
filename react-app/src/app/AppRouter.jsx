import React from 'react';
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import HomePage from '../features/home/HomePage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

export const AppRouter = ({ isAuthenticated, user, onLoginSuccess, onLogout }) => {
    return (
        <Routes>
            <Route
                path="/"
                element={<HomePageWrapper isAuthenticated={isAuthenticated}/>}
            />
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard"/> :
                    <LoginPage onLoginSuccess={onLoginSuccess}/>}
            />
            <Route
                path="/dashboard"
                element={isAuthenticated ? <DashboardLayout user={user} onLogout={onLogout}/> :
                    <Navigate to="/"/>}
            />
        </Routes>
    );
};

function HomePageWrapper({isAuthenticated}) {
    const navigate = useNavigate();
    return isAuthenticated ? <Navigate to="/dashboard"/> : <HomePage onNavigateToLogin={() => navigate('/login')}/>;
}