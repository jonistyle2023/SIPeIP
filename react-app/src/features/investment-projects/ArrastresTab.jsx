import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import ArrastreFormModal from './ArrastreFormModal.jsx';

export default function ArrastresTab({ project, onDataChange }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = () => {
        setIsModalOpen(false);
        onDataChange(); // Llama a la función para recargar los datos del proyecto
    };

    // El array de arrastres ya viene dentro del objeto 'project'
    const arrastres = project?.arrastres || [];

    return (
        <div className="space-y-4">
            {isModalOpen && <ArrastreFormModal projectId={project.proyecto_id} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}

            <div className="flex justify-end">
                <button onClick={() => setIsModalOpen(true)} className="flex items-center text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <PlusCircle size={16} className="mr-2"/>Añadir Arrastre
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-3">Información del Contrato</th>
                        <th className="p-3 text-right">Monto Devengado ($)</th>
                        <th className="p-3 text-right">Monto por Devengar ($)</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {arrastres.map(arr => (
                        <tr key={arr.arrastre_id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{arr.contrato_info}</td>
                            <td className="p-3 text-right font-mono">{parseFloat(arr.monto_devengado).toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>
                            <td className="p-3 text-right font-mono">{parseFloat(arr.monto_por_devengar).toLocaleString('es-BO', {minimumFractionDigits: 2})}</td>
                            <td className="p-3 text-right">
                                <div className="flex justify-end space-x-2">
                                    <button className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                                    <button className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {arrastres.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center p-6 text-gray-500 italic">No hay arrastres de inversión registrados para este proyecto.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}