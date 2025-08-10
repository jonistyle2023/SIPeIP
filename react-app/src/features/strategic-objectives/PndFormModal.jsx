import React, {useEffect, useState} from 'react';
import {api} from '../../shared/api/api.js';

export default function PndFormModal({pnd, onClose, onSave}) {
    const [nombre, setNombre] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [fechaPublicacion, setFechaPublicacion] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (pnd) {
            setNombre(pnd.nombre || '');
            setPeriodo(pnd.periodo || '');
            setFechaPublicacion(pnd.fecha_publicacion || '');
        }
    }, [pnd]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const payload = {
                nombre,
                periodo,
                fecha_publicacion: fechaPublicacion
            };
            if (pnd) {
                await api.put(`/strategic-planning/pnd/${pnd.plan_id}/`, payload);
            } else {
                await api.post('/strategic-planning/pnd/', payload);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar el plan.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">{pnd ? 'Editar Plan Nacional de Desarrollo' : 'Crear Nuevo Plan Nacional de Desarrollo'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Período</label>
                        <input type="text" value={periodo} onChange={(e) => setPeriodo(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Publicación</label>
                        <input type="date" value={fechaPublicacion}
                               onChange={(e) => setFechaPublicacion(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar
                        </button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                            {isSaving ? 'Guardando...' : (pnd ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}