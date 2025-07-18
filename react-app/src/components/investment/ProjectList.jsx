import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../api/api';
import {Edit, Eye, Filter, Search, Hospital, University, Car, Briefcase} from 'lucide-react';

const statusStyles = {
    'EN_FORMULACION': 'bg-blue-100 text-blue-800',
    'EN_EVALUACION': 'bg-yellow-100 text-yellow-800',
    'APROBADO': 'bg-green-100 text-green-800'
};
const iconMap = {
    'Salud': {icon: Hospital, color: 'green'},
    'Transporte': {icon: Car, color: 'blue'},
    'Educación': {icon: University, color: 'purple'}
};

const ProjectCard = ({project, onEdit, onViewDetail}) => {
    const IconComponent = iconMap[project.sector_nombre]?.icon || Briefcase;
    const iconColor = iconMap[project.sector_nombre]?.color || 'gray';

    // Usa clases fijas para evitar problemas con Tailwind
    const bgClass = iconColor === 'green' ? 'bg-green-100' :
        iconColor === 'blue' ? 'bg-blue-100' :
            iconColor === 'purple' ? 'bg-purple-100' : 'bg-gray-100';
    const textClass = iconColor === 'green' ? 'text-green-500' :
        iconColor === 'blue' ? 'text-blue-500' :
            iconColor === 'purple' ? 'text-purple-500' : 'text-gray-500';

    return (
        <div
            className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4 transition-shadow hover:shadow-md">
            <div className={`p-3 rounded-lg ${bgClass}`}><IconComponent className={`w-8 h-8 ${textClass}`}/></div>
            <div className="flex-grow">
                <h4 className="font-bold text-gray-800">{project.nombre}</h4>
                <p className="text-sm text-gray-500">CUP: {project.cup || 'N/A'} •
                    Sector: {project.sector_nombre || 'No definido'}</p>
                <div className="flex items-center mt-2 space-x-4">
                    <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[project.estado] || 'bg-gray-100 text-gray-800'}`}>{project.estado.replace('_', ' ')}</span>
                    <span
                        className="text-sm font-semibold text-gray-700">Bs. {Number(project.monto || 0).toLocaleString('es-BO')}</span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => onViewDetail(project)} className="p-2 text-gray-500 hover:text-gray-800"><Eye
                    size={18}/></button>
                <button onClick={() => onEdit(project)} className="p-2 text-gray-500 hover:text-gray-800"><Edit
                    size={18}/></button>
            </div>
        </div>
    );
};

export default function ProjectList({onEdit, onViewDetail, key: refreshKey}) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/investment-projects/proyectos/');
            const enhancedData = data.map(p => ({...p, monto: Math.floor(Math.random() * 100000000)}));
            setProjects(enhancedData);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    }, [refreshKey]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    if (loading) return <div className="text-center p-6 bg-white rounded-lg shadow-sm">Cargando proyectos...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Pipeline de Proyectos</h3>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <button className="flex items-center px-4 py-2 border rounded-lg text-sm"><Filter size={16}
                                                                                                      className="mr-2"/>Filtros
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Search
                        size={16} className="mr-2"/>Buscar
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {projects.map(project => (<ProjectCard key={project.proyecto_id} project={project} onEdit={onEdit}
                                                       onViewDetail={onViewDetail}/>))}
            </div>
            <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
                <p>Mostrando {projects.length} de {projects.length} proyectos</p>
                <a href="#" className="text-blue-600 font-semibold">Ver todos los proyectos →</a>
            </div>
        </div>
    );
}