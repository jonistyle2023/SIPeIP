import React, {useState} from 'react';
import {FiCalendar, FiMenu, FiX} from 'react-icons/fi';
import {LogOut} from 'lucide-react';

const Header = ({user, onLogout, pageTitle, onOpenSidebar}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const dateString = new Date().toLocaleDateString();

    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md relative">
            <button
                className="lg:hidden mr-2 text-gray-700"
                onClick={onOpenSidebar}
                aria-label="Abrir menú lateral"
            >
                <FiMenu size={24}/>
            </button>
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">{pageTitle}</h2>
                <p className="text-sm text-gray-500">Seguimiento integral de planificación e inversión pública</p>
            </div>
            <button
                className="lg:hidden ml-2 text-gray-700"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menú de usuario"
            >
                {menuOpen ? <FiX size={24}/> : <FiMenu size={24}/>}
            </button>
            <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md">
                    <FiCalendar className="text-gray-600"/>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">{dateString}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{user?.nombre_usuario || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">{user?.roles?.join(', ') || 'Rol'}</p>
                    </div>
                    <LogOut size={20} className="text-gray-600 cursor-pointer" onClick={onLogout}/>
                </div>
            </div>
            {menuOpen && (
                <div
                    className="absolute top-full right-0 w-64 bg-white shadow-lg rounded-lg p-4 flex flex-col space-y-4 lg:hidden z-50">
                    <div className="flex items-center">
                        <FiCalendar className="text-gray-600"/>
                        <span className="ml-2 text-sm font-medium text-gray-700">{dateString}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div>
                            <p className="font-semibold text-sm text-gray-800">{user?.nombre_usuario || 'Usuario'}</p>
                            <p className="text-xs text-gray-500">{user?.roles?.join(', ') || 'Rol'}</p>
                        </div>
                        <LogOut size={20} className="text-gray-600 cursor-pointer" onClick={onLogout}/>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;