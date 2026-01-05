import React from 'react';
import { X, Target, ListTree } from 'lucide-react';

export default function OdsDetailModal({ ods, iconSrc, onClose }) {
    if (!ods) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-80 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border dark:border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <img src={iconSrc} alt={`ODS ${ods.numero}`} className="w-24 h-24 flex-shrink-0"/>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">ODS {ods.numero}: {ods.nombre}</h2>
                            <p className="text-md text-gray-600 dark:text-gray-300 mt-1">{ods.descripcion}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                        <X size={28}/>
                    </button>
                </div>

                <div className="mt-6 border-t dark:border-slate-700 pt-4">
                    <h3 className="font-semibold text-xl text-gray-800 dark:text-white flex items-center mb-4"><Target className="mr-2 text-blue-600 dark:text-blue-400"/>Metas</h3>
                    <div className="space-y-4">
                        {ods.metas.length > 0 ? (
                            ods.metas.map(meta => (
                                <div key={meta.id || meta.meta_ods_id} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                                    <p className="font-semibold text-gray-800 dark:text-white">{meta.codigo}: <span className="font-normal text-gray-700 dark:text-gray-300">{meta.descripcion}</span></p>

                                    {meta.indicadores.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                                            <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 flex items-center mb-2"><ListTree className="mr-1.5"/>Indicadores</h4>
                                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 pl-4">
                                                {meta.indicadores.map(indicador => (
                                                    <li key={indicador.id || indicador.indicador_ods_id}>
                                                        <span className="font-medium text-gray-700 dark:text-gray-200">{indicador.codigo}:</span> {indicador.descripcion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">Este ODS no tiene metas definidas.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}