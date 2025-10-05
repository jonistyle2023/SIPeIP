import React from 'react';
import { Archive } from 'lucide-react';
import MonitoringPlaceholderPage from './MonitoringPlaceholderPage';

export default function ClosureMonitoringPage() {
    return <MonitoringPlaceholderPage
        icon={Archive}
        title="Seguimiento a Cierre y Baja de Proyectos"
        description="Gestión del ciclo de vida final de los proyectos."
    />;
}