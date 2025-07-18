import React, { useState } from 'react';
import DashboardPage from '../pages/DashboardPage';
import StrategicObjectivesPage from '../pages/StrategicObjectivesPage';
import InvestmentProjectsPage from '../pages/InvestmentProjectsPage';
import PaiPrioritizationPage from '../pages/PaiPrioritizationPage';
import ConfigurationPage from '../pages/ConfigurationPage';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout({user, onLogout}) {
    const [activePage, setActivePage] = useState('Panel Principal');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activePage) {
            case 'Panel Principal':
                return <DashboardPage />;
            case 'Planificación':
                return <StrategicObjectivesPage />;
            case 'Inversión':
                return <InvestmentProjectsPage />;
            case 'Priorización PAI':
                return <PaiPrioritizationPage />;
            case 'Usuarios':
            case 'Institucional':
                return <ConfigurationPage initialTab={activePage} setActivePage={setActivePage} />;
            default:
                return <div>Página: {activePage} - En construcción...</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="hidden lg:flex lg:flex-shrink-0">
                <Sidebar activePage={activePage} setActivePage={setActivePage} />
            </div>

            <div
                className={`fixed inset-0 z-40 flex transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="w-64 bg-white shadow-md h-full">
                    <Sidebar activePage={activePage} setActivePage={(page) => {
                        setActivePage(page);
                        setSidebarOpen(false);
                    }} />
                </div>
                <div className="flex-1" onClick={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={onLogout} pageTitle={activePage}
                        onOpenSidebar={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}