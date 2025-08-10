import React, {useState} from 'react';
import {api} from '../../shared/api/api.js';
import {X} from 'lucide-react';

export default function ArrastreFormModal({projectId, onClose, onSave}) {
    const [formData, setFormData] = useState({
        contrato_info: '',
        monto_devengado: '',
        monto_por_devengar: '',
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
                proyecto: projectId,
            };
            await api.post('/investment-projects/arrastres/', payload);
            onSave();
        } catch (err) {
            setError(err.message || 'Error al guardar el arrastre.');
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Nuevo Arrastre de Inversión</h3>
                    <button onClick={onClose}><X/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Información del Contrato</label>
                            <input
                                type="text"
                                name="contrato_info"
                                value={formData.contrato_info}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                                placeholder="Ej: Contrato N° 123-ABC"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Monto Devengado ($)</label>
                                <input
                                    type="number"
                                    name="monto_devengado"
                                    step="0.01"
                                    value={formData.monto_devengado}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                    placeholder="Ej: 150000.00"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Monto por Devengar
                                    ($)</label>
                                <input
                                    type="number"
                                    name="monto_por_devengar"
                                    step="0.01"
                                    value={formData.monto_por_devengar}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1"
                                    placeholder="Ej: 350000.00"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Arrastre
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}