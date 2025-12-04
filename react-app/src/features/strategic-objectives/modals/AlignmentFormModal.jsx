import React, {useEffect, useState} from 'react';
import {api} from '../../../shared/api/api.js';

export default function AlignmentFormModal({onClose, onSave, initialData, isEdit}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Listas de selección
    const [oeiList, setOeiList] = useState([]);
    const [sectorialList, setSectorialList] = useState([]);
    const [pndObjectives, setPndObjectives] = useState([]);
    const [odsList, setOdsList] = useState([]);

    // Selecciones del usuario
    const [selectedOriginType, setSelectedOriginType] = useState('');
    const [selectedOriginId, setSelectedOriginId] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [selectedOds, setSelectedOds] = useState([]);
    const [contribution, setContribution] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [oeis, sectorials, pnds, ods] = await Promise.all([
                    api.get('/strategic-planning/oei/'),
                    api.get('/strategic-planning/objetivos-sectoriales/'),
                    api.get('/strategic-planning/pnd-objetivos/'),
                    api.get('/strategic-planning/ods/')
                ]);
                setOeiList(oeis);
                setSectorialList(sectorials);
                setPndObjectives(pnds);
                setOdsList(ods);
            } catch {
                setError('Error al cargar datos para el formulario.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Precargar datos en edición
    useEffect(() => {
        if (isEdit && initialData) {
            if (initialData.instrumento_origen?.type === 'objetivoestrategicoinstitucional') {
                setSelectedOriginType('oei');
            } else if (initialData.instrumento_origen?.type === 'objetivosectorial') {
                setSelectedOriginType('sectorial');
            }
            setSelectedOriginId(initialData.instrumento_origen?.id?.toString() || '');
            setSelectedDestId(initialData.instrumento_destino?.id?.toString() || '');
            setContribution(initialData.contribucion_porcentaje?.toString() || '');
            setSelectedOds(initialData.ods_vinculados?.map(o => o.ods_id?.toString()) || []);
        }
    }, [isEdit, initialData]);

    // Manejo de selección múltiple de ODS
    const handleOdsChange = (e) => {
        const options = Array.from(e.target.selectedOptions, opt => opt.value);
        setSelectedOds(options);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOriginType || !selectedOriginId || !selectedDestId) {
            setError('Debe seleccionar todos los campos obligatorios.');
            return;
        }
        setLoading(true);
        setError('');

        const types = await api.get('/strategic-planning/list-alignable-types/');
        console.log('Tipos disponibles:', types); // Verifica la estructura aquí

        let originTypeId = null;
        if (selectedOriginType === 'oei') {
            originTypeId = types.find(t => t.model === 'objetivoestrategicoinstitucional')?.id;
        } else if (selectedOriginType === 'sectorial') {
            originTypeId = types.find(t => t.model === 'objetivosectorial')?.id;
        }
        const destTypeId = types.find(t => t.model === 'objetivopnd')?.id;

        if (!originTypeId) {
            setError('Debe seleccionar el tipo de instrumento origen.');
            setLoading(false);
            return;
        }

        const payload = {
            instrumento_origen_tipo: originTypeId,
            instrumento_origen_id: parseInt(selectedOriginId),
            instrumento_destino_tipo: destTypeId,
            instrumento_destino_id: parseInt(selectedDestId),
            contribucion_porcentaje: contribution ? parseFloat(contribution) : null,
            ods_vinculados: selectedOds.map(id => parseInt(id)), // IDs de ODS seleccionados
        };

        try {
            if (isEdit) {
                await api.put(`/strategic-planning/alineaciones/${initialData.alineacion_id}/`, payload);
            } else {
                await api.post('/strategic-planning/alineaciones/', payload);
            }
            onSave();
            onClose();
        } catch (err) {
            setError(err.message || 'Ocurrió un error al guardar la alineación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">{isEdit ? 'Editar Alineación Estratégica' : 'Nueva Alineación Estratégica'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {loading && <p>Cargando opciones...</p>}
                    {!loading && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Instrumento Origen <span
                                    className="text-red-500">*</span></label>
                                <select
                                    value={selectedOriginType}
                                    onChange={e => {
                                        setSelectedOriginType(e.target.value);
                                        setSelectedOriginId('');
                                    }}
                                    required
                                    className={`mt-1 block w-full p-2 border rounded-md ${!selectedOriginType && error ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Seleccione tipo...</option>
                                    <option value="oei">Objetivo Estratégico Institucional</option>
                                    <option value="sectorial">Objetivo Sectorial</option>
                                </select>
                                {!selectedOriginType && error && (
                                    <p className="text-red-500 text-xs mt-1">{error}</p>
                                )}
                            </div>
                            {selectedOriginType && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {selectedOriginType === 'oei' ? 'Seleccionar OEI' : 'Seleccionar Objetivo Sectorial'}
                                    </label>
                                    <select
                                        value={selectedOriginId}
                                        onChange={e => setSelectedOriginId(e.target.value)}
                                        className="mt-1 block w-full p-2 border rounded-md"
                                    >
                                        <option value="">Seleccione...</option>
                                        {(selectedOriginType === 'oei' ? oeiList : sectorialList).map(obj => (
                                            <option key={obj.oei_id || obj.objetivo_sectorial_id}
                                                    value={obj.oei_id || obj.objetivo_sectorial_id}>
                                                {obj.codigo} - {obj.descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Instrumento Destino (Objetivo
                                    PND)</label>
                                <select
                                    value={selectedDestId}
                                    onChange={e => setSelectedDestId(e.target.value)}
                                    className="mt-1 block w-full p-2 border rounded-md"
                                >
                                    <option value="">Seleccione...</option>
                                    {pndObjectives.map(obj => (
                                        <option key={obj.objetivo_pnd_id} value={obj.objetivo_pnd_id}>
                                            {obj.codigo} - {obj.descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vinculación a Metas Globales
                                    (ODS)</label>
                                <select
                                    multiple
                                    value={selectedOds}
                                    onChange={handleOdsChange}
                                    className="mt-1 block w-full p-2 border rounded-md h-32"
                                >
                                    {odsList.map(ods => (
                                        <option key={ods.ods_id} value={ods.ods_id}>
                                            ODS {ods.numero}: {ods.nombre}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Puede seleccionar varios ODS (Ctrl+Click).</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Porcentaje de Contribución
                                    (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={contribution}
                                    onChange={e => setContribution(e.target.value)}
                                    className="mt-1 block w-full p-2 border rounded-md"
                                    placeholder="Ej: 75.50"
                                />
                            </div>
                        </>
                    )}
                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">
                            Guardar Alineación
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            </div>
        </div>
    );
}