import React from 'react';
import {
    ArrowUp,
    ArrowDown,
    DollarSign,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    BookOpen,
    Flag,
    Target,
    Users,
    BarChart
} from 'lucide-react';
import {BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

const kpiData = [
    {
        title: 'Proyectos Activos',
        value: '247',
        change: '+12%',
        changeType: 'increase',
        icon: TrendingUp,
        color: 'green'
    },
    {
        title: 'Inversión Total',
        value: '$2.4B',
        change: '+8% vs trimestre anterior',
        changeType: 'increase',
        icon: DollarSign,
        color: 'green'
    },
    {
        title: 'Avance Promedio',
        value: '73%',
        change: 'sin cambios',
        changeType: 'neutral',
        icon: CheckCircle,
        color: 'yellow'
    },
    {
        title: 'Alertas Activas',
        value: '18',
        change: '+3 nuevas alertas',
        changeType: 'decrease',
        icon: AlertTriangle,
        color: 'red'
    },
];

const indicatorData = [
    {name: 'Infraestructura Vial', value: 85, projects: 34},
    {name: 'Educación', value: 65, projects: 28},
    {name: 'Salud', value: 45, projects: 19},
];

const alertData = [
    {type: 'Retraso Crítico', project: 'Hospital Regional - 30 días de retraso', color: 'red'},
    {type: 'Presupuesto', project: 'Escuela Primaria - 95% ejecutado', color: 'yellow'},
    {type: 'Meta en Riesgo', project: 'Carretera Zonal - avance lento', color: 'yellow'},
]

const planningInstruments = [
    {name: 'ODS', value: '17 objetivos alineados', icon: BookOpen, color: 'blue'},
    {name: 'PND', value: 'Plan Nacional de Desarrollo', icon: Flag, color: 'green'},
    {name: 'Sectoriales', value: '12 planes vinculados', icon: Target, color: 'purple'},
    {name: 'Institucionales', value: '45 entidades participantes', icon: Users, color: 'orange'},
]

const alignmentData = [
    {name: 'ODS 4: Educación de Calidad', projects: 156, progress: 67},
    {name: 'ODS 3: Salud y Bienestar', projects: 89, progress: 78},
    {name: 'ODS 9: Infraestructura', projects: 234, progress: 54},
]

const chartData = [
    {name: 'Ene', Inversión: 400, Avance: 240},
    {name: 'Feb', Inversión: 300, Avance: 139},
    {name: 'Mar', Inversión: 200, Avance: 980},
    {name: 'Abr', Inversión: 278, Avance: 390},
    {name: 'May', Inversión: 189, Avance: 480},
    {name: 'Jun', Inversión: 239, Avance: 380},
];

const DashboardPage = () => {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map(kpi => (
                    <div key={kpi.title} className="bg-white p-6 rounded-lg shadow flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">{kpi.title}</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{kpi.value}</p>
                            <p className={`text-xs mt-2 flex items-center ${kpi.changeType === 'increase' ? 'text-green-500' : kpi.changeType === 'decrease' ? 'text-red-500' : 'text-gray-500'}`}>
                                {kpi.changeType === 'increase' ?
                                    <ArrowUp size={14} className="mr-1"/> : kpi.changeType === 'decrease' ?
                                        <ArrowDown size={14} className="mr-1"/> : null}
                                {kpi.change}
                            </p>
                        </div>
                        <div className={`p-3 rounded-full bg-${kpi.color}-100`}>
                            <kpi.icon size={24} className={`text-${kpi.color}-500`}/>
                        </div>
                    </div>
                ))}
            </div>

            {/* Consola de Indicadores y Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-4">Consola de Indicadores de Avance</h3>
                    <div className="space-y-4">
                        {indicatorData.map(indicator => (
                            <div key={indicator.name}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-medium text-gray-700">{indicator.name} <span
                                        className="text-xs text-gray-500">({indicator.projects} proyectos)</span></p>
                                    <p className="text-sm font-bold text-gray-800">{indicator.value}%</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full" style={{
                                        width: `${indicator.value}%`,
                                        backgroundColor: indicator.value > 75 ? '#22c55e' : indicator.value > 50 ? '#f59e0b' : '#ef4444'
                                    }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-4">Alertas Tempranas</h3>
                    <div className="space-y-3">
                        {alertData.map(alert => (
                            <div key={alert.project}
                                 className={`p-3 rounded-lg bg-${alert.color}-50 border-l-4 border-${alert.color}-400`}>
                                <p className="font-semibold text-sm text-gray-800">{alert.type}</p>
                                <p className="text-xs text-gray-600">{alert.project}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-4">Inversión por Período</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ReBarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="Inversión" fill="#8884d8"/>
                            <Bar dataKey="Avance" fill="#82ca9d"/>
                        </ReBarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-gray-800 mb-4">Avance por Sectores</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ReBarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="Inversión" stackId="a" fill="#3b82f6"/>
                            <Bar dataKey="Avance" stackId="a" fill="#84cc16"/>
                        </ReBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Alineación */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-800 mb-4">Alineación de Instrumentos de Planificación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {planningInstruments.map(item => (
                        <div key={item.name}
                             className={`flex items-center p-4 rounded-lg bg-${item.color}-50 border border-${item.color}-200`}>
                            <item.icon size={24} className={`text-${item.color}-500 mr-4`}/>
                            <div>
                                <p className="font-bold text-gray-800">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-semibold text-gray-800 mb-4">Alineación con ODS y PND</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Objetivos de Desarrollo Sostenible</h4>
                        <div className="space-y-2">
                            {alignmentData.map(item => (
                                <div key={item.name}
                                     className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md">
                                    <span>{item.name}</span>
                                    <span className="font-semibold text-blue-600">{item.projects} proyectos</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Plan Nacional de Desarrollo</h4>
                        <div className="space-y-2">
                            {alignmentData.map(item => (
                                <div key={item.name}
                                     className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md">
                                    <span>Pacto por la Equidad</span>
                                    <div className="w-1/3 bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-green-500 h-2.5 rounded-full"
                                             style={{width: `${item.progress}%`}}></div>
                                    </div>
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