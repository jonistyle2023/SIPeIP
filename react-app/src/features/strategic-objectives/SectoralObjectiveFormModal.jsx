import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/api.js';

export default function SectoralObjectiveFormModal({ planSectorialId, objetivo, onClose, onSave }) {
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (objetivo) {
            setCodigo(objetivo.codigo || '');
            setDescripcion(objetivo.descripcion || '');
        } else {
            setCodigo('');
            setDescripcion('');
        }
    }, [objetivo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const payload = { plan_sectorial: planSectorialId, codigo, descripcion };
            if (objetivo && objetivo.objetivo_sectorial_id) {
                await api.put(`/strategic-planning/objetivos-sectoriales/${objetivo.objetivo_sectorial_id}/`, payload);
            } else {
                await api.post('/strategic-planning/objetivos-sectoriales/', payload);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar el objetivo sectorial.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">{objetivo ? 'Editar Objetivo Sectorial' : 'Añadir Objetivo Sectorial'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)}
                           placeholder="Código del Objetivo" required className="block w-full p-2 border rounded-md"/>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                              placeholder="Descripción del Objetivo" required rows="4"
                              className="block w-full p-2 border rounded-md"></textarea>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar
                        </button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                            {isSaving ? 'Guardando...' : (objetivo ? 'Guardar Cambios' : 'Guardar Objetivo')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}