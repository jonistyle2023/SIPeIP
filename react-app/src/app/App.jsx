import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import HomePage from '../features/home/HomePage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import '../shared/styles/App.css';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

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
        localStorage.setItem('usuario', JSON.stringify(userData.usuario));
        setUser(userData.usuario);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usuario');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={<HomePageWrapper isAuthenticated={isAuthenticated}/>}
                />
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard"/> :
                        <LoginPage onLoginSuccess={handleLoginSuccess}/>}
                />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <DashboardLayout user={user} onLogout={handleLogout}/> :
                        <Navigate to="/"/>}
                />
            </Routes>
        </Router>
    );
}

function HomePageWrapper({isAuthenticated}) {
    const navigate = useNavigate();
    return isAuthenticated ? <Navigate to="/dashboard"/> : <HomePage onNavigateToLogin={() => navigate('/login')}/>;
}