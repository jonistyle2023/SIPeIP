import React, { useState } from 'react';
import { api } from '../../api/api';
import { X } from 'lucide-react';

export default function ActividadFormModal({ componente, onClose, onSave }) {
    const [formData, setFormData] = useState({
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
            setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
            return;
        }
        try {
            const payload = {
                ...formData,
                componente: componente.componente_id,
            };
            await api.post('/investment-projects/actividades/', payload);
            onSave();
        } catch (err) {
            setError(err.message || 'Error al guardar la actividad.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Nueva Actividad</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Componente</p>
                            <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded mt-1">{componente.nombre}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción de la Actividad</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-2 border rounded mt-1"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Actividad</button>
                    </div>
                </form>
            </div>
        </div>
    );
}