import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AuditPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-colors">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <ShieldCheck className="mr-3 text-blue-600 dark:text-blue-400"/>
                    Módulo de Auditoría y Trazabilidad
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Consulta y seguimiento de todas las acciones realizadas en el sistema.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm text-center transition-colors">
                <h3 className="font-semibold dark:text-white">Vista Global de Auditoría</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    (Funcionalidad futura: Aquí se implementarán los filtros para buscar eventos por usuario, fecha o tipo de acción en todo el sistema).
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                    Por ahora, el historial de cambios se puede consultar en la pestaña de "Historial" dentro de la página de detalle de cada objeto (ej: Proyectos de Inversión).
                </p>
            </div>
        </div>
    );
}