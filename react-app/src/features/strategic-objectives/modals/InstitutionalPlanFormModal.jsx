import React, {useEffect, useState} from 'react';
import {api} from '../../../shared/api/api.js';

export default function InstitutionalPlanFormModal({plan, onClose, onSave}) {
    const [nombre, setNombre] = useState('');
    const [entidad, setEntidad] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [estado, setEstado] = useState('BORRADOR');
    const [entidades, setEntidades] = useState([]);
    const [periodos, setPeriodos] = useState([]);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        api.get('/config/entidades/').then(setEntidades);
        api.get('/config/periodos/').then(setPeriodos);
    }, []);

    // Precarga datos si es edición
    useEffect(() => {
        if (plan) {
            setNombre(plan.nombre || '');
            setEntidad(plan.entidad || '');
            setPeriodo(plan.periodo || '');
            setEstado(plan.estado || 'BORRADOR');
        } else {
            setNombre('');
            setEntidad('');
            setPeriodo('');
            setEstado('BORRADOR');
        }
    }, [plan]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        const data = {nombre, entidad, periodo, estado};
        try {
            if (plan && plan.plan_institucional_id) {
                await api.put(`/strategic-planning/planes-institucionales/${plan.plan_institucional_id}/`, data);
            } else {
                await api.post('/strategic-planning/planes-institucionales/', data);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al guardar el plan institucional.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">
                    {plan ? 'Editar Plan Institucional' : 'Nuevo Plan Institucional'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                        placeholder="Nombre del plan institucional"
                        className="block w-full p-2 border rounded-md"
                    />
                    <select value={entidad} onChange={e => setEntidad(e.target.value)} required
                            className="block w-full p-2 border rounded-md">
                        <option value="">Seleccione Entidad</option>
                        {entidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                    <select value={periodo} onChange={e => setPeriodo(e.target.value)} required
                            className="block w-full p-2 border rounded-md">
                        <option value="">Seleccione Periodo</option>
                        {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <select value={estado} onChange={e => setEstado(e.target.value)}
                            className="block w-full p-2 border rounded-md">
                        <option value="BORRADOR">Borrador</option>
                        <option value="VALIDADO">Validado</option>
                        <option value="APROBADO">Aprobado</option>
                    </select>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar
                        </button>
                        <button type="submit" disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                            {isSaving ? 'Guardando...' : (plan ? 'Guardar Cambios' : 'Crear Plan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}