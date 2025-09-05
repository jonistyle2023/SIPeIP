import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import {api} from '../../shared/api/api'; // Asegúrate de usar tu helper de API

export default function UnitFormModal({
                                          unit, entityId, parentUnits, macroSectores, sectores, onClose, onSave
                                      }) {
    const [formData, setFormData] = useState({
        nombre: '',
        entidad: entityId,
        padre: '',
        macrosector: '',
        sectores: [], // Para el backend, debe ser 'sectores' según tu serializer
        activo: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (unit) {
            setFormData({
                nombre: unit.nombre,
                entidad: unit.entidad,
                padre: unit.padre || '',
                macrosector: unit.macrosector || '',
                sectores: unit.sectores || [], // El serializer espera 'sectores'
                activo: unit.activo,
            });
        }
    }, [unit]);

    const handleChange = (e) => {
        const {name, value, type, checked, options} = e.target;
        if (name === 'sectores') {
            const selected = Array.from(options).filter(opt => opt.selected).map(opt => opt.value);
            setFormData(prev => ({...prev, sectores: selected}));
        } else {
            setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const body = {...formData};
        if (!body.padre) delete body.padre;
        if (!body.macrosector) delete body.macrosector;

        try {
            if (unit) {
                await api.put(`/config/unidades-organizacionales/${unit.id}/`, body);
            } else {
                await api.post('/config/unidades-organizacionales/', body);
            }
            onSave();
        } catch (err) {
            const errorData = await err.response.json();
            setError(JSON.stringify(errorData));
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{unit ? 'Editar Unidad Organizacional' : 'Nueva Unidad Organizacional'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre de la
                                Unidad</label>
                            <input id="nombre" type="text" name="nombre" placeholder="Nombre de la Unidad"
                                   value={formData.nombre}
                                   onChange={handleChange} className="w-full p-2 border rounded mt-1" required/>
                        </div>
                        <div>
                            <label htmlFor="padre" className="block text-sm font-medium text-gray-700">Unidad Padre
                                (Jerarquía)</label>
                            <select id="padre" name="padre" value={formData.padre} onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1">
                                <option value="">-- Nivel Principal (Sin Padre) --</option>
                                {parentUnits.filter(u => !unit || u.id !== unit.id).map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="macrosector"
                                   className="block text-sm font-medium text-gray-700">MacroSector</label>
                            <select id="macrosector" name="macrosector" value={formData.macrosector}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1">
                                <option value="">-- Seleccione MacroSector --</option>
                                {macroSectores.map(ms => (
                                    <option key={ms.id} value={ms.id}>{ms.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sectores" className="block text-sm font-medium text-gray-700">Sectores
                                Vinculados</label>
                            <select id="sectores" name="sectores" multiple value={formData.sectores}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded h-24 mt-1">
                                {sectores.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="activo"
                                   checked={formData.activo}
                                   onChange={handleChange}/>
                            <span>Activa</span>
                        </label>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center px-6 pb-2">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar
                        </button>
                        <button type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}