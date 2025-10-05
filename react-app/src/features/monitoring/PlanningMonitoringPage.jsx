import React from 'react';
import { ClipboardList } from 'lucide-react';
import MonitoringPlaceholderPage from './MonitoringPlaceholderPage';

export default function PlanningMonitoringPage() {
    return <MonitoringPlaceholderPage
        icon={ClipboardList}
        title="Seguimiento a la Planificación"
        description="Monitorización de avances y cumplimiento de planes estratégicos."
    />;
}