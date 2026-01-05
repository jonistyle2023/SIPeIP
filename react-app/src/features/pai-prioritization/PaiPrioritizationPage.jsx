import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../shared/api/api.js';
import {CheckSquare, Eye, ThumbsUp, CornerUpLeft, ListChecks} from 'lucide-react';
import ProjectDetailModal from '../investment-projects/modals/ProjectDetailModal.jsx';

// Modal para las observaciones al devolver un proyecto
const DevolverModal = ({project, onClose, onConfirm}) => {
    const [observaciones, setObservaciones] = useState('');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold dark:text-white">Devolver Proyecto: {project.nombre}</h3>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones (Requerido)</label>
                    <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows="5"
                        className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        placeholder="Explique por qué se devuelve el proyecto..."
                    />
                </div>
                <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
                    <button
                        onClick={() => onConfirm(observaciones)}
                        disabled={!observaciones}
                        className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-red-300"
                    >
                        Confirmar Devolución
                    </button>
                </div>
            </div>
        </div>
    );
};

// Nueva tabla reutilizable para ambas listas
const ProjectsTable = ({ projects, onPrioritize, onReturn, onViewDetail, isPrioritizedList = false }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                <tr>
                    <th className="p-3">Nombre del Proyecto</th>
                    {/* --- AÑADIR NUEVA COLUMNA --- */}
                    <th className="p-3 text-right">Puntaje Ponderado</th>
                    <th className="p-3 text-right">Monto Total ($)</th>
                    <th className="p-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {projects.map(project => (
                    <tr key={project.proyecto_id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-3 font-medium dark:text-white">{project.nombre}</td>
                        {/* --- AÑADIR NUEVA CELDA --- */}
                        <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                            {project.puntaje_priorizacion_total}
                        </td>
                        <td className="p-3 text-right font-mono dark:text-gray-300">
                            {parseFloat(project.monto_total_programado).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                            <div className="flex justify-center space-x-2">
                                <button onClick={() => onViewDetail(project)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Ver Detalle del Proyecto">
                                    <Eye size={18} />
                                </button>
                                {!isPrioritizedList && (
                                    <>
                                        <button onClick={() => onPrioritize(project.proyecto_id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="Priorizar para PAI">
                                            <ThumbsUp size={18} />
                                        </button>
                                        <button onClick={() => onReturn(project)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Devolver a Formulación">
                                            <CornerUpLeft size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {projects.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No hay proyectos en esta lista.
            </div>
        )}
    </div>
);

export default function PaiPrioritizationPage() {
    const [activeTab, setActiveTab] = useState('postulados'); // 'postulados' | 'priorizados'
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projectToReturn, setProjectToReturn] = useState(null);
    const [viewingProject, setViewingProject] = useState(null);

    // Cargar según pestaña activa
    const fetchData = useCallback(async () => {
        setLoading(true);
        const statusToFetch = activeTab === 'postulados' ? 'POSTULADO' : 'PRIORIZADO';
        try {
            const data = await api.get(`/investment-projects/proyectos/?estado=${statusToFetch}`);
            setProjects(data);
        } catch (error) {
            console.error(`Error fetching ${statusToFetch} projects:`, error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePrioritize = async (projectId) => {
        if (window.confirm('¿Está seguro de que desea priorizar este proyecto e incluirlo en el PAI?')) {
            try {
                await api.post(`/investment-projects/proyectos/${projectId}/priorizar/`, {});
                fetchData();
            } catch (error) {
                alert('Error al priorizar el proyecto: ' + error.message);
            }
        }
    };

    const handleReturn = async (observaciones) => {
        if (!projectToReturn) return;
        try {
            await api.post(`/investment-projects/proyectos/${projectToReturn.proyecto_id}/devolver/`, {observaciones});
            setProjectToReturn(null);
            fetchData();
        } catch (error) {
            alert('Error al devolver el proyecto: ' + error.message);
        }
    };

    if (loading) return <div className="text-center p-6 dark:text-gray-300">Cargando...</div>;

    return (
        <div className="space-y-6">
            {projectToReturn && (
                <DevolverModal
                    project={projectToReturn}
                    onClose={() => setProjectToReturn(null)}
                    onConfirm={handleReturn}
                />
            )}
            {viewingProject && (
                <ProjectDetailModal
                    project={viewingProject}
                    onClose={() => setViewingProject(null)}
                />
            )}

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-colors">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <CheckSquare className="mr-3 text-blue-600"/>
                    Módulo de Priorización del PAI
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Análisis, priorización y conformación del Plan Anual de Inversiones.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-colors">
                <div className="border-b dark:border-slate-700 flex">
                    <button
                        onClick={() => setActiveTab('postulados')}
                        className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === 'postulados' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        <ListChecks className="mr-2" />
                        Proyectos en Cartera ({activeTab === 'postulados' ? projects.length : '...'})
                    </button>
                    <button
                        onClick={() => setActiveTab('priorizados')}
                        className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === 'priorizados' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        <ThumbsUp className="mr-2" />
                        PAI Aprobado ({activeTab === 'priorizados' ? projects.length : '...'})
                    </button>
                </div>

                <div className="mt-4">
                    <ProjectsTable
                        projects={projects}
                        onPrioritize={handlePrioritize}
                        onReturn={setProjectToReturn}
                        onViewDetail={setViewingProject}
                        isPrioritizedList={activeTab === 'priorizados'}
                    />
                </div>
            </div>
        </div>
    );
}