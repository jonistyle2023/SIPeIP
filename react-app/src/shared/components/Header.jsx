import React, {useState, useEffect} from 'react';
import {FiCalendar, FiMenu, FiX} from 'react-icons/fi';
import {LogOut} from 'lucide-react';
import {ThemeToggle} from './ThemeToggle';

const Header = ({user, onLogout, pageTitle, onOpenSidebar, sidebarOpen}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const dateString = new Date().toLocaleDateString();

    useEffect(() => {
        if (typeof sidebarOpen === 'boolean') setIsSidebarOpen(sidebarOpen);
    }, [sidebarOpen]);

    return (
        <header
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 shadow-md relative z-[70] transition-colors duration-200">

            <div className="flex items-center gap-3">
                <button
                    className="text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border dark:border-slate-600 shadow rounded-full p-2.5 transition-colors hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                        onOpenSidebar?.();
                        setIsSidebarOpen(v => !v);
                    }}
                    aria-label={isSidebarOpen ? 'Ocultar menú lateral' : 'Abrir menú lateral'}
                    aria-pressed={isSidebarOpen}>
                    {isSidebarOpen ? (
                        <FiX size={20} className="transition-transform duration-200 rotate-90 scale-110"/>
                    ) : (
                        <FiMenu size={20} className="transition-transform duration-200"/>
                    )}
                </button>

                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{pageTitle}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Seguimiento Integral de planificación e inversión pública del País</p>
                </div>

            </div>

            <button
                className="lg:hidden ml-2 text-gray-700 dark:text-gray-200"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menú de usuario">
                {menuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
            </button>

            <div className="hidden lg:flex items-center space-x-4">
                <ThemeToggle/>
                <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-md transition-colors">
                    <FiCalendar className="text-gray-600 dark:text-gray-300"/>
                    <span
                        className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">{dateString}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">{user?.nombre_usuario || 'Usuario'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.roles?.join(', ') || 'Rol'}</p>
                    </div>
                    <LogOut size={20}
                            className="text-gray-600 dark:text-gray-300 cursor-pointer hover:text-red-500 dark:hover:text-red-400"
                            onClick={onLogout}/>
                </div>
            </div>

            {menuOpen && (
                <div
                    className="absolute top-full right-0 w-64 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 flex flex-col space-y-4 lg:hidden z-50 border dark:border-slate-700">
                    <div className="flex justify-end">
                        <ThemeToggle/>
                    </div>
                    <div className="flex items-center">
                        <FiCalendar className="text-gray-600 dark:text-gray-300"/>
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">{dateString}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-white">{user?.nombre_usuario || 'Usuario'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.roles?.join(', ') || 'Rol'}</p>
                        </div>
                        <LogOut size={20} className="text-gray-600 dark:text-gray-300 cursor-pointer"
                                onClick={onLogout}/>
                    </div>
                </div>
            )}

        </header>
    );
};

export default Header;