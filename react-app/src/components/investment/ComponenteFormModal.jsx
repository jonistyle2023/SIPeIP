import React, { useState } from 'react';
import { api } from '../../api/api';
import { X } from 'lucide-react';

export default function ComponenteFormModal({ marcoLogicoId, onClose, onSave }) {
    const [formData, setFormData] = useState({
        nombre: '',
        ponderacion: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                ...formData,
                marco_logico: marcoLogicoId,
            };
            await api.post('/investment-projects/componentes/', payload);
            onSave();
        } catch (err) {
            setError(err.message || 'Error al guardar el componente.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Nuevo Componente</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Componente</label>
                            <textarea
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-2 border rounded mt-1"
                                placeholder="Ej: Infraestructura y equipamiento adecuados construidos y operativos."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ponderación (%)</label>
                            <input
                                type="number"
                                name="ponderacion"
                                step="0.01"
                                value={formData.ponderacion}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                                placeholder="Ej: 60.00"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Componente</button>
                    </div>
                </form>
            </div>
        </div>
    );
}