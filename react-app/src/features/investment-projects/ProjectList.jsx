import React, {useCallback, useEffect, useState} from 'react';
import {api} from '../../shared/api/api.js';
import {Briefcase, Car, Edit, Filter, Hospital, Search, University} from 'lucide-react';

const statusStyles = {
    'EN_FORMULACION': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    'EN_EVALUACION': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    'APROBADO': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
};
const iconMap = {
    'Salud': {icon: Hospital, color: 'green'},
    'Transporte': {icon: Car, color: 'blue'},
    'Educación': {icon: University, color: 'purple'}
};

const ProjectCard = ({project, onEdit, onViewDetail, onDelete, viewButtonLabel}) => {
    const IconComponent = iconMap[project.sector_nombre]?.icon || Briefcase;
    const iconColor = iconMap[project.sector_nombre]?.color || 'gray';

    // Usa clases fijas para evitar problemas con Tailwind
    const bgClass = iconColor === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
        iconColor === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
            iconColor === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-slate-700';
    const textClass = iconColor === 'green' ? 'text-green-500 dark:text-green-400' :
        iconColor === 'blue' ? 'text-blue-500 dark:text-blue-400' :
            iconColor === 'purple' ? 'text-purple-500 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400';

    return (
        <div
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center space-x-4 transition-all hover:shadow-md dark:border dark:border-slate-700">
            <div className={`p-3 rounded-lg ${bgClass}`}><IconComponent className={`w-8 h-8 ${textClass}`}/></div>
            <div className="flex-grow">
                <h4 className="font-bold text-gray-800 dark:text-white">{project.nombre}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">CUP: {project.cup || 'N/A'} •
                    Sector: {project.sector_nombre || 'No definido'}</p>
                <div className="flex items-center mt-2 space-x-4">
                    <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[project.estado] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300'}`}>{project.estado.replace('_', ' ')}</span>
                    <span
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300">$ {Number(project.monto || 0).toLocaleString('es-US')}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                {/* Botón de texto en lugar de icono */}
                <button
                    onClick={() => onViewDetail(project)}
                    className="px-3 py-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                    {viewButtonLabel}
                </button>

                {/* Editar */}
                <button onClick={() => onEdit(project)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-400">
                    Editar
                </button>

                {/* Eliminar */}
                <button onClick={() => onDelete(project)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500">
                    Eliminar
                </button>
            </div>
        </div>
    );
};

export default function ProjectList({
    refreshKey = 0,
    onEdit = () => {},
    onViewDetail = () => {},
    onDelete = () => {},
    viewButtonLabel = 'Ver detalles'
}) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get('/investment-projects/proyectos/');
            const enhancedData = data.map(p => ({...p, monto: Math.floor(Math.random() * 100000000)}));
            setProjects(enhancedData);
        } catch (error) {
            console.error("Error fetching projects:", error);
            setError('No se pudo cargar la lista de proyectos.');
        } finally {
            setLoading(false);
        }
    }, [refreshKey]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    if (loading) return <div className="text-center p-6 bg-white dark:bg-slate-800 dark:text-white rounded-lg shadow-sm">Cargando proyectos...</div>;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!projects || projects.length === 0) return <div className="dark:text-gray-300">No hay proyectos registrados.</div>;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Pipeline de Proyectos</h3>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <button className="flex items-center px-4 py-2 border rounded-lg text-sm dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-700"><Filter size={16}
                                                                                                      className="mr-2"/>Filtros
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Search
                        size={16} className="mr-2"/>Buscar
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {projects.map(project => (
                    <ProjectCard
                        key={project.proyecto_id}
                        project={project}
                        onEdit={onEdit}
                        onViewDetail={onViewDetail}
                        onDelete={onDelete}
                        viewButtonLabel={viewButtonLabel}
                    />
                ))}
            </div>
            <div className="mt-6 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <p>Mostrando {projects.length} de {projects.length} proyectos</p>
                <a href="#" className="text-blue-600 dark:text-blue-400 font-semibold">Ver todos los proyectos →</a>
            </div>
        </div>
    );
}