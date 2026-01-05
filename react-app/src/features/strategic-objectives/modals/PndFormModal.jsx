import React, {useEffect, useState} from 'react';
import {api} from '../../../shared/api/api.js';

export default function PndFormModal({pnd, onClose, onSave}) {
    const [nombre, setNombre] = useState('');
    const [periodoId, setPeriodoId] = useState('');
    const [fechaPublicacion, setFechaPublicacion] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [periodos, setPeriodos] = useState([]);

    useEffect(() => {
        // Cargar los períodos de planificación disponibles
        const fetchPeriodos = async () => {
            try {
                const data = await api.get('/config/periodos/');
                setPeriodos(data);
            } catch (err) {
                setError('No se pudieron cargar los períodos de planificación.');
            }
        };
        fetchPeriodos();

        if (pnd) {
            setNombre(pnd.nombre || '');
            setPeriodoId(pnd.periodo?.id || '');
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
                periodo_id: periodoId,
                fecha_publicacion: fechaPublicacion
            };
            if (pnd) {
                await api.put(`/strategic-planning/pnd/${pnd.pnd_id}/`, payload);
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
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg border dark:border-slate-700">
                <h2 className="text-lg font-bold mb-4 dark:text-white">{pnd ? 'Editar Plan Nacional de Desarrollo' : 'Crear Nuevo Plan Nacional de Desarrollo'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
                        <select
                            value={periodoId}
                            onChange={(e) => setPeriodoId(e.target.value)}
                            required
                            className="mt-1 block w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="" disabled>Seleccione un período</option>
                            {periodos.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Publicación</label>
                        <input type="date" value={fechaPublicacion}
                               onChange={(e) => setFechaPublicacion(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
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