import React from 'react';
import { Bell, LogOut, Download, ChevronDown } from 'lucide-react'; // Se quita el import de 'User'

const Header = ({ user, onLogout, pageTitle }) => {
    return (
        <header className="flex items-center justify-between p-4 bg-white border-b">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">{pageTitle}</h2>
                <p className="text-sm text-gray-500">Seguimiento integral de planificación e inversión pública</p>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-600">2024</span>
                    <ChevronDown size={20} className="text-gray-600" />
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <Download size={18} className="mr-2" />
                    Exportar
                </button>
                <Bell size={24} className="text-gray-600" />
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                        <p className="font-semibold text-sm text-gray-800">{user?.nombre_usuario || 'Usuario'}</p>
                        {/* CORRECCIÓN: Se usa 'user?.roles' para evitar el error si user o roles no existen */}
                        <p className="text-xs text-gray-500">{user?.roles?.join(', ') || 'Rol'}</p>
                    </div>
                    <LogOut size={20} className="text-gray-600 cursor-pointer" onClick={onLogout} />
                </div>
            </div>
        </header>
    );
};

// Se añade la línea de exportación que faltaba
export default Header;