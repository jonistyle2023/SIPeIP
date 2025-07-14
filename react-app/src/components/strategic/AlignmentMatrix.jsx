import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../api/api';
import {Link2, Plus, Edit, Trash2} from 'lucide-react';
import AlignmentFormModal from './AlignmentFormModal';

export default function AlignmentMatrix() {
    const [alignments, setAlignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/strategic-planning/alineaciones/');
            setAlignments(data);
        } catch (error) {
            console.error("Error fetching alignments:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !isModalOpen) return <div className="p-6 bg-white rounded-lg shadow-sm text-center">Cargando
        matriz...</div>;

    return (
        <>
            {isModalOpen && <AlignmentFormModal onClose={() => setIsModalOpen(false)} onSave={fetchData}/>}

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center"><Link2 className="mr-2 text-red-500"/>Matriz
                        de Alineación</h3>
                    <button onClick={() => setIsModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <Plus size={16} className="mr-2"/>Nueva Alineación
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-3 font-semibold">Instrumento Origen (OEI)</th>
                            <th className="p-3 font-semibold">Instrumento Destino (PND/ODS)</th>
                            <th className="p-3 font-semibold">Contribución</th>
                            <th className="p-3 font-semibold">Estado</th>
                            <th className="p-3 font-semibold">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {alignments.map(item => (
                            <tr key={item.alineacion_id} className="hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-800">{item.instrumento_origen.description}</td>
                                <td className="p-3 text-gray-600">{item.instrumento_destino.description}</td>
                                <td className="p-3 text-gray-600">{item.contribucion_porcentaje ? `${item.contribucion_porcentaje}%` : 'N/A'}</td>
                                <td className="p-3">
                                    <span
                                        className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Alineado</span>
                                </td>
                                <td className="p-3 flex items-center space-x-2">
                                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Edit
                                        size={16}/></button>
                                    <button className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2
                                        size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {alignments.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-500">
                            No hay alineaciones para mostrar. ¡Crea una nueva!
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}