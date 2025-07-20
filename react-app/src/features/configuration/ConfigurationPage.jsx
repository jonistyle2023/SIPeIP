import React, { useState, useEffect } from 'react';
import UsersContent from './UsersContent.jsx';
import InstitutionalContent from './InstitutionalContent.jsx';

export default function ConfigurationPage({ initialTab, setActivePage }) {
    // El estado local maneja 'usuarios' o 'institucional'
    const [activeTab, setActiveTabLocal] = useState(initialTab === 'Usuarios' ? 'usuarios' : 'institucional');

    // Sincroniza el estado local si la prop cambia (al hacer clic en el sidebar)
    useEffect(() => {
        setActiveTabLocal(initialTab === 'Usuarios' ? 'usuarios' : 'institucional');
    }, [initialTab]);

    const handleTabClick = (tab, pageName) => {
        setActiveTabLocal(tab);
        setActivePage(pageName); // Actualiza el estado en el layout principal
    };

    return (
        <div className="space-y-8">
            {/* Pestañas de Navegación */}
            <div className="flex border-b">
                <button onClick={() => handleTabClick('usuarios', 'Usuarios')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'usuarios' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
                    Gestión de Usuarios
                </button>
                <button onClick={() => handleTabClick('institucional', 'Institucional')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'institucional' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
                    Configuración Institucional
                </button>
            </div>

            {/* Renderizado de contenido condicional */}
            {activeTab === 'usuarios' && <UsersContent />}
            {activeTab === 'institucional' && <InstitutionalContent />}
        </div>
    );
}