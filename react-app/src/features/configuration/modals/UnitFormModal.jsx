import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import {api} from '../../../shared/api/api.js';

export default function UnitFormModal({unit, entityId, parentUnits, macroSectores, sectores, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        entidad: entityId,
        padre: null,
        macrosector: '',
        sectores: [],
        activo: true,
    });
    const [filteredSectores, setFilteredSectores] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (unit) {
            setFormData({
                nombre: unit.nombre || '',
                entidad: unit.entidad,
                padre: unit.padre || null,
                macrosector: unit.macrosector || '',
                sectores: unit.sectores || [],
                activo: unit.activo,
            });
        }
    }, [unit]);

    useEffect(() => {
        if (formData.macrosector) {
            const newFilteredSectores = sectores.filter(s => s.padre === parseInt(formData.macrosector));
            setFilteredSectores(newFilteredSectores);
        } else {
            setFilteredSectores([]);
        }
    }, [formData.macrosector, sectores]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        if (name === "macrosector") {
            setFormData(prev => ({...prev, sectores: []}));
        }
    };

    const handleSectorChange = (sectorId) => {
        const currentSectores = formData.sectores;
        const newSectores = currentSectores.includes(sectorId)
            ? currentSectores.filter(id => id !== sectorId)
            : [...currentSectores, sectorId];
        setFormData(prev => ({...prev, sectores: newSectores}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            padre: formData.padre || null,
            macrosector: formData.macrosector || null,
        };
        try {
            if (unit) {
                await api.put(`/config/unidades-organizacionales/${unit.id}/`, payload);
            } else {
                await api.post('/config/unidades-organizacionales/', payload);
            }
            onSave();
        } catch (err) {
            setError('Error al guardar. Verifique los campos.');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{unit ? 'Editar Unidad' : 'Nueva Unidad'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Campo Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre de la Unidad</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                                   className="w-full p-2 border rounded mt-1" required/>
                        </div>

                        <div>
                            <label htmlFor="padre" className="block text-sm font-medium text-gray-700">Unidad Padre
                                (Jerarquía)</label>
                            <select
                                id="padre"
                                name="padre"
                                value={formData.padre || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mt-1"
                            >
                                <option value="">-- Nivel Principal (Sin Padre) --</option>
                                {parentUnits.filter(u => !unit || u.id !== unit.id).map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">MacroSector</label>
                            <select name="macrosector" value={formData.macrosector} onChange={handleChange}
                                    className="w-full p-2 border rounded mt-1">
                                <option value="">-- Seleccione un MacroSector --</option>
                                {macroSectores.map(ms => <option key={ms.id} value={ms.id}>{ms.nombre}</option>)}
                            </select>
                        </div>

                        {formData.macrosector && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sectores Vinculados</label>
                                <div
                                    className="mt-2 p-3 border rounded-md max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {filteredSectores.length > 0 ? (
                                        filteredSectores.map(sector => (
                                            <label key={sector.id}
                                                   className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.sectores.includes(sector.id)}
                                                    onChange={() => handleSectorChange(sector.id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{sector.nombre}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 col-span-full">No hay sectores para este
                                            macrosector.</p>
                                    )}
                                </div>
                            </div>
                        )}
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