import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardPage from '../pages/DashboardPage';
import ConfigurationPage from '../pages/ConfigurationPage'; // <-- Importamos la nueva página unificada

export default function DashboardLayout({ user, onLogout }) {
    const [activePage, setActivePage] = useState('Panel Principal');

    const renderContent = () => {
        switch (activePage) {
            case 'Panel Principal':
                return <DashboardPage />;
            // Si la página activa es Usuarios o Institucional, renderizamos la página de Configuración
            // y le pasamos la pestaña inicial que debe mostrar.
            case 'Usuarios':
            case 'Institucional':
                return <ConfigurationPage initialTab={activePage} setActivePage={setActivePage} />;
            default:
                return <div>Página: {activePage} - En construcción...</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={onLogout} pageTitle={activePage} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}