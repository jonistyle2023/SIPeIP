import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../shared/api/api.js';
import {CheckSquare, Eye, ThumbsUp, CornerUpLeft, ListChecks} from 'lucide-react';
import ProjectDetailModal from '../investment-projects/ProjectDetailModal.jsx';

// Modal para las observaciones al devolver un proyecto
const DevolverModal = ({project, onClose, onConfirm}) => {
    const [observaciones, setObservaciones] = useState('');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Devolver Proyecto: {project.nombre}</h3>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700">Observaciones (Requerido)</label>
                    <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        rows="5"
                        className="w-full p-2 border rounded mt-1"
                        placeholder="Explique por qué se devuelve el proyecto..."
                    />
                </div>
                <div className="p-4 border-t flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
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
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                    <th className="p-3">Nombre del Proyecto</th>
                    <th className="p-3">Programa Institucional</th>
                    <th className="p-3 text-right">Monto Total ($)</th>
                    <th className="p-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {projects.map(project => (
                    <tr key={project.proyecto_id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{project.nombre}</td>
                        <td className="p-3 text-gray-600">{project.programa_institucional_nombre || 'N/A'}</td>
                        <td className="p-3 text-right font-mono">
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
            <div className="text-center py-10 text-gray-500">
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

    if (loading) return <div className="text-center p-6">Cargando...</div>;

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

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <CheckSquare className="mr-3 text-blue-600"/>
                    Módulo de Priorización del PAI
                </h2>
                <p className="text-gray-600 mt-1">
                    Análisis, priorización y conformación del Plan Anual de Inversiones.
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="border-b flex">
                    <button
                        onClick={() => setActiveTab('postulados')}
                        className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === 'postulados' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                        <ListChecks className="mr-2" />
                        Proyectos en Cartera ({activeTab === 'postulados' ? projects.length : '...'})
                    </button>
                    <button
                        onClick={() => setActiveTab('priorizados')}
                        className={`flex items-center px-4 py-2 text-sm font-medium ${activeTab === 'priorizados' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
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