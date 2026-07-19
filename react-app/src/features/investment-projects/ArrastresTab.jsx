import React, {useMemo, useState} from 'react';
import {PlusCircle, Edit, Trash2} from 'lucide-react';
import {api} from '../../shared/api/api.js';
import ArrastreFormModal from './modals/ArrastreFormModal.jsx';

export default function ArrastresTab({project, onDataChange}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArrastre, setEditingArrastre] = useState(null);

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingArrastre(null);
        onDataChange(); // Llama a la función para recargar los datos del proyecto
    };

    const handleAdd = () => {
        setEditingArrastre(null);
        setIsModalOpen(true);
    };

    const handleEdit = (arrastre) => {
        setEditingArrastre(arrastre);
        setIsModalOpen(true);
    };

    const handleDelete = async (arrastre) => {
        if (!window.confirm(`¿Eliminar el arrastre "${arrastre.contrato_info}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.delete(`/investment-projects/arrastres/${arrastre.arrastre_id}/`);
            onDataChange();
        } catch (err) {
            alert('Error al eliminar el arrastre: ' + (err.message || ''));
        }
    };

    // El array de arrastres ya viene dentro del objeto 'project'
    const arrastres = useMemo(() => project?.arrastres || [], [project]);

    const {totalDevengado, totalPorDevengar, porcentajeEjecutado} = useMemo(() => {
        const devengado = arrastres.reduce((sum, a) => sum + parseFloat(a.monto_devengado || 0), 0);
        const porDevengar = arrastres.reduce((sum, a) => sum + parseFloat(a.monto_por_devengar || 0), 0);
        const total = devengado + porDevengar;
        return {
            totalDevengado: devengado,
            totalPorDevengar: porDevengar,
            porcentajeEjecutado: total > 0 ? (devengado / total) * 100 : 0,
        };
    }, [arrastres]);

    return (
        <div className="space-y-4">
            {isModalOpen && (
                <ArrastreFormModal
                    projectId={project.proyecto_id}
                    arrastre={editingArrastre}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingArrastre(null);
                    }}
                    onSave={handleSave}
                />
            )}

            {arrastres.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-300 uppercase font-semibold">Devengado</p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">$ {totalDevengado.toLocaleString('es-US', {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 uppercase font-semibold">Por Devengar</p>
                        <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">$ {totalPorDevengar.toLocaleString('es-US', {minimumFractionDigits: 2})}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 uppercase font-semibold">% Ejecutado</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{porcentajeEjecutado.toFixed(1)}%</p>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button onClick={handleAdd}
                        className="flex items-center text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <PlusCircle size={16} className="mr-2"/>Añadir Arrastre
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                    <tr>
                        <th className="p-3">Información del Contrato</th>
                        <th className="p-3 text-right">Monto Devengado ($)</th>
                        <th className="p-3 text-right">Monto por Devengar ($)</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {arrastres.map(arr => (
                        <tr key={arr.arrastre_id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="p-3 font-medium dark:text-white">{arr.contrato_info}</td>
                            <td className="p-3 text-right font-mono dark:text-gray-300">{parseFloat(arr.monto_devengado).toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>
                            <td className="p-3 text-right font-mono dark:text-gray-300">{parseFloat(arr.monto_por_devengar).toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>
                            <td className="p-3 text-right">
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => handleEdit(arr)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(arr)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {arrastres.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center p-6 text-gray-500 dark:text-gray-400 italic">No hay arrastres de
                                inversión registrados para este proyecto.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
