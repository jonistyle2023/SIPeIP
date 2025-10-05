import React from 'react';
import { DollarSign } from 'lucide-react';
import MonitoringPlaceholderPage from './MonitoringPlaceholderPage';

export default function InvestmentMonitoringPage() {
    return <MonitoringPlaceholderPage
        icon={DollarSign}
        title="Seguimiento a la Inversión"
        description="Control de la ejecución presupuestaria de los proyectos de inversión."
    />;
}