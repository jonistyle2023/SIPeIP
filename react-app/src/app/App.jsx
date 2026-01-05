import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import '../shared/styles/App.css';
import {AppRouter} from './AppRouter.jsx';

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
            <AppRouter 
                isAuthenticated={isAuthenticated} 
                user={user} 
                onLoginSuccess={handleLoginSuccess} 
                onLogout={handleLogout} 
            />
        </Router>
    );
}