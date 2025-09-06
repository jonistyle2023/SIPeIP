import React, {useState, useEffect} from 'react';
import {Plus, Edit, Trash2} from 'lucide-react';
import UnitFormModal from './UnitFormModal.jsx';
import {api} from '../../shared/api/api';

export default function UnitManager() {
    const [entities, setEntities] = useState([]);
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [macroSectores, setMacroSectores] = useState([]);
    const [sectores, setSectores] = useState([]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setUnits([]);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        const fetchEntities = async () => {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://127.0.0.1:8000/api/v1/config/entidades/', {
                headers: {'Authorization': `Token ${token}`}
            });
            const data = await response.json();
            setEntities(data);
        };
        fetchEntities();
    }, []);

    useEffect(() => {
        if (!selectedEntityId) {
            setUnits([]);
            return;
        }
        const fetchUnits = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://127.0.0.1:8000/api/v1/config/unidades-organizacionales/?entidad=${selectedEntityId}`, {
                headers: {'Authorization': `Token ${token}`}
            });
            const data = await response.json();
            setUnits(data);
            setLoading(false);
        };
        fetchUnits();
    }, [selectedEntityId]);

    useEffect(() => {
        const fetchClasificadorSectorial = async () => {
            try {
                const response = await api.get(`/config/catalogos/?codigo=MACROSECTOR`);

                if (response && response.length > 0) {
                    const catalogoCompleto = response[0];
                    const itemsRaiz = catalogoCompleto.items || [];

                    setMacroSectores(itemsRaiz);

                    const todosLosSectores = itemsRaiz.flatMap(macrosector =>
                        macrosector.hijos ? macrosector.hijos.map(sector => ({
                            ...sector,
                            padre: macrosector.id
                        })) : []
                    );
                    setSectores(todosLosSectores);

                } else {
                    console.error("No se encontró el catálogo con código 'MACROSECTOR'");
                    setMacroSectores([]);
                    setSectores([]);
                }
            } catch (error) {
                console.error("Error al cargar el catálogo MACROSECTOR:", error);
                setMacroSectores([]);
                setSectores([]);
            }
        };

        fetchClasificadorSectorial();
    }, []);

    const handleOpenModal = (unit = null) => {
        setEditingUnit(unit);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUnit(null);
    };
    const handleSave = () => {
        handleCloseModal();
        // Forzar recarga de unidades
        const currentId = selectedEntityId;
        setSelectedEntityId('');
        setTimeout(() => setSelectedEntityId(currentId), 0);
    };

    // --- NUEVA FUNCIÓN PARA ELIMINAR ---
    const handleDelete = async (unitId) => {
        if (!window.confirm('¿Está seguro de que desea eliminar esta unidad organizacional?')) {
            return;
        }
        try {
            await api.delete(`/config/unidades-organizacionales/${unitId}/`);
            handleSave();
        } catch (error) {
            alert('Error al eliminar la unidad.');
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <label htmlFor="entity-select" className="font-semibold">Seleccione una Entidad:</label>
                    <select
                        id="entity-select"
                        value={selectedEntityId}
                        onChange={(e) => setSelectedEntityId(e.target.value)}
                        className="p-2 border rounded-md"
                    >
                        <option value="">-- Elija una entidad --</option>
                        {entities.map(entity => (
                            <option key={entity.id} value={entity.id}>{entity.nombre}</option>
                        ))}
                    </select>
                </div>
                {selectedEntityId && (
                    <button onClick={() => handleOpenModal()}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <Plus size={16} className="mr-2"/>
                        Nueva Unidad
                    </button>
                )}
            </div>

            {loading && <p className="text-center p-4">Cargando unidades...</p>}

            {selectedEntityId && !loading && units.length === 0 && (
                <p className="text-center p-4 text-gray-500">No hay unidades organizacionales registradas.</p>
            )}

            {selectedEntityId && units.length > 0 && !loading && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-3">Nombre de la Unidad</th>
                            <th className="p-3">Entidad</th>
                            <th className="p-3">MacroSector</th>
                            <th className="p-3">Sector(es)</th>
                            <th className="p-3">Unidad Padre</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {units.map(unit => (
                            <tr key={unit.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-800">{unit.nombre}</td>
                                <td className="p-3">{unit.entidad_nombre || '-'}</td>
                                <td className="p-3">{unit.macrosector_nombre || '-'}</td>
                                <td className="p-3">
                                    {unit.sectores_nombres && unit.sectores_nombres.length > 0
                                        ? unit.sectores_nombres.join(', ')
                                        : '-'}
                                </td>
                                <td className="p-3">{unit.padre_nombre || 'Nivel Principal'}</td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${unit.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {unit.activo ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td className="p-3 flex items-center space-x-2">
                                    <button onClick={() => handleOpenModal(unit)}
                                            className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/>
                                    </button>
                                    <button onClick={() => handleDelete(unit.id)}
                                            className="p-1 text-red-500 hover:text-red-700">
                                        <Trash2 size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <UnitFormModal
                unit={editingUnit}
                entityId={selectedEntityId}
                parentUnits={units}
                macroSectores={macroSectores}
                sectores={sectores}
                onClose={handleCloseModal}
                onSave={handleSave}
            />}
        </div>
    );
}