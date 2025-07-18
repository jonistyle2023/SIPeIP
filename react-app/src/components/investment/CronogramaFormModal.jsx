import React, { useState } from 'react';
import { api } from '../../api/api';
import { X } from 'lucide-react';

export default function CronogramaFormModal({ actividad, onClose, onSave }) {
    const [formData, setFormData] = useState({
        periodo: '', // Formato AAAA-MM
        valor_programado: '',
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
                actividad: actividad.actividad_id,
            };
            await api.post('/investment-projects/cronogramas/', payload);
            onSave();
        } catch (err) {
            setError(err.message || 'Error al guardar la programación.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Programar Valor para Actividad</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Actividad</p>
                            <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded mt-1">{actividad.descripcion}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Periodo (AAAA-MM)</label>
                                <input
                                    type="month"
                                    name="periodo"
                                    value={formData.periodo}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Valor Programado ($)</label>
                                <input
                                    type="number"
                                    name="valor_programado"
                                    step="0.01"
                                    value={formData.valor_programado}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                    placeholder="Ej: 50000.00"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>

                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}