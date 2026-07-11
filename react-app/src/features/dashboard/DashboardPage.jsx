import React, {useEffect, useState} from 'react';
import {
    DollarSign,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    BookOpen,
    Flag,
    Target,
    Users,
    Loader2
} from 'lucide-react';
import {BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {api} from '../../shared/api/api.js';

const SECTOR_COLORS = ['#704e99', '#008882', '#2563eb', '#3e2e6d', '#f9b43e', '#dc2626', '#0891b2'];

const currencyFormatter = new Intl.NumberFormat('es-EC', {style: 'currency', currency: 'USD', maximumFractionDigits: 0});

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get('/reports/dashboard-stats/');
                setStats(response);
            } catch (err) {
                console.error('Error cargando estadísticas del dashboard:', err);
                setError('No se pudieron cargar los datos del dashboard.');
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
                <Loader2 className="animate-spin mr-2" size={20}/> Cargando dashboard...
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow text-center text-red-500">
                {error || 'No hay datos disponibles.'}
            </div>
        );
    }

    const kpiData = [
        {title: 'Proyectos Activos', value: stats.kpis.proyectos_activos, icon: TrendingUp, color: 'green'},
        {title: 'Inversión Total Programada', value: currencyFormatter.format(stats.kpis.inversion_total), icon: DollarSign, color: 'blue'},
        {title: 'Avance Promedio', value: `${stats.kpis.avance_promedio}%`, icon: CheckCircle, color: 'yellow'},
        {title: 'Alertas Activas', value: stats.kpis.alertas_activas, icon: AlertTriangle, color: 'red'},
    ];

    const planningInstruments = [
        {name: 'ODS', value: `${stats.instrumentos_planificacion.ods_count} objetivos registrados`, icon: BookOpen, color: 'blue'},
        {name: 'PND', value: stats.instrumentos_planificacion.pnd_nombre || 'Sin PND registrado', icon: Flag, color: 'green'},
        {name: 'Sectoriales', value: `${stats.instrumentos_planificacion.sectoriales_count} planes vinculados`, icon: Target, color: 'purple'},
        {name: 'Institucionales', value: `${stats.instrumentos_planificacion.entidades_count} entidades participantes`, icon: Users, color: 'orange'},
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map(kpi => (
                    <div key={kpi.title} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow flex justify-between items-start transition-colors">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.title}</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{kpi.value}</p>
                        </div>
                        <div className={`p-3 rounded-full bg-${kpi.color}-100 dark:bg-${kpi.color}-900/30`}>
                            <kpi.icon size={24} className={`text-${kpi.color}-500`}/>
                        </div>
                    </div>
                ))}
            </div>

            {/* Consola de Indicadores y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Indicadores de Avance por Sector</h3>
                    <div className="space-y-4">
                        {stats.indicadores_sector.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No hay proyectos registrados aún.</p>
                        )}
                        {stats.indicadores_sector.map((indicator, idx) => (
                            <div key={indicator.sector}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{indicator.sector} <span
                                        className="text-xs text-gray-500 dark:text-gray-400">({indicator.projects} proyectos)</span></p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">{indicator.avance}%</p>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full" style={{
                                        width: `${indicator.avance}%`,
                                        backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length]
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Alertas Tempranas</h3>
                    <div className="space-y-3">
                        {stats.alertas.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No hay actividades en riesgo.</p>
                        )}
                        {stats.alertas.map((alert, idx) => (
                            <div key={idx}
                                 className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500">
                                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{alert.actividad}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{alert.proyecto} · vence {alert.fecha_limite}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Inversión Programada por Período</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ReBarChart data={stats.inversion_por_periodo}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="periodo"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="total" name="Inversión Programada" fill="#8884d8"/>
                        </ReBarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Avance por Sectores</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ReBarChart data={stats.indicadores_sector}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="sector"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="avance" name="Avance (%)" fill="#84cc16"/>
                        </ReBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alineación */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Alineación de Instrumentos de Planificación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {planningInstruments.map(item => (
                        <div key={item.name}
                             className={`flex items-center p-4 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-900/20 border border-${item.color}-200 dark:border-${item.color}-800`}>
                            <item.icon size={24} className={`text-${item.color}-500 mr-4`}/>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{item.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow transition-colors">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Alineación con ODS y PND</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Objetivos de Desarrollo Sostenible</h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {stats.alineacion_ods.map(item => (
                                <div key={item.numero}
                                     className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-slate-700 rounded-md dark:text-gray-200">
                                    <span>ODS {item.numero}: {item.nombre}</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{item.count} alineaciones</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Objetivos del {stats.instrumentos_planificacion.pnd_nombre || 'Plan Nacional de Desarrollo'}
                        </h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {stats.instrumentos_planificacion.pnd_objetivos.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No hay objetivos PND registrados.</p>
                            )}
                            {stats.instrumentos_planificacion.pnd_objetivos.map((obj, idx) => (
                                <div key={idx}
                                     className="text-sm p-2 bg-gray-50 dark:bg-slate-700 rounded-md dark:text-gray-200">
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{obj.codigo}</span>
                                    <span className="text-gray-600 dark:text-gray-300"> — {obj.descripcion}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
