import React, {useState, useEffect} from 'react';
import {api} from '../../shared/api/api.js';
import {X} from 'lucide-react';

export default function DictamenFormModal({onClose, onSave}) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.get('/investment-projects/proyectos/');
                setProjects(data);
            } catch (err) {
                setError('No se pudieron cargar los proyectos.');
            }
        };
        fetchProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject) {
            setError('Debe seleccionar un proyecto.');
            return;
        }
        try {
            await api.post('/investment-projects/dictamenes/', {proyecto: selectedProject});
            onSave();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center"><h3
                    className="text-lg font-semibold dark:text-white">Nueva Solicitud de Dictamen</h3>
                    <button onClick={onClose} className="dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1"><X/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seleccione
                            el Proyecto</label>
                        <select
                            id="project-select"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            required
                        >
                            <option value="">-- Elija un proyecto --</option>
                            {projects.map(p => <option key={p.proyecto_id} value={p.proyecto_id}>{p.nombre}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Crear Solicitud
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}