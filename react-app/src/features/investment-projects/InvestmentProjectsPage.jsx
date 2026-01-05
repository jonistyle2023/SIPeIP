import React, {useState} from 'react';
import {Plus} from 'lucide-react';
import ProjectList from './ProjectList.jsx';
import ProjectDetail from './ProjectDetail.jsx';
import ProjectFormModal from './modals/ProjectFormModal.jsx';
import DictamenManager from '../dictamenes/DictamenManager.jsx';
import { api } from '../../shared/api/api.js'; // <-- Nuevo: usar cliente api compartido

const StatsCard = ({title, value, color}) => (
    <div className={`p-4 rounded-lg shadow-sm text-white ${color}`}>
        <p className="text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);

export default function InvestmentProjectsPage() {
    const [view, setView] = useState('list');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState('pipeline');

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleViewDetail = (project) => {
        setSelectedProject(project);
        setView('detail');
    };

    const handleReturnToList = () => {
        setSelectedProject(null);
        setView('list');
    };

    const getCookie = (name) => {
        if (!document.cookie) return null;
        const xs = document.cookie.split(';').map(c => c.trim()).filter(c => c.startsWith(name + '='));
        if (xs.length === 0) return null;
        return decodeURIComponent(xs[0].split('=')[1]);
    };

    const handleDelete = async (project) => {
        const confirmMsg = `Está a punto de eliminar el proyecto "${project.nombre}" (ID: ${project.proyecto_id}) y todas sus dependencias. Esta acción NO se puede deshacer. ¿Desea continuar?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.delete(`/investment-projects/proyectos/${project.proyecto_id}/`);

            setRefreshTrigger(prev => prev + 1);a
            if (selectedProject && selectedProject.proyecto_id === project.proyecto_id) {
                handleReturnToList();
            }
            alert('Proyecto eliminado correctamente.');
        } catch (err) {
            console.error('Error al eliminar proyecto:', err);
            alert('No fue posible eliminar el proyecto. Revise la consola para más detalles.');
        }
    };

    return (
        <div className="space-y-6">

            <div className="bg-blue-600 dark:bg-blue-800 text-white p-6 rounded-lg shadow-lg transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Módulo de Gestión de Proyectos de
                            Inversión</h2>
                        <p className="text-blue-100 text-sm mt-1">Formulación, registro y postulación de proyectos</p>
                    </div>
                    <button onClick={() => {
                        setEditingProject(null);
                        setIsModalOpen(true);
                    }}
                            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-white dark:bg-slate-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                        <Plus size={20} className="mr-2"/>
                        Nuevo Proyecto
                    </button>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Proyectos Activos" value="247" color="bg-blue-500"/>
                    <StatsCard title="En Formulación" value="89" color="bg-blue-500"/>
                    <StatsCard title="Con Dictamen" value="156" color="bg-blue-500"/>
                    <StatsCard title="Inversión Total" value="$2.4B" color="bg-green-500"/>
                </div>
            </div>

            {/* Pestañas */}
            <div className="flex border-b mb-4 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('pipeline')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'pipeline' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Pipeline de Proyectos
                </button>
                <button
                    onClick={() => setActiveTab('dictamenes')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'dictamenes' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Gestión de Dictámenes
                </button>
            </div>

            {/* Contenido de las pestañas */}
            {activeTab === 'pipeline' && (
                <>
                    {view === 'list' && (
                        <>
                            <ProjectList
                                refreshKey={refreshTrigger}
                                onEdit={handleEdit}
                                onViewDetail={handleViewDetail}
                                onDelete={handleDelete}
                                viewButtonLabel="Ver detalles"
                            />
                        </>
                    )}
                    {view === 'detail' && selectedProject && (
                        <ProjectDetail project={selectedProject} onReturnToList={handleReturnToList}/>
                    )}
                    {isModalOpen && <ProjectFormModal project={editingProject} onClose={() => setIsModalOpen(false)}
                                                      onSave={handleSave}/>}
                </>
            )}

            {activeTab === 'dictamenes' && (
                <DictamenManager/>
            )}
        </div>
    );
}