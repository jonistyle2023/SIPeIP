import React, {useEffect, useState} from 'react';
import {api} from '../../../shared/api/api.js';

export default function SectoralPlanFormModal({plan, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        periodo_id: '',
        entidad_responsable_id: '',
        fecha_publicacion: ''
    });
    const [entidades, setEntidades] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [entidadesData, periodosData] = await Promise.all([
                    api.get('/config/entidades/'),
                    api.get('/config/periodos/')
                ]);
                setEntidades(Array.isArray(entidadesData) ? entidadesData : []);
                setPeriodos(Array.isArray(periodosData) ? periodosData : []);
            } catch (err) {
                setError('No se pudieron cargar los datos necesarios (entidades o períodos).');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (plan) {
            setFormData({
                nombre: plan.nombre || '',
                periodo_id: plan.periodo?.id || '',
                entidad_responsable_id: plan.entidad_responsable || '', // Asumiendo que la API devuelve el ID aquí
                fecha_publicacion: plan.fecha_publicacion || ''
            });
        } else {
            setFormData({
                nombre: '',
                periodo_id: '',
                entidad_responsable_id: '',
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
            const payload = {
                ...formData,
                periodo_id: parseInt(formData.periodo_id, 10),
                entidad_responsable_id: parseInt(formData.entidad_responsable_id, 10)
            };
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
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">{plan ? 'Editar Plan Sectorial' : 'Crear Nuevo Plan Sectorial'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre del Plan"
                           required className="block w-full p-2 border rounded-md"/>
                    <select name="periodo_id" value={formData.periodo_id} onChange={handleChange} required
                            className="block w-full p-2 border rounded-md">
                        <option value="">Seleccione un Período</option>
                        {periodos.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                    <select name="entidad_responsable_id" value={formData.entidad_responsable_id}
                            onChange={handleChange} required className="block w-full p-2 border rounded-md">
                        <option value="">Seleccione la Entidad Responsable</option>
                        {entidades.map(entidad => (
                            <option key={entidad.id}
                                    value={entidad.id}>{entidad.nombre}</option>
                        ))}
                    </select>
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