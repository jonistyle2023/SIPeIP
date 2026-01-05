import React, {useState} from 'react';
import {api} from '../../../shared/api/api.js';
import {X} from 'lucide-react';

export default function ActividadFormModal({componente, onClose, onSave}) {
    const [formData, setFormData] = useState({
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
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
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xl border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold dark:text-white">Nueva Actividad</h3>
                    <button onClick={onClose} className="dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1"><X/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Componente</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 p-2 rounded mt-1">{componente.nombre}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción de la
                                Actividad</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Inicio</label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Fin</label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Actividad
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}