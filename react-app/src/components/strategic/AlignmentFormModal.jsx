import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../api/api';

// Endpoints de API correspondientes
const modelEndpoints = {
    'objetivoestrategicoinstitucional': '/strategic-planning/oei/',
    'objetivopnd': '/strategic-planning/pnd-objetivos/',
    'metaods': '/strategic-planning/ods-metas/',
    // En caso de ser necesario se agregan más modelos
};

export default function AlignmentFormModal({onClose, onSave}) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Estado para los datos del formulario ---
    const [alignableTypes, setAlignableTypes] = useState([]);
    const [sourceObjects, setSourceObjects] = useState([]);
    const [destinationObjects, setDestinationObjects] = useState([]);

    // --- Estado para las selecciones del usuario ---
    const [selectedSourceType, setSelectedSourceType] = useState(null);
    const [selectedDestinationType, setSelectedDestinationType] = useState(null);
    const [selectedSourceId, setSelectedSourceId] = useState('');
    const [selectedDestinationId, setSelectedDestinationId] = useState('');
    const [contribution, setContribution] = useState('');

    // Carga los tipos de instrumentos que se pueden alinear al montar el componente
    useEffect(() => {
        const fetchAlignableTypes = async () => {
            try {
                const types = await api.get('/strategic-planning/list-alignable-types/');
                setAlignableTypes(types);
            } catch (err) {
                setError('No se pudieron cargar los tipos de instrumentos.');
                console.error(err);
            }
        };
        fetchAlignableTypes();
    }, []);

    const fetchObjectsForSelection = useCallback(async () => {
        if (step === 2 && selectedSourceType && selectedDestinationType) {
            setLoading(true);
            try {
                const sourceEndpoint = modelEndpoints[selectedSourceType.model];
                const destEndpoint = modelEndpoints[selectedDestinationType.model];

                if (!sourceEndpoint || !destEndpoint) {
                    throw new Error("Configuración de endpoints incompleta.");
                }

                const [sourceData, destData] = await Promise.all([
                    api.get(sourceEndpoint),
                    api.get(destEndpoint)
                ]);

                setSourceObjects(sourceData);
                setDestinationObjects(destData);

            } catch (err) {
                setError('Error al cargar los objetivos para la selección.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    }, [step, selectedSourceType, selectedDestinationType]);

    useEffect(() => {
        fetchObjectsForSelection();
    }, [fetchObjectsForSelection]);

    const handleNextStep = () => {
        if (selectedSourceType && selectedDestinationType) {
            setStep(2);
            setError('');
        } else {
            setError('Debe seleccionar ambos tipos de instrumento.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSourceId || !selectedDestinationId) {
            setError('Debe seleccionar un instrumento de origen y uno de destino.');
            return;
        }
        setLoading(true);
        setError('');

        const payload = {
            instrumento_origen_tipo: selectedSourceType.id,
            instrumento_origen_id: parseInt(selectedSourceId),
            instrumento_destino_tipo: selectedDestinationType.id,
            instrumento_destino_id: parseInt(selectedDestinationId),
            contribucion_porcentaje: contribution ? parseFloat(contribution) : null,
        };

        try {
            await api.post('/strategic-planning/alineaciones/', payload);
            onSave(); // Refresca la tabla en el componente padre
            onClose(); // Cierra el modal
        } catch (err) {
            setError(err.message || 'Ocurrió un error al guardar la alineación.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (setter, value, sourceList) => {
        const selectedObject = sourceList.find(item => item.id.toString() === value);
        setter(selectedObject);
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Nueva Alineación Estratégica</h2>

                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Seleccione el tipo de instrumento que desea alinear.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Instrumento Origen</label>
                            <select
                                onChange={(e) => handleSelectChange(setSelectedSourceType, e.target.value, alignableTypes)}
                                className="mt-1 block w-full p-2 border rounded-md">
                                <option value="">Seleccione...</option>
                                {alignableTypes.filter(t =>
                                    t.model === 'objetivoestrategicoinstitucional' || t.model === 'plansectorial'
                                ).map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Instrumento Destino</label>
                            <select
                                onChange={(e) => handleSelectChange(setSelectedDestinationType, e.target.value, alignableTypes)}
                                className="mt-1 block w-full p-2 border rounded-md">
                                <option value="">Seleccione...</option>
                                {alignableTypes.filter(t => t.model !== 'objetivoestrategicoinstitucional').map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end pt-4 space-x-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={handleNextStep}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md">Siguiente
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {loading && <p>Cargando opciones...</p>}
                        {!loading && (
                            <>
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700">Desde: {selectedSourceType?.name}</label>
                                    <select value={selectedSourceId}
                                            onChange={(e) => setSelectedSourceId(e.target.value)}
                                            className="mt-1 block w-full p-2 border rounded-md">
                                        <option value="">Seleccione...</option>
                                        {sourceObjects.map(obj => <option key={obj.oei_id || obj.id}
                                                                          value={obj.oei_id || obj.id}>{obj.codigo} - {obj.descripcion}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-sm font-medium text-gray-700">Hacia: {selectedDestinationType?.name}</label>
                                    <select value={selectedDestinationId}
                                            onChange={(e) => setSelectedDestinationId(e.target.value)}
                                            className="mt-1 block w-full p-2 border rounded-md">
                                        <option value="">Seleccione...</option>
                                        {destinationObjects.map(obj => <option
                                            key={obj.objetivo_pnd_id || obj.meta_ods_id || obj.id}
                                            value={obj.objetivo_pnd_id || obj.meta_ods_id || obj.id}>{obj.codigo} - {obj.descripcion}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Porcentaje de
                                        Contribución (%)</label>
                                    <input type="number" step="0.01" min="0" max="100" value={contribution}
                                           onChange={(e) => setContribution(e.target.value)}
                                           className="mt-1 block w-full p-2 border rounded-md" placeholder="Ej: 75.50"/>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between items-center pt-4">
                            <button type="button" onClick={() => setStep(1)}
                                    className="px-4 py-2 bg-gray-200 rounded-md">Atrás
                            </button>
                            <div className="space-x-3">
                                <button type="button" onClick={onClose}
                                        className="px-4 py-2 bg-gray-200 rounded-md">Cancelar
                                </button>
                                <button type="submit" disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">Guardar
                                    Alineación
                                </button>
                            </div>
                        </div>
                    </form>
                )}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </div>
    );
}