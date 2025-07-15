import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PeriodFormModal from '../PeriodFormModal';

export function PeriodsManager() {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState(null);

    const fetchPeriods = async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/config/periodos/', {
                headers: {'Authorization': `Token ${token}`}
            });
            if (!response.ok) throw new Error("Failed to fetch periods");
            const data = await response.json();
            setPeriods(data);
        } catch (error) {
            console.error("Error fetching periods:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPeriods();
    }, []);

    const handleOpenModal = (period = null) => {
        setEditingPeriod(period);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPeriod(null);
    };
    const handleSave = () => {
        handleCloseModal();
        fetchPeriods();
    };

    const handleDelete = async (periodId) => {
        if (!window.confirm('¿Está seguro de eliminar este período? Esta acción no se puede deshacer.')) return;
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/config/periodos/${periodId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error("No se pudo eliminar el período");
            fetchPeriods();
        } catch (error) {
            alert("Error al eliminar el período.");
            console.error(error);
        }
    };

    if (loading) return <p className="text-center p-4">Cargando períodos...</p>;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <Plus size={16} className="mr-2"/>
                    Nuevo Período
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-3">Nombre del Período</th>
                        <th className="p-3">Fecha Inicio</th>
                        <th className="p-3">Fecha Fin</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {periods.map(period => (
                        <tr key={period.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-800">{period.nombre}</td>
                            <td className="p-3">{period.fecha_inicio}</td>
                            <td className="p-3">{period.fecha_fin}</td>
                            <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${period.estado === 'ABIERTO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {period.estado}
                                    </span>
                            </td>
                            <td className="p-3 flex items-center space-x-2">
                                <button onClick={() => handleOpenModal(period)}
                                        className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                <button
                                    onClick={() => handleDelete(period.id)}
                                    className="p-1 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={16}/>
                                </button>                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <PeriodFormModal period={editingPeriod} onClose={handleCloseModal} onSave={handleSave}/>}
        </div>
    );
}