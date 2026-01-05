import React from 'react';
import {Edit, Plus, Target, Trash2} from 'lucide-react';

const IndicadorCard = ({indicador, onEdit, onDelete}) => (
    <div className="border rounded-lg p-3 text-sm dark:border-slate-700">
        <p className="font-semibold text-gray-800 dark:text-white">{indicador.descripcion_sin_prefijo || indicador.descripcion}</p>
        <div className="flex justify-between items-center mt-2 text-gray-600 dark:text-gray-300">
            <div>
                <p><strong>Meta:</strong> {indicador.meta.valor_meta} {indicador.unidad_medida}</p>
                <p><strong>Línea Base:</strong> {indicador.meta.linea_base}</p>
                <p><strong>Año:</strong> {indicador.meta.periodo_anualizado}</p>
            </div>
            <div className="flex space-x-2">
                <button className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" onClick={() => onEdit(indicador)}><Edit
                    size={16}/></button>
                <button className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" onClick={() => onDelete(indicador)}><Trash2
                    size={16}/></button>
            </div>
        </div>
    </div>
);


export default function IndicadorList({title, indicadores, tipoIndicador, onAdd, onEdit, onDelete}) {
    const normalize = (str) => {
        return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredIndicadores = tipoIndicador
        ? (indicadores || []).filter(ind => {
            const desc = normalize(ind.descripcion);
            const type = normalize(tipoIndicador);
            // Flexibilizar: acepta "Fin:", "Fin " (espacio) o variantes
            return desc.startsWith(type + ':') || desc.startsWith(type + ' ');
        })
        : (indicadores || []);

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg flex items-center dark:text-white"><Target className="mr-2 text-gray-500 dark:text-gray-400"/>{title}
                </h4>
                <button onClick={onAdd}
                        className="flex items-center text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    <Plus size={14} className="mr-1"/>Añadir Indicador
                </button>
            </div>
            <div className="space-y-3 pl-6 border-l-2 dark:border-slate-700">
                {filteredIndicadores.length > 0 ? (
                    filteredIndicadores.map(ind => <IndicadorCard key={ind.indicador_id} indicador={ind} onEdit={onEdit}
                                                          onDelete={onDelete}/>)
                ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No hay indicadores definidos.</p>
                )}
            </div>
        </div>
    );
}