import React from 'react';
import { HardHat } from 'lucide-react';
import MonitoringPlaceholderPage from './MonitoringPlaceholderPage';

export default function WorksMonitoringPage() {
    return <MonitoringPlaceholderPage
        icon={HardHat}
        title="Seguimiento a Obras"
        description="Verificación del avance físico y cumplimiento de cronogramas de obras."
    />;
}