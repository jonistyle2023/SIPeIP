import React, { useState } from 'react';
import { BookOpen, Link2, Layers, Settings, FilePlus, BarChart, History, AlertCircle } from 'lucide-react';
import MasterData from './MasterData.jsx';
import InstitutionalPlans from './InstitutionalPlans.jsx';
import AlignmentMatrix from './AlignmentMatrix.jsx';
import SectoralPlansPage from './SectoralPlansPage.jsx';
import ProgramasManager from './ProgramasManager.jsx';

// Tarjeta para acciones rápidas
const ActionCard = ({title, subtitle, icon: Icon, onClick}) => (
    <button onClick={onClick}
            className="bg-white p-4 rounded-lg shadow-sm flex items-center w-full text-left hover:bg-gray-50 transition-colors">
        <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <Icon className="text-blue-600"/>
        </div>
        <div>
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
    </button>
);

// Tarjeta para estadísticas
const StatsCard = ({title, value, icon: Icon}) => (
    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
        <Icon className="text-gray-500 mr-3" size={24}/>
        <div>
            <p className="font-bold text-xl text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{title}</p>
        </div>
    </div>
);


export default function StrategicObjectivesPage() {
    const [activeTab, setActiveTab] = useState('planes');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'planes':
                return <InstitutionalPlans />;
            case 'programas':
                return <ProgramasManager />;
            case 'sectoriales':
                return <SectoralPlansPage />;
            case 'alineacion':
                return <AlignmentMatrix />;
            case 'maestros':
                return <MasterData />;
            default:
                return <InstitutionalPlans />;
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Módulo de Gestión de Objetivos Estratégicos</h2>
                    <p className="text-blue-100 text-sm mt-1">Administra y alinea los objetivos estratégicos
                        institucionales con el PND y los ODS.</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <BookOpen size={32}/>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActionCard title="Nuevo OEI" subtitle="Crear objetivo estratégico" icon={FilePlus}/>
                <ActionCard title="Matriz Alineación" subtitle="Vincular OEI-PND-ODS" icon={Link2}
                            onClick={() => setActiveTab('alineacion')}/>
                <ActionCard title="Plan Sectorial" subtitle="Subir nuevo plan" icon={Layers}/>
                <ActionCard title="Configuración" subtitle="Parámetros y alertas" icon={Settings}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="flex border-b mb-4">
                        <button onClick={() => setActiveTab('planes')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'planes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Planes y OEI</button>
                        {/* --- Botón de la nueva pestaña --- */}
                        <button onClick={() => setActiveTab('programas')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'programas' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Programas</button>
                        <button onClick={() => setActiveTab('sectoriales')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'sectoriales' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Planes Sectoriales</button>
                        <button onClick={() => setActiveTab('alineacion')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'alineacion' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Matriz de Alineación</button>
                        <button onClick={() => setActiveTab('maestros')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'maestros' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Datos Maestros</button>
                    </div>
                    <div className="space-y-6">
                        {renderActiveTab()}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-4">Estadísticas</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StatsCard title="OEI Activos" value="24" icon={BookOpen}/>
                            <StatsCard title="Alineaciones" value="18" icon={Link2}/>
                            <StatsCard title="Planes Sectoriales" value="12" icon={Layers}/>
                            <StatsCard title="Alertas Activas" value="6" icon={AlertCircle}/>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center text-blue-600 hover:underline cursor-pointer"><BookOpen
                                size={16} className="mr-2"/>Gestión de ODS
                            </li>
                            <li className="flex items-center text-blue-600 hover:underline cursor-pointer"><BarChart
                                size={16} className="mr-2"/>Indicadores PND
                            </li>
                            <li className="flex items-center text-blue-600 hover:underline cursor-pointer"><History
                                size={16} className="mr-2"/>Historial de Versiones
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}