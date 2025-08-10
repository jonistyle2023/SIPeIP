import React from 'react';
import {Edit, Plus, Target, Trash2} from 'lucide-react';

const IndicadorCard = ({indicador, onEdit, onDelete}) => (
    <div className="border rounded-lg p-3 text-sm">
        <p className="font-semibold text-gray-800">{indicador.descripcion}</p>
        <div className="flex justify-between items-center mt-2 text-gray-600">
            <div>
                <p><strong>Meta:</strong> {indicador.meta.valor_meta} {indicador.unidad_medida}</p>
                <p><strong>Línea Base:</strong> {indicador.meta.linea_base}</p>
                <p><strong>Año:</strong> {indicador.meta.periodo_anualizado}</p>
            </div>
            <div className="flex space-x-2">
                <button className="p-1 text-blue-500 hover:text-blue-700" onClick={() => onEdit(indicador)}><Edit
                    size={16}/></button>
                <button className="p-1 text-red-500 hover:text-red-700" onClick={() => onDelete(indicador)}><Trash2
                    size={16}/></button>
            </div>
        </div>
    </div>
);


export default function IndicadorList({title, indicadores, onAdd, onEdit, onDelete}) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg flex items-center"><Target className="mr-2 text-gray-500"/>{title}
                </h4>
                <button onClick={onAdd}
                        className="flex items-center text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    <Plus size={14} className="mr-1"/>Añadir Indicador
                </button>
            </div>
            <div className="space-y-3 pl-6 border-l-2">
                {indicadores && indicadores.length > 0 ? (
                    indicadores.map(ind => <IndicadorCard key={ind.indicador_id} indicador={ind} onEdit={onEdit}
                                                          onDelete={onDelete}/>)
                ) : (
                    <p className="text-xs text-gray-500 italic">No hay indicadores definidos.</p>
                )}
            </div>
        </div>
    );
}