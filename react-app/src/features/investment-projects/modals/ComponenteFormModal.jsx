import React, {useState} from 'react';
import {api} from '../../../shared/api/api.js';
import {X} from 'lucide-react';

export default function ComponenteFormModal({marcoLogicoId, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        ponderacion: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
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
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold dark:text-white">Nuevo Componente</h3>
                    <button onClick={onClose} className="dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1"><X/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Componente</label>
                            <textarea
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                placeholder="Ej: Infraestructura y equipamiento adecuados construidos y operativos."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ponderación (%)</label>
                            <input
                                type="number"
                                name="ponderacion"
                                step="0.01"
                                value={formData.ponderacion}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                placeholder="Ej: 60.00"
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Componente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}