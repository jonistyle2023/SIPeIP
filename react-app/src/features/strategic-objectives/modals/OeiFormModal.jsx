import React, {useEffect, useState} from 'react';
import {api} from '../../../shared/api/api.js';

export default function OeiFormModal({planId, oei, onClose, onSave}) {
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Precarga datos si es edición
    useEffect(() => {
        if (oei) {
            setCodigo(oei.codigo || '');
            setDescripcion(oei.descripcion || '');
        } else {
            setCodigo('');
            setDescripcion('');
        }
    }, [oei]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descripcion || !codigo) {
            setError('El código y la descripción son obligatorios.');
            return;
        }
        setIsSaving(true);
        setError(null);

        const oeiData = {
            plan_institucional: planId,
            codigo,
            descripcion,
            activo: true
        };

        try {
            if (oei && oei.oei_id) {
                await api.put(`/strategic-planning/oei/${oei.oei_id}/`, oeiData);
            } else {
                await api.post('/strategic-planning/oei/', oeiData);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar el objetivo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg border dark:border-slate-700">
                <h2 className="text-lg font-bold mb-4 dark:text-white">
                    {oei ? 'Editar Objetivo Estratégico (OEI)' : 'Crear Nuevo Objetivo Estratégico (OEI)'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
                            <input
                                type="text"
                                id="codigo"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                                placeholder="Ej: OEI.01"
                            />
                        </div>
                        <div>
                            <label htmlFor="descripcion"
                                   className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                            <textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                rows="4"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                                placeholder="Describa el objetivo estratégico..."
                            ></textarea>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3 dark:border-slate-700">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center">
                            {isSaving ? 'Guardando...' : (oei ? 'Guardar Cambios' : 'Guardar Objetivo')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}