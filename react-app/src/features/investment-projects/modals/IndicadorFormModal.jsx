import React, {useEffect, useState} from 'react';
import {api} from '../../../shared/api/api.js';
import {X} from 'lucide-react';

export default function IndicadorFormModal({parent, onClose, onSave, indicador}) {
    const [formData, setFormData] = useState({
        descripcion: '',
        formula: '',
        unidad_medida: '',
        meta: {
            linea_base: '',
            valor_meta: '',
            periodo_anualizado: new Date().getFullYear(),
        }
    });
    const [tipoIndicador, setTipoIndicador] = useState(parent?.name || '');
    const [error, setError] = useState('');
    const [odsList, setOdsList] = useState([]);
    const [selectedOdsId, setSelectedOdsId] = useState(parent?.odsId || null);
    const [metasList, setMetasList] = useState([]); // cada meta con su id y título
    const [indicadoresPorMeta, setIndicadoresPorMeta] = useState({}); // { metaId: [indicadores] }
    const [selectedOdsIndicatorIds, setSelectedOdsIndicatorIds] = useState(new Set());
    const [loadingOdsData, setLoadingOdsData] = useState(false);

    useEffect(() => {
        if (indicador) {
            let tipo = parent?.name || '';
            if (indicador.descripcion.toLowerCase().startsWith('fin:')) {
                tipo = 'Fin';
            } else if (indicador.descripcion.toLowerCase().startsWith('propósito:')) {
                tipo = 'Proposito';
            }
            setTipoIndicador(tipo);
            setFormData({
                descripcion: indicador.descripcion.replace(/^Fin: |^Propósito: /i, ''),
                formula: indicador.formula || '',
                unidad_medida: indicador.unidad_medida || '',
                meta: {
                    linea_base: indicador.meta.linea_base,
                    valor_meta: indicador.meta.valor_meta,
                    periodo_anualizado: indicador.meta.periodo_anualizado,
                }
            });
        } else {
            setTipoIndicador(parent?.name || '');
            setFormData({
                descripcion: '',
                formula: '',
                unidad_medida: '',
                meta: {
                    linea_base: '',
                    valor_meta: '',
                    periodo_anualizado: new Date().getFullYear(),
                }
            });
            setSelectedOdsIndicatorIds(new Set());
        }
    }, [indicador, parent]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleMetaChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            meta: {...prev.meta, [name]: value}
        }));
    };

    const resolveId = (obj, ...possibleKeys) => {
        if (!obj) return undefined;
        for (const k of possibleKeys) {
            const val = obj[k];
            if (val !== undefined && val !== null) {
                if (typeof val === 'object') {
                    const nestedId = val.id ?? val.pk;
                    if (nestedId !== undefined) {
                        return nestedId;
                    }
                } else {
                    return val;
                }
            }
        }
        if (obj.ods && (obj.ods.id || obj.ods.pk)) return obj.ods.id || obj.ods.pk;
        if (obj.meta && (obj.meta.id || obj.meta.pk)) return obj.meta.id || obj.meta.pk;
        return undefined;
    };

    useEffect(() => {
        let mounted = true;
        const fetchOds = async () => {
            try {
                const data = await api.get('/strategic-planning/ods/');
                if (!mounted) return;
                const list = Array.isArray(data) ? data : (data.results || []);
                // Solo almacenar la lista; NO seleccionar automáticamente el primer ODS
                setOdsList(list);
            } catch (e) {
                console.error('No se pudieron cargar ODS', e);
            }
        };
        fetchOds();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!selectedOdsId || tipoIndicador !== 'Fin') return;
        let mounted = true;
        const fetchMetasYIndicadores = async () => {
            setLoadingOdsData(true);
            setMetasList([]);
            setIndicadoresPorMeta({});
            try {
                const metasResp = await api.get(`/strategic-planning/ods-metas/`);
                const metasAll = Array.isArray(metasResp) ? metasResp : (metasResp.results || []);
                if (!mounted) return;

                const metas = metasAll.filter(m => {
                    const mOdsId = resolveId(m, 'ods_id', 'ods', 'ods_meta_id', 'odsId', 'ods_id');
                    // algunos endpoints devuelven m.ods = { id: ... }
                    if (mOdsId !== undefined) return String(mOdsId) === String(selectedOdsId);
                    // fallback por campos directos
                    if (m.ods === selectedOdsId || m.ods === Number(selectedOdsId)) return true;
                    if (m.ods_id === selectedOdsId || m.ods_id === Number(selectedOdsId)) return true;
                    return false;
                });

                let metasFinal = metas;
                if (metasFinal.length === 0) {
                    try {
                        const respFiltered = await api.get(`/strategic-planning/ods-metas/?ods_id=${selectedOdsId}`);
                        metasFinal = Array.isArray(respFiltered) ? respFiltered : (respFiltered.results || []);
                    } catch (_) {
                    }
                }

                if (!mounted) return;
                setMetasList(metasFinal);

                const indicadoresMap = {};
                for (const [metaIndex, m] of metasFinal.entries()) {
                    const metaId = resolveId(m, 'id', 'pk', 'meta_id', 'ods_meta_id', 'meta_ods_id') ?? `meta_fallback_${metaIndex}`;
                    
                    if (Array.isArray(m.indicadores) && m.indicadores.length > 0) {
                         indicadoresMap[String(metaId)] = m.indicadores;
                         continue; 
                    }

                    try {
                        const indResp = await api.get(`/strategic-planning/ods-indicadores/?meta_id=${metaId}`);
                        const indsAll = Array.isArray(indResp) ? indResp : (indResp.results || []);
                        const indsFiltered = indsAll.filter(ind => {
                            const indMetaId = resolveId(ind, 'meta_id', 'meta', 'ods_meta_id', 'metaId', 'meta_ods_id');
                            if (indMetaId !== undefined) return String(indMetaId) === String(metaId);
                            if (ind.meta && (ind.meta.id || ind.meta.pk)) return String(ind.meta.id || ind.meta.pk) === String(metaId);
                            return false;
                        });
                        let finalInds = indsFiltered;
                        if (finalInds.length === 0 && Array.isArray(indsAll) && indsAll.length > 0) {
                            finalInds = indsAll.filter(ind => {
                                const indMetaId = resolveId(ind, 'meta_id', 'meta', 'ods_meta_id', 'metaId', 'meta_ods_id');
                                return indMetaId !== undefined && String(indMetaId) === String(metaId);
                            });
                        }
                        indicadoresMap[String(metaId)] = finalInds;
                    } catch (e) {
                        console.error(`No se pudieron cargar indicadores para meta ${metaId}`, e);
                        indicadoresMap[String(metaId)] = [];
                    }
                }

                if (!mounted) return;
                setIndicadoresPorMeta(indicadoresMap);
            } catch (e) {
                console.error('Error cargando metas/indicadores ODS', e);
            } finally {
                if (mounted) setLoadingOdsData(false);
            }
        };
        fetchMetasYIndicadores();
        return () => { mounted = false; };
    }, [selectedOdsId, tipoIndicador]);

    const toggleIndicatorSelection = (indicatorId) => {
        setSelectedOdsIndicatorIds(prev => {
            const copy = new Set([...prev].map(String));
            if (copy.has(String(indicatorId))) copy.delete(String(indicatorId));
            else copy.add(String(indicatorId));
            return copy;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (tipoIndicador === 'Fin') {
            // Validaciones
            if (loadingOdsData) {
                setError('Aún se están cargando las metas/indicadores del ODS. Espere por favor.');
                return;
            }
            if (!selectedOdsId) {
                setError('Seleccione el ODS correspondiente.');
                return;
            }
            if (selectedOdsIndicatorIds.size === 0) {
                setError('Seleccione al menos un indicador del ODS para registrar.');
                return;
            }
            
            if (!parent.contentTypeId) {
                setError('Error de configuración: No se ha cargado el ID del tipo de contenido. Por favor recargue la página.');
                return;
            }

            try {
                const promises = [];
                const indicadorIdToMeta = {};
                for (const [metaId, inds] of Object.entries(indicadoresPorMeta)) {
                    for (const ind of inds) {
                        const id = resolveId(ind, 'id', 'pk', 'indicador_id', 'ods_indicador_id', 'indicador_ods_id');
                        indicadorIdToMeta[String(id)] = {
                            meta: {
                                linea_base: ind.linea_base ?? ind.lineaBase ?? 0,
                                valor_meta: ind.valor_meta ?? ind.valorMeta ?? ind.target ?? 0,
                                periodo_anualizado: ind.periodo ?? ind.periodo_anualizado ?? new Date().getFullYear(),
                            },
                            descripcion: ind.nombre || ind.title || ind.descripcion || ind.label || '',
                            unidad_medida: ind.unidad || ind.unidad_medida || ind.unit || 'No especificada'
                        };
                    }
                }

                selectedOdsIndicatorIds.forEach(indId => {
                    const map = indicadorIdToMeta[String(indId)] || {};
                    const metaPayload = map.meta || {
                        linea_base: 0,
                        valor_meta: 0,
                        periodo_anualizado: new Date().getFullYear()
                    };
                    const payload = {
                        descripcion: map.descripcion || formData.descripcion || '',
                        formula: formData.formula || '',
                        unidad_medida: map.unidad_medida || formData.unidad_medida || 'No especificada',
                        content_type_id: parent.contentTypeId, // siempre el del parent
                        object_id: parent.objectId,
                        tipo_indicador: 'Fin',
                        meta: metaPayload
                    };
                    promises.push(api.post('/investment-projects/indicadores/', payload));
                });

                await Promise.all(promises);
                onSave();
            } catch (err) {
                console.error('Error creando indicadores Fin desde ODS', err);
                setError('Ocurrió un error al registrar los indicadores seleccionados.');
            }

            return;
        }

        try {
            const payload = {
                ...formData,
                content_type_id: parent.contentTypeId, // <-- SIEMPRE usa el del parent
                object_id: parent.objectId,
                tipo_indicador: tipoIndicador,
            };
            if (indicador) {
                await api.put(`/investment-projects/indicadores/${indicador.indicador_id}/`, payload);
            } else {
                await api.post('/investment-projects/indicadores/', payload);
            }
            onSave();
        } catch (err) {
            setError(err.message || 'Ocurrió un error al guardar el indicador.');
        }
    };

    // Render
    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-80 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold dark:text-white">
                        {indicador ? "Editar Indicador" : `Nuevo Indicador para ${parent.name}`}
                    </h3>
                    <button onClick={onClose} className="dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {tipoIndicador !== 'Fin' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción del Indicador</label>
                                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3"
                                              className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="formula" value={formData.formula} onChange={handleChange}
                                           placeholder="Fórmula (Opcional)" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                                    <input name="unidad_medida" value={formData.unidad_medida} onChange={handleChange}
                                           placeholder="Unidad de Medida" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                                </div>
                                <hr className="dark:border-slate-700"/>
                                <h4 className="text-md font-semibold dark:text-white">Meta del Indicador</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input name="linea_base" type="number" value={formData.meta.linea_base}
                                           onChange={handleMetaChange} placeholder="Línea Base"
                                           className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                                    <input name="valor_meta" type="number" value={formData.meta.valor_meta}
                                           onChange={handleMetaChange} placeholder="Valor de la Meta"
                                           className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                                    <input name="periodo_anualizado" type="number" value={formData.meta.periodo_anualizado}
                                           onChange={handleMetaChange} placeholder="Año de la Meta"
                                           className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required/>
                                </div>
                            </>
                        )}

                        {tipoIndicador === 'Fin' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Seleccionar ODS</label>
                                <div className="mt-2 flex items-center space-x-2">
                                    <select
                                        value={selectedOdsId ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedOdsId(val === '' ? null : (isNaN(val) ? val : Number(val)));
                                            setSelectedOdsIndicatorIds(new Set()); // limpiar selección al cambiar ODS
                                        }}
                                        className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="">-- Seleccione un ODS --</option>
                                        {odsList.map((o, idx) => {
                                            const id = resolveId(o, 'id', 'pk', 'ods_id') ?? `ods_fallback_${idx}`;
                                            const label = o.nombre || o.name || o.title || o.titulo || `ODS ${id}`;
                                            return <option key={`ods-${id}`} value={id}>{label}</option>;
                                        })}
                                    </select>
                                    {loadingOdsData && <span className="text-sm text-gray-500 dark:text-gray-400">Cargando metas/indicadores...</span>}
                                </div>

                                <div className="mt-4 space-y-4 max-h-64 overflow-auto border p-2 rounded dark:border-slate-600 dark:bg-slate-700/50">
                                    {metasList.length === 0 && !loadingOdsData && <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron metas para este ODS.</p>}
                                    {metasList.map((m, metaIdx) => {
                                        const metaIdRaw = resolveId(m, 'id', 'pk', 'meta_id', 'ods_meta_id', 'meta_ods_id');
                                        const metaId = metaIdRaw ?? `meta_fallback_${metaIdx}`;
                                        const metaKey = `meta-${metaId}`;
                                        const metaTitle = m.nombre || m.titulo || m.title || m.descripcion || `Meta ${metaId}`;
                                        const indicadores = indicadoresPorMeta[String(metaId)] || [];
                                        return (
                                            <div key={metaKey} className="border-b dark:border-slate-600 pb-2">
                                                <h5 className="font-semibold text-gray-800 dark:text-white">{metaTitle}</h5>
                                                {indicadores.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Sin indicadores para esta meta.</p>}
                                                <div className="mt-2 space-y-1">
                                                    {indicadores.map((ind, indIdx) => {
                                                        const indIdRaw = resolveId(ind, 'id', 'pk', 'indicador_id', 'ods_indicador_id', 'indicador_ods_id');
                                                        const indId = indIdRaw ?? `generated-${metaId}-${indIdx}`;
                                                        const indLabel = ind.nombre || ind.title || ind.descripcion || `Indicador ${indId}`;
                                                        return (
                                                            <label key={`ind-${indId}`} className="flex items-center space-x-2 text-sm dark:text-gray-300">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedOdsIndicatorIds.has(String(indId))}
                                                                    onChange={() => toggleIndicatorSelection(String(indId))}
                                                                    className="h-4 w-4"
                                                                />
                                                                <span>{indLabel}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Seleccione uno o más indicadores pertenecientes a las metas del ODS. El sistema registrará únicamente los indicadores seleccionados.
                                </p>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                            {tipoIndicador === 'Fin' ? 'Registrar indicadores seleccionados' : 'Guardar Indicador'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}