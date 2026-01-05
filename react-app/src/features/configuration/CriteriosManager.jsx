import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../shared/api/api.js';
import {Plus, Edit, Trash2} from 'lucide-react';

// Modal de formulario para Criterios
const CriterioFormModal = ({criterio, onClose, onSave}) => {
    const [nombre, setNombre] = useState(criterio?.nombre || '');
    const [ponderacion, setPonderacion] = useState(criterio?.ponderacion || '');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {nombre, ponderacion: parseFloat(ponderacion), activo: true};
        try {
            if (criterio) {
                await api.put(`/investment-projects/criterios-priorizacion/${criterio.criterio_id}/`, payload);
            } else {
                await api.post('/investment-projects/criterios-priorizacion/', payload);
            }
            onSave();
        } catch (err) {
            setError(err.message || 'Error al guardar');
        }
    };

    return (<div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-80 p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg border dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">{criterio ? 'Editar Criterio' : 'Nuevo Criterio de Priorización'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                           placeholder="Nombre del Criterio (Ej: Impacto Social)" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                           required/>
                    <input type="number" step="0.01" value={ponderacion} onChange={e => setPonderacion(e.target.value)}
                           placeholder="Ponderación (Ej: 25.00)" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end mt-4 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                    </div>
                </form>
            </div>
        </div>);
};

export default function CriteriosManager() {
    const [criterios, setCriterios] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCriterio, setEditingCriterio] = useState(null);

    const fetchData = useCallback(async () => {
        const data = await api.get('/investment-projects/criterios-priorizacion/');
        setCriterios(data);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingCriterio(null);
        fetchData();
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este criterio?')) {
            await api.delete(`/investment-projects/criterios-priorizacion/${id}/`);
            fetchData();
        }
    };

    return (<div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-colors">
            {isModalOpen && <CriterioFormModal criterio={editingCriterio} onClose={() => setIsModalOpen(false)}
                                               onSave={handleSave}/>}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg dark:text-white">Criterios de Priorización</h3>
                <button onClick={() => {
                    setEditingCriterio(null);
                    setIsModalOpen(true);
                }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16}
                                                                                                           className="mr-2"/>Nuevo
                    Criterio
                </button>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700 text-left dark:text-gray-200">
                <tr>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Ponderación (%)</th>
                    <th className="p-3 text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {criterios.map(c => (<tr key={c.criterio_id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-3 dark:text-white">{c.nombre}</td>
                        <td className="p-3 dark:text-gray-300">{c.ponderacion}</td>
                        <td className="p-3 text-right">
                            <button onClick={() => {
                                setEditingCriterio(c);
                                setIsModalOpen(true);
                            }} className="p-1 text-blue-500"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(c.criterio_id)} className="p-1 text-red-500"><Trash2
                                size={16}/></button>
                        </td>
                    </tr>))}
                </tbody>
            </table>
        </div>);
}