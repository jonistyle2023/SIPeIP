import React from 'react';
import { X, Target, ListTree } from 'lucide-react';

export default function OdsDetailModal({ ods, iconSrc, onClose }) {
    if (!ods) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-80 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <img src={iconSrc} alt={`ODS ${ods.numero}`} className="w-24 h-24 flex-shrink-0"/>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">ODS {ods.numero}: {ods.nombre}</h2>
                            <p className="text-md text-gray-600 mt-1">{ods.descripcion}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={28}/>
                    </button>
                </div>

                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-xl text-gray-800 flex items-center mb-4"><Target className="mr-2 text-blue-600"/>Metas</h3>
                    <div className="space-y-4">
                        {ods.metas.length > 0 ? (
                            ods.metas.map(meta => (
                                <div key={meta.meta_ods_id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="font-semibold text-gray-800">{meta.codigo}: <span className="font-normal text-gray-700">{meta.descripcion}</span></p>

                                    {meta.indicadores.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <h4 className="font-semibold text-sm text-gray-600 flex items-center mb-2"><ListTree className="mr-1.5"/>Indicadores</h4>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600 pl-4">
                                                {meta.indicadores.map(indicador => (
                                                    <li key={indicador.indicador_ods_id}>
                                                        <span className="font-medium text-gray-700">{indicador.codigo}:</span> {indicador.descripcion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">Este ODS no tiene metas definidas.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}