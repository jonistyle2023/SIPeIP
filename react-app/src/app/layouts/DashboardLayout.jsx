import React, { useState, useEffect } from 'react';
import DashboardPage from '../../features/dashboard/DashboardPage.jsx';
import StrategicObjectivesPage from '../../features/strategic-objectives/StrategicObjectivesPage.jsx';
import InvestmentProjectsPage from '../../features/investment-projects/InvestmentProjectsPage.jsx';
import PaiPrioritizationPage from '../../features/pai-prioritization/PaiPrioritizationPage.jsx';
import ConfigurationPage from '../../features/configuration/ConfigurationPage.jsx';
import ReportsPage from '../../features/reports/ReportsPage';
import Sidebar from '../../shared/components/Sidebar.jsx';
import Header from '../../shared/components/Header.jsx';
import AuditPage from '../../features/audit/AuditPage';
import PlanningMonitoringPage from '../../features/monitoring/PlanningMonitoringPage';
import InvestmentMonitoringPage from '../../features/monitoring/InvestmentMonitoringPage';
import WorksMonitoringPage from '../../features/monitoring/WorksMonitoringPage';
import ClosureMonitoringPage from '../../features/monitoring/ClosureMonitoringPage';

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
                return <InvestmentProjectsPage />;
            case 'Priorización PAI':
                return <PaiPrioritizationPage />;
            case 'Reportería':
                return <ReportsPage />;
            case 'Usuarios':
            case 'Institucional':
            case 'Priorización':
                return <ConfigurationPage />;
            default:
                return <DashboardPage />;
            case 'Auditoría':
                return <AuditPage />;
            case 'Seguimiento Planificación':
                return <PlanningMonitoringPage />;
            case 'Seguimiento Inversión':
                return <InvestmentMonitoringPage />;
            case 'Seguimiento Obras':
                return <WorksMonitoringPage />;
            case 'Seguimiento Cierre':
                return <ClosureMonitoringPage />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    user={user}
                    onLogout={onLogout}
                    onOpenSidebar={() => setSidebarOpen(!sidebarOpen)} // Alterna el estado del Sidebar
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}