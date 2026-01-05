import React, {useEffect, useState} from 'react';
import {api} from '../../../shared/api/api.js';

export default function PndObjectiveFormModal({pndId, objetivo, onClose, onSave}) {
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (objetivo) {
            setCodigo(objetivo.codigo || '');
            setDescripcion(objetivo.descripcion || '');
        }
    }, [objetivo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('pndId:', pndId); // Debe mostrar un número
        setIsSaving(true);
        setError('');
        try {
            const payload = {pnd: Number(pndId), codigo, descripcion};
            if (objetivo) {
                await api.put(`/strategic-planning/pnd-objetivos/${objetivo.objetivo_pnd_id}/`, payload);
            } else {
                await api.post('/strategic-planning/pnd-objetivos/', payload);
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
                    {objetivo ? 'Editar Objetivo del Plan' : 'Añadir Objetivo al Plan'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
                        <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción del Objetivo</label>
                        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows="4"
                                  className="mt-1 block w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
                        </button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                            {isSaving ? 'Guardando...' : (objetivo ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}