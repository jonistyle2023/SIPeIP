import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true); // Añadir estado de carga

    useEffect(() => {
        // Al iniciar, intentar cargar el usuario desde localStorage
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            // Asumimos que el backend ya validó el token, aquí solo restauramos el estado del frontend
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error al parsear el usuario de localStorage:", e);
                logout(); // Si hay un error, limpiar la sesión
            }
        }
        setLoading(false); // Terminar la carga inicial
    }, [token]); // Dependencia 'token' para re-evaluar si el token cambia

    const login = (loginData) => {
        // Asumimos que loginData es el objeto de respuesta completo, ej: { token: "...", user: { ... } }
        const newToken = loginData.token;
        const userData = loginData.user; // Asumimos que el backend devuelve un objeto 'user' con roles

        if (newToken && userData) {
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setToken(newToken);
            setUser(userData);
        } else {
            console.error("La respuesta del login no contenía un token o un objeto de usuario válido.");
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const hasRole = (roleName) => {
        // Asumimos que el objeto 'user' tiene un array 'roles' con los nombres de los grupos
        return user?.roles?.includes(roleName) ?? false;
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
        isAuthenticated: !!user,
    };

    // No renderizar nada hasta que se haya verificado el estado de autenticación inicial
    if (loading) {
        return null; // O un spinner de carga global
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
