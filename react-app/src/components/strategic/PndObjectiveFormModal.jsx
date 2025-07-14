import React, {useState} from 'react';
import {api} from '../../api/api';

export default function PndObjectiveFormModal({pndId, onClose, onSave}) {
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const payload = {pnd: pndId, codigo, descripcion};
            await api.post('/strategic-planning/pnd-objetivos/', payload);
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar el objetivo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">Añadir Objetivo al Plan</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Código</label>
                        <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} required
                               className="mt-1 block w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción del Objetivo</label>
                        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required rows="4"
                                  className="mt-1 block w-full p-2 border rounded-md"></textarea>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar
                        </button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">{isSaving ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}