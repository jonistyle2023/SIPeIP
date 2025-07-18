import React, { useState } from 'react';
import { api } from '../../api/api';
import { X } from 'lucide-react';

export default function MarcoLogicoFormModal({ project, onClose, onSave }) {
    const [fin, setFin] = useState('');
    const [proposito, setProposito] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                proyecto: project.proyecto_id,
                fin,
                proposito,
            };
            await api.post('/investment-projects/marcos-logicos/', payload);
            onSave(); // Llama a la función onSave para cerrar el modal y recargar los datos
        } catch (err) {
            setError(err.message || 'Ocurrió un error al crear el Marco Lógico.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Crear Marco Lógico para "{project.nombre}"</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="fin" className="block text-sm font-medium text-gray-700">
                                Fin del Proyecto
                            </label>
                            <textarea
                                id="fin"
                                value={fin}
                                onChange={(e) => setFin(e.target.value)}
                                rows="4"
                                className="w-full p-2 border rounded mt-1"
                                placeholder="El objetivo de desarrollo al cual el proyecto contribuye."
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="proposito" className="block text-sm font-medium text-gray-700">
                                Propósito del Proyecto
                            </label>
                            <textarea
                                id="proposito"
                                value={proposito}
                                onChange={(e) => setProposito(e.target.value)}
                                rows="4"
                                className="w-full p-2 border rounded mt-1"
                                placeholder="El resultado directo o el efecto esperado al finalizar el proyecto."
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Marco Lógico</button>
                    </div>
                </form>
            </div>
        </div>
    );
}