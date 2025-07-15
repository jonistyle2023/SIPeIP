import React, {useState, useEffect} from 'react';
import {api} from '../../api/api';

export default function SectoralPlanFormModal({plan, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        periodo: '',
        entidad_responsable: '',
        fecha_publicacion: ''
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (plan) {
            setFormData({
                nombre: plan.nombre || '',
                periodo: plan.periodo || '',
                entidad_responsable: plan.entidad_responsable || '',
                fecha_publicacion: plan.fecha_publicacion || ''
            });
        } else {
            setFormData({
                nombre: '',
                periodo: '',
                entidad_responsable: '',
                fecha_publicacion: ''
            });
        }
    }, [plan]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const payload = {...formData, entidad_responsable: parseInt(formData.entidad_responsable)};
            if (plan && plan.plan_sectorial_id) {
                await api.put(`/strategic-planning/planes-sectoriales/${plan.plan_sectorial_id}/`, payload);
            } else {
                await api.post('/strategic-planning/planes-sectoriales/', payload);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar el Plan Sectorial.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">{plan ? 'Editar Plan Sectorial' : 'Crear Nuevo Plan Sectorial'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre del Plan"
                           required className="block w-full p-2 border rounded-md"/>
                    <input name="periodo" value={formData.periodo} onChange={handleChange}
                           placeholder="Periodo (Ej: 2025-2029)" required
                           className="block w-full p-2 border rounded-md"/>
                    <input name="entidad_responsable" type="number" value={formData.entidad_responsable}
                           onChange={handleChange} placeholder="ID de Entidad Responsable" required
                           className="block w-full p-2 border rounded-md"/>
                    <div>
                        <label className="text-sm text-gray-600">Fecha de Publicación</label>
                        <input name="fecha_publicacion" type="date" value={formData.fecha_publicacion}
                               onChange={handleChange} required className="block w-full p-2 border rounded-md"/>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar
                        </button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                            {isSaving ? 'Guardando...' : (plan ? 'Guardar Cambios' : 'Guardar Plan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}