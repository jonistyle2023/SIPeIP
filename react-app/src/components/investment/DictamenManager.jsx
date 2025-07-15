import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../api/api';
import {FileCheck, Plus, Edit, Trash2} from 'lucide-react';

export default function DictamenManager() {
    const [dictamenes, setDictamenes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/investment-projects/dictamenes/');
            setDictamenes(data);
        } catch (error) {
            console.error("Error fetching dictamenes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="text-center p-6">Cargando dictámenes...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center"><FileCheck className="mr-2 text-green-500"/>Gestión
                    de Dictámenes de Prioridad</h3>
                <button
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
                        <th className="p-3">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {dictamenes.map(d => (
                        <tr key={d.dictamen_id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{d.proyecto_nombre || 'N/A'}</td>
                            <td className="p-3">{new Date(d.fecha_solicitud).toLocaleDateString()}</td>
                            <td className="p-3"><span
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{d.estado}</span>
                            </td>
                            <td className="p-3 flex space-x-2">
                                <button className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}