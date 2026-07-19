import React, { useState, useEffect } from 'react';
import DashboardPage from '../../features/dashboard/DashboardPage.jsx';
import UsersContentPage from '../../features/configuration/UsersContent.jsx';
import StrategicObjectivesPage from '../../features/strategic-objectives/StrategicObjectivesPage.jsx';
import InvestmentProjectsPage from '../../features/investment-projects/InvestmentProjectsPage.jsx';
import PaiPrioritizationPage from '../../features/pai-prioritization/PaiPrioritizationPage.jsx';
import ConfigurationPage from '../../features/configuration/ConfigurationPage.jsx';
import ReportsPage from '../../features/reports/ReportsPage';
import Sidebar from '../../shared/components/Sidebar.jsx';
import Header from '../../shared/components/Header.jsx';
import AuditPage from '../../features/audit/AuditPage';
import PlanningMonitoringPage from '../../features/monitoring/PlanningMonitoringPage';
import {isAdmin} from '../../shared/utils/roles.js';

export default function DashboardLayout({ user, onLogout }) {
    const [activePage, setActivePage] = useState(
        localStorage.getItem('activePage') || 'Panel Principal'
    );
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('activePage', activePage);
    }, [activePage]);

    const renderContent = () => {
        switch (activePage) {
            case 'Panel Principal':
                return <DashboardPage />;
            case 'Planificación':
                return <StrategicObjectivesPage />;
            case 'Proyectos':
                return <InvestmentProjectsPage user={user} />;
            case 'Priorización PAI':
                return <PaiPrioritizationPage />;
            case 'Reportería':
                return <ReportsPage />;
            // Configuración (Usuarios/Institucional/Priorización): exclusivo de Admin,
            // igual que Auditoría — defensa en profundidad, el backend ya lo exige.
            case 'Usuarios':
                return isAdmin(user) ? <UsersContentPage /> : <DashboardPage />;
            case 'Institucional':
                return isAdmin(user) ? <ConfigurationPage initialTab="Institucional" setActivePage={setActivePage} /> : <DashboardPage />;
            case 'Priorización':
                return isAdmin(user) ? <ConfigurationPage initialTab="Criterios" setActivePage={setActivePage} /> : <DashboardPage />;
            case 'Configuración':
                return isAdmin(user) ? <ConfigurationPage setActivePage={setActivePage} /> : <DashboardPage />;
            case 'Auditoría':
                // Defensa en profundidad: el backend ya rechaza esto, pero evitamos
                // renderizar la consola de auditoría si el rol no es Admin.
                return isAdmin(user) ? <AuditPage /> : <DashboardPage />;
            case 'Seguimiento y Control':
                return <PlanningMonitoringPage />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-200">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                user={user}/>

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    user={user}
                    onLogout={onLogout}
                    onOpenSidebar={() => setSidebarOpen(!sidebarOpen)}/>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    {renderContent()}
                </main>

            </div>
        </div>
    );
}
