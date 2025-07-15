import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import { Edit, Trash2 } from 'lucide-react';

export default function ProjectList({ onEdit }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/investment-projects/proyectos/');
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    if (loading) return <div className="text-center p-6">Cargando proyectos...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-3">Nombre del Proyecto</th>
                        <th className="p-3">CUP</th>
                        <th className="p-3">Entidad Ejecutora</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {projects.map(project => (
                        <tr key={project.proyecto_id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{project.nombre}</td>
                            <td className="p-3">{project.cup || 'N/A'}</td>
                            <td className="p-3">{project.entidad_ejecutora_nombre || 'N/A'}</td>
                            <td className="p-3"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">{project.estado}</span></td>
                            <td className="p-3 flex space-x-2">
                                <button onClick={() => onEdit(project)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                                <button className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}