import React, {useMemo, useState} from 'react';
import {PlusCircle} from 'lucide-react';
import CronogramaFormModal from './CronogramaFormModal.jsx';

export default function FinancieroTab({marcoLogico, onDataChange}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const handleOpenModal = (actividad) => {
        setSelectedActivity(actividad);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        setIsModalOpen(false);
        onDataChange(); // Recarga los datos del proyecto para ver los cambios
    };

    const actividades = useMemo(() =>
            marcoLogico?.componentes?.flatMap(c => c.actividades) || [],
        [marcoLogico]
    );

    const totalProgramado = useMemo(() =>
            actividades.reduce((total, act) =>
                    total + act.cronograma.reduce((subtotal, item) => subtotal + parseFloat(item.valor_programado), 0),
                0),
        [actividades]
    );

    return (
        <div className="space-y-4">
            {isModalOpen && <CronogramaFormModal actividad={selectedActivity} onClose={() => setIsModalOpen(false)}
                                                 onSave={handleSave}/>}

            <div className="p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-800">Costo Total Programado del Proyecto</h3>
                <p className="text-2xl font-bold text-blue-900">$ {totalProgramado.toLocaleString('es-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-3">Actividad</th>
                        <th className="p-3">Programación (Periodo: Valor)</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {actividades.map(act => (
                        <tr key={act.actividad_id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium max-w-xs truncate">{act.descripcion}</td>
                            <td className="p-3">
                                <div className="flex flex-wrap gap-2">
                                    {act.cronograma.length > 0 ? act.cronograma.map(item => (
                                        <span key={item.cronograma_id}
                                              className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                                                {item.periodo}: $ {parseFloat(item.valor_programado).toLocaleString('es-US')}
                                            </span>
                                    )) : <span className="text-xs text-gray-500 italic">Sin programación</span>}
                                </div>
                            </td>
                            <td className="p-3 text-right">
                                <button onClick={() => handleOpenModal(act)}
                                        className="text-blue-600 hover:text-blue-800 flex items-center justify-end w-full">
                                    <PlusCircle size={16} className="mr-1"/>
                                    Programar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}