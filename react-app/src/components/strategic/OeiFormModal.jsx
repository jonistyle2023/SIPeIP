import React, {useState} from 'react';
import {api} from '../../api/api';
import {Plus} from 'lucide-react';

// Este componente recibe:
// - planId: El ID del plan al que pertenece el nuevo OEI.
// - onClose: Una función para cerrar el modal.
// - onSave: Una función para refrescar la lista de OEI en la página principal.
export default function OeiFormModal({planId, onClose, onSave}) {
    const [codigo, setCodigo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descripcion || !codigo) {
            setError('El código y la descripción son obligatorios.');
            return;
        }

        setIsSaving(true);
        setError(null);

        const newOeiData = {
            plan_institucional: planId,
            codigo,
            descripcion,
            activo: true
        };

        try {
            await api.post('/strategic-planning/oei/', newOeiData);
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar el objetivo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">Crear Nuevo Objetivo Estratégico (OEI)</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                id="codigo"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ej: OEI.01"
                            />
                        </div>
                        <div>
                            <label htmlFor="descripcion"
                                   className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                rows="4"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describa el objetivo estratégico..."
                            ></textarea>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center">
                            {isSaving ? 'Guardando...' : 'Guardar Objetivo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}