import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../shared/api/api.js';
import {FileCheck, Plus, CheckCircle, XCircle, Trash2} from 'lucide-react';
import DictamenFormModal from './DictamenFormModal.jsx';
import DictamenStatusModal from './DictamenStatusModal.jsx';

const statusStyles = {
    'SOLICITUD': 'bg-blue-100 text-blue-800',
    'APROBADO': 'bg-green-100 text-green-800',
    'RECHAZADO': 'bg-red-100 text-red-800'
};

export default function DictamenManager() {
    const [dictamenes, setDictamenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Estados para el nuevo modal de cambio de estado
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedDictamen, setSelectedDictamen] = useState(null);
    const [currentAction, setCurrentAction] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/investment-projects/dictamenes/');
            const detailedData = await Promise.all(data.map(async d => {
                try {
                    const projectData = await api.get(`/investment-projects/proyectos/${d.proyecto}/`);
                    return {...d, proyecto_nombre: projectData.nombre};
                } catch {
                    return {...d, proyecto_nombre: `Proyecto ID: ${d.proyecto}`};
                }
            }));
            setDictamenes(detailedData);
        } catch (error) {
            console.error("Error fetching dictamenes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = () => {
        setIsCreateModalOpen(false);
        setIsStatusModalOpen(false);
        fetchData();
    };

    const handleOpenStatusModal = (dictamen, action) => {
        setSelectedDictamen(dictamen);
        setCurrentAction(action);
        setIsStatusModalOpen(true);
    };

    const handleDelete = async (dictamenId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta solicitud de dictamen?')) {
            try {
                await api.delete(`/investment-projects/dictamenes/${dictamenId}/`);
                fetchData();
            } catch (err) {
                alert('Error al eliminar el dictamen: ' + (err.message || ''));
            }
        }
    };

    if (loading) return <div className="text-center p-6 bg-white rounded-lg shadow-sm">Cargando dictámenes...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            {isCreateModalOpen && <DictamenFormModal onClose={() => setIsCreateModalOpen(false)} onSave={handleSave}/>}
            {isStatusModalOpen && <DictamenStatusModal dictamen={selectedDictamen} action={currentAction}
                                                       onClose={() => setIsStatusModalOpen(false)}
                                                       onSave={handleSave}/>}

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center"><FileCheck className="mr-2 text-gray-500"/>Gestión
                    de Dictámenes de Prioridad</h3>
                <button onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <Plus size={16} className="mr-2"/>Nueva Solicitud
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-3">Proyecto</th>
                        <th className="p-3">Fecha Solicitud</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dictamenes.map(d => (
                        <tr key={d.dictamen_id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{d.proyecto_nombre}</td>
                            <td className="p-3">{new Date(d.fecha_solicitud).toLocaleDateString()}</td>
                            <td className="p-3"><span
                                className={`px-2 py-1 font-semibold rounded-full text-xs ${statusStyles[d.estado] || 'bg-gray-100'}`}>{d.estado}</span>
                            </td>
                            <td className="p-3">
                                <div className="flex justify-end space-x-2">
                                    {d.estado === 'SOLICITUD' && (
                                        <>
                                            <button onClick={() => handleOpenStatusModal(d, 'aprobar')}
                                                    className="p-1 text-green-500 hover:text-green-700" title="Aprobar">
                                                <CheckCircle size={18}/></button>
                                            <button onClick={() => handleOpenStatusModal(d, 'rechazar')}
                                                    className="p-1 text-orange-500 hover:text-orange-700"
                                                    title="Rechazar"><XCircle size={18}/></button>
                                        </>
                                    )}
                                    <button onClick={() => handleDelete(d.dictamen_id)}
                                            className="p-1 text-red-500 hover:text-red-700" title="Eliminar"><Trash2
                                        size={18}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}