import React, {useMemo, useState} from 'react';
import {PlusCircle} from 'lucide-react';
import CronogramaFormModal from './modals/CronogramaFormModal.jsx';

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

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-between items-center transition-colors">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Costo Total Programado del Proyecto</h3>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">$ {totalProgramado.toLocaleString('es-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-200 uppercase text-xs">
                    <tr>
                        <th className="p-3">Actividad</th>
                        <th className="p-3">Programación (Periodo: Valor)</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {actividades.map(act => (
                        <tr key={act.actividad_id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="p-3 font-medium max-w-xs truncate dark:text-white">{act.descripcion}</td>
                            <td className="p-3">
                                <div className="flex flex-wrap gap-2">
                                    {act.cronograma.length > 0 ? act.cronograma.map(item => (
                                        <span key={item.cronograma_id}
                                              className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded-full">
                                                {item.periodo}: $ {parseFloat(item.valor_programado).toLocaleString('es-US')}
                                            </span>
                                    )) : <span className="text-xs text-gray-500 dark:text-gray-400 italic">Sin programación</span>}
                                </div>
                            </td>
                            <td className="p-3 text-right">
                                <button onClick={() => handleOpenModal(act)}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-end w-full">
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