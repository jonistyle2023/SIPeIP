import React, { useState, useEffect } from 'react';
import { Users, Settings, ListChecks } from 'lucide-react';

// --- CORRECCIÓN: Importamos tus componentes existentes ---
import UsersContent from './UsersContent';
import InstitutionalContent from './InstitutionalContent';
import CriteriosManager from './CriteriosManager';

// Componente para un botón de pestaña
const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-4 py-2 text-sm font-medium ${
            isActive
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        <Icon size={16} className="mr-2" />
        {label}
    </button>
);

export default function ConfigurationPage({ initialTab, setActivePage }) {
    // El estado local ahora maneja 'usuarios', 'institucional', o 'criterios'
    const [activeTab, setActiveTabLocal] = useState(initialTab === 'Usuarios' ? 'usuarios' : 'institucional');

    // Sincroniza el estado si la prop del layout principal cambia
    useEffect(() => {
        if (initialTab === 'Usuarios' || initialTab === 'Institucional') {
            setActiveTabLocal(initialTab === 'Usuarios' ? 'usuarios' : 'institucional');
        }
    }, [initialTab]);

    const handleTabClick = (tab, pageName) => {
        setActiveTabLocal(tab);
        if (pageName === 'Usuarios' || pageName === 'Institucional') {
            setActivePage(pageName);
        } else {
            setActivePage('Institucional');
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'usuarios':
                return <UsersContent />; // <-- Ahora usa tu componente importado
            case 'institucional':
                return <InstitutionalContent />; // <-- Ahora usa tu componente importado
            case 'criterios':
                return <CriteriosManager />;
            default:
                return <InstitutionalContent />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800">Módulo de Configuración</h2>
                <p className="text-gray-600 mt-1">Administración de parámetros, usuarios y criterios del sistema.</p>
            </div>

            {/* Menú de Pestañas Integrado */}
            <div className="border-b flex flex-wrap">
                <TabButton label="Gestión de Usuarios" icon={Users} isActive={activeTab === 'usuarios'} onClick={() => handleTabClick('usuarios', 'Usuarios')} />
                <TabButton label="Configuración Institucional" icon={Settings} isActive={activeTab === 'institucional'} onClick={() => handleTabClick('institucional', 'Institucional')} />
                <TabButton label="Criterios de Priorización" icon={ListChecks} isActive={activeTab === 'criterios'} onClick={() => handleTabClick('criterios', 'Institucional')} />
            </div>

            {/* Contenido de la pestaña activa */}
            <div>
                {renderContent()}
            </div>
        </div>
    );
}