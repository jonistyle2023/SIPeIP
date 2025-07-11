import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardPage from '../pages/DashboardPage';
import ConfigurationPage from '../pages/ConfigurationPage'; // <-- Importamos la nueva página unificada

export default function DashboardLayout({ user, onLogout }) {
    const [activePage, setActivePage] = useState('Panel Principal');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activePage) {
            case 'Panel Principal':
                return <DashboardPage />;
            case 'Usuarios':
            case 'Institucional':
                return <ConfigurationPage initialTab={activePage} setActivePage={setActivePage} />;
            default:
                return <div>Página: {activePage} - En construcción...</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar en desktop */}
            <div className="hidden lg:block">
                <Sidebar activePage={activePage} setActivePage={setActivePage} />
            </div>
            {/* Sidebar deslizable en móviles */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="w-64 bg-white shadow-md h-full">
                        <Sidebar activePage={activePage} setActivePage={(page) => { setActivePage(page); setSidebarOpen(false); }} />
                    </div>
                    {/* Fondo oscuro para cerrar */}
                    <div className="flex-1 bg-opacity-30" onClick={() => setSidebarOpen(false)} />
                </div>
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={onLogout} pageTitle={activePage} onOpenSidebar={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}