import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { FaSun, FaMoon } from 'react-icons/fa';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-yellow-500 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Alternar tema"
        >
            {theme === 'light' ? <FaMoon size={18} className="text-gray-600" /> : <FaSun size={18} />}
        </button>
    );
};