import React, {useState, useEffect} from 'react';
import {api} from '../../shared/api/api.js';

export default function OdsFormModal({ods, onClose, onSave}) {
    const [numero, setNumero] = useState('');
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (ods) {
            setNumero(ods.numero || '');
            setNombre(ods.nombre || '');
            setDescripcion(ods.descripcion || '');
        }
    }, [ods]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const payload = {numero: parseInt(numero), nombre, descripcion};
            if (ods) {
                await api.put(`/strategic-planning/ods/${ods.ods_id}/`, payload);
            } else {
                await api.post('/strategic-planning/ods/', payload);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar el ODS.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">{ods ? 'Editar Objetivo de Desarrollo Sostenible' : 'Crear Nuevo Objetivo de Desarrollo Sostenible'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Número</label>
                        <input type="number" value={numero} onChange={(e) => setNumero(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del ODS</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows="3"
                                  className="mt-1 block w-full p-2 border rounded-md"></textarea>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                            {isSaving ? 'Guardando...' : (ods ? 'Actualizar' : 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}