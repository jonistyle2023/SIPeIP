import React, {useState} from 'react';
import {AlertCircle, BarChart, BookOpen, FilePlus, History, Layers, Link2, Settings} from 'lucide-react';
import MasterData from './MasterData.jsx';
import InstitutionalPlans from './InstitutionalPlans.jsx';
import AlignmentMatrix from './AlignmentMatrix.jsx';
import SectoralPlansPage from './SectoralPlansPage.jsx';
import ProgramasManager from './ProgramasManager.jsx';

// Tarjeta para acciones rápidas
const ActionCard = ({title, subtitle, icon: Icon, onClick}) => (
    <button onClick={onClick}
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center w-full text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
            <Icon className="text-blue-600 dark:text-blue-400"/>
        </div>
        <div>
            <h4 className="font-semibold text-gray-800 dark:text-white">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
    </button>
);

// Tarjeta para estadísticas (ahora soporta variante coloreada con prop `color`)
const StatsCard = ({title, value, icon: Icon, color}) => {
    if (color) {
        return (
            <div className={`p-4 rounded-lg shadow-sm text-white ${color}`}>
                <div className="flex items-center">
                    <Icon className="text-white mr-3" size={20}/>
                    <div>
                        <p className="font-bold text-2xl">{value}</p>
                        <p className="text-sm">{title}</p>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <Icon className="text-gray-500 dark:text-gray-400 mr-3" size={24}/>
            <div>
                <p className="font-bold text-xl text-gray-800 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
            </div>
        </div>
    );
};


export default function StrategicObjectivesPage() {
    const [activeTab, setActiveTab] = useState('planes');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'planes':
                return <InstitutionalPlans/>;
            case 'programas':
                return <ProgramasManager/>;
            case 'sectoriales':
                return <SectoralPlansPage/>;
            case 'alineacion':
                return <AlignmentMatrix/>;
            case 'maestros':
                return <MasterData/>;
            default:
                return <InstitutionalPlans/>;
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Banner superior: título + descripción + estadísticas integradas */}
            <div className="bg-blue-600 dark:bg-blue-800 text-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center transition-colors">
                <div className="flex-1">
                    <div>
                        <h2 className="text-2xl font-bold">Módulo de Gestión de Objetivos Estratégicos</h2>
                        <p className="text-blue-100 text-sm mt-1">Administra y alinea los objetivos estratégicos institucionales con el PND y los ODS.</p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatsCard title="OEI Activos" value="24" icon={BookOpen} color="bg-blue-500"/>
                        <StatsCard title="Alineaciones" value="18" icon={Link2} color="bg-blue-500"/>
                        <StatsCard title="Planes Sectoriales" value="12" icon={Layers} color="bg-blue-500"/>
                        <StatsCard title="Alertas Activas" value="6" icon={AlertCircle} color="bg-red-500"/>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <ActionCard title="Matriz Alineación" subtitle="Vincular OEI-PND-ODS" icon={Link2}
                            onClick={() => setActiveTab('alineacion')}/>
                <ActionCard title="Configuración" subtitle="Parámetros y alertas" icon={Settings}/>
            </div>

            <div className="space-y-6">
                <div className="flex border-b mb-4 dark:border-slate-700">
                    <button onClick={() => setActiveTab('planes')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'planes' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Planes
                        y OEI
                    </button>
                    <button onClick={() => setActiveTab('programas')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'programas' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Programas
                    </button>
                    <button onClick={() => setActiveTab('sectoriales')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'sectoriales' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Planes
                        Sectoriales
                    </button>
                    <button onClick={() => setActiveTab('alineacion')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'alineacion' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Matriz
                        de Alineación
                    </button>
                    <button onClick={() => setActiveTab('maestros')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'maestros' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Datos
                        Maestros
                    </button>
                </div>
                <div className="space-y-6">
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
}