import React, {useEffect, useState} from 'react';
import {FileText, BarChart3, Bell, History, FileJson, FileSpreadsheet, FileType, PieChart, TrendingUp} from 'lucide-react';
import { api } from '../../shared/api/api.js';

// Pequeño componente para las tarjetas de capacidad de exportación
const ExportCard = ({icon: Icon, title, format, onExport}) => (
    <button
        onClick={() => onExport(format)}
        className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-md transition-all duration-300"
    >
        <Icon className="w-10 h-10 text-blue-600 mb-2"/>
        <h4 className="font-semibold text-gray-800 dark:text-white">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Exportar datos en formato .{format}</p>
    </button>
);

// Componente para las tarjetas de resumen en el header (estilo StatsCard)
const SummaryCard = ({icon: Icon, title, subtitle, color}) => (
    <div className={`p-4 rounded-lg shadow-sm text-white ${color} flex items-center`}>
        <Icon className="w-8 h-8 mr-3 opacity-90"/>
        <div>
            <p className="font-bold">{title}</p>
            <p className="text-blue-100 text-xs">{subtitle}</p>
        </div>
    </div>
);

// Componente de Barra de Progreso Simple para el Dashboard
const ProgressBar = ({ label, value, color = "bg-blue-600", subValue }) => (
    <div className="mb-4">
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {value}% {subValue && <span className="text-xs text-gray-500">({subValue})</span>}
            </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(value, 100)}%` }}></div>
        </div>
    </div>
);

// Componente de Barra Horizontal para Inversión (Simulando gráfico)
const SectorBar = ({ label, amount, maxAmount }) => {
    const percentage = (amount / maxAmount) * 100;
    return (
        <div className="mb-3 group">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300 truncate w-1/2">{label}</span>
                <span className="text-gray-600 dark:text-gray-400">${amount.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-sm h-4 dark:bg-gray-700 relative overflow-hidden">
                <div
                    className="bg-emerald-500 h-full rounded-sm transition-all duration-1000 ease-out group-hover:bg-emerald-400"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default function ReportsPage() {
    const [stats, setStats] = useState({
        inversion_sector: [],
        avance_entidad: [],
        alineacion_ods: []
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            // Usamos datos simulados si falla la API o mientras se desarrolla el backend real
            // En producción, descomentar la llamada real:
            const response = await api.get('/reports/dashboard-stats/');
            setStats(response);
        } catch (error) {
            console.error("Error cargando estadísticas, usando datos mock:", error);
            // Datos Mock para visualización inmediata si no hay backend listo
            setStats({
                inversion_sector: [
                    { sector: 'Infraestructura Vial', total: 125000000 },
                    { sector: 'Salud Pública', total: 89000000 },
                    { sector: 'Educación', total: 65000000 },
                    { sector: 'Tecnología', total: 45000000 },
                ],
                avance_entidad: [
                    { entidad_responsable: 'Ministerio de Obras', promedio_fisico: 78, promedio_financiero: 65 },
                    { entidad_responsable: 'Ministerio de Salud', promedio_fisico: 45, promedio_financiero: 50 },
                    { entidad_responsable: 'Secretaría de Educación', promedio_fisico: 92, promedio_financiero: 90 },
                ],
                alineacion_ods: []
            });
        } finally {
            setLoadingStats(false);
        }
    };

    // Función especializada para manejar la descarga de archivos desde la API
    const handleExport = async (format) => {
        const token = localStorage.getItem('authToken'); // Obtener token como en api.js
        if (!token) {
            console.error('Token no encontrado en localStorage');
        }
        const url = `http://127.0.0.1:8000/api/v1/reports/export/?format=${format}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta de la red');
            }

            // Convertimos la respuesta en un blob (un objeto tipo archivo)
            const blob = await response.blob();

            // Creamos una URL temporal para el blob
            const downloadUrl = window.URL.createObjectURL(blob);

            // Creamos un enlace 'a' invisible para iniciar la descarga
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `reporte_alineaciones.${format}`); // Nombre del archivo
            document.body.appendChild(link);
            link.click();

            // Limpiamos el enlace y la URL del blob
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Hubo un error al exportar el reporte:', error);
            // Aquí podrías mostrar una notificación de error al usuario
        }
    };

    return (
        <div className="space-y-6">
            {/* Encabezado estilo InvestmentProjectsPage */}
            <div className="bg-blue-600 dark:bg-blue-800 text-white p-6 rounded-lg shadow-lg transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Módulo de Reportes y Visualización</h2>
                        <p className="text-blue-100 text-sm mt-1">Gestión de reportes, exportación de datos y visualización histórica</p>
                    </div>
                    {/* Botón de exportar eliminado según requerimiento */}
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard icon={FileText} title="Exportación" subtitle="PDF, Excel, JSON, CSV" color="bg-blue-500"/>
                    <SummaryCard icon={BarChart3} title="Visualización" subtitle="Dashboards dinámicos" color="bg-blue-500"/>
                    <SummaryCard icon={Bell} title="Alertas" subtitle="Reportes dinámicos" color="bg-blue-500"/>
                    <SummaryCard icon={History} title="Histórico" subtitle="Desde 2011" color="bg-blue-500"/>
                </div>
            </div>

            {/* Capacidades de Exportación */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Capacidades de Exportación</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ExportCard icon={FileType} title="PDF" format="pdf" onExport={handleExport}/>
                    <ExportCard icon={FileSpreadsheet} title="Excel" format="excel" onExport={handleExport}/>
                    <ExportCard icon={FileJson} title="JSON" format="json" onExport={handleExport}/>
                    <ExportCard icon={FileType} title="CSV" format="csv" onExport={handleExport}/>
                </div>
            </div>

            {/* Paneles de Visualización (Dashboards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Inversión por Sector */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                    <div className="flex items-center mb-6">
                        <BarChart3 className="w-5 h-5 text-emerald-500 mr-2"/>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Inversión Total por Sector</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {loadingStats ? <p>Cargando datos...</p> : (
                            stats.inversion_sector.map((item, index) => (
                                <SectorBar 
                                    key={index} 
                                    label={item.sector || 'Sin Sector'} 
                                    amount={item.total} 
                                    maxAmount={Math.max(...stats.inversion_sector.map(s => s.total))} 
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Gráfico de Avance por Entidad */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                    <div className="flex items-center mb-6">
                        <TrendingUp className="w-5 h-5 text-blue-500 mr-2"/>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Avance Global</h2>
                    </div>
                    {loadingStats ? <p>Cargando...</p> : stats.avance_entidad.map((entidad, idx) => (
                        <div key={idx} className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                            <p className="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-200">{entidad.entidad_responsable}</p>
                            <ProgressBar label="Físico" value={entidad.promedio_fisico} color="bg-blue-500" />
                            <ProgressBar label="Financiero" value={entidad.promedio_financiero} color="bg-green-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}