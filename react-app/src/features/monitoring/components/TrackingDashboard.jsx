import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../../shared/api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TrackingDashboard = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // El endpoint de reportes devuelve JSON por defecto
                const data = await reportsApi.getTrackingActivitiesReport('json');
                setReportData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, []);

    if (loading) return <div>Cargando datos del dashboard...</div>;
    if (error) return <div className="text-red-500">Error al cargar el dashboard: {error}</div>;

    // 1. Datos para el gráfico de actividades por estado
    const statusData = reportData.reduce((acc, activity) => {
        const status = activity.Estado;
        const found = acc.find(item => item.name === status);
        if (found) {
            found.value += 1;
        } else {
            acc.push({ name: status, value: 1 });
        }
        return acc;
    }, []);

    // 2. Datos para el gráfico de % de avance por actividad
    const progressData = reportData.map(activity => ({
        name: activity['Código'],
        avance: activity['Avance Real (%)']
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Gráfico 1: Actividades por Estado */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                <h3 className="font-bold mb-4">Actividades por Estado</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                            {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico 2: % Avance por Actividad */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
                <h3 className="font-bold mb-4">% Avance por Actividad</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avance" fill="#82ca9d" name="Avance Real (%)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* Placeholder para el Gráfico 3: Indicadores Cumplidos */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow lg:col-span-2">
                 <h3 className="font-bold mb-4">Cumplimiento de Indicadores por Objetivo</h3>
                 <p className="text-center text-gray-500 mt-10">
                    (Gráfico de cumplimiento de indicadores por objetivo pendiente de implementación. 
                    Se requiere un endpoint específico que devuelva los datos agregados por objetivo y regla de cumplimiento.)
                 </p>
            </div>
        </div>
    );
};

export default TrackingDashboard;
