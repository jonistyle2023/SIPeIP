import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const addNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 5000); // Ocultar después de 5 segundos
    }, []);

    const value = { addNotification };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {notification && (
                <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
                    {notification.message}
                </div>
            )}
        </NotificationContext.Provider>
    );
};
