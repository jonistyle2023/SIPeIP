import React, {useEffect, useState} from 'react';
import {api} from '../../shared/api/api.js';
import {X} from 'lucide-react';

export default function IndicadorFormModal({parent, onClose, onSave, indicador}) {
    // Estado para el formulario
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
    // Estado para el tipo de indicador
    const [tipoIndicador, setTipoIndicador] = useState(parent?.name || '');
    const [error, setError] = useState('');

    // Sincroniza formData y tipoIndicador cuando cambia el indicador
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const payload = {
            ...formData,
            content_type_id: parent.contentTypeId, // <-- SIEMPRE usa el del parent
            object_id: parent.objectId,
            tipo_indicador: tipoIndicador,
        };
        try {
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

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                        {indicador ? "Editar Indicador" : `Nuevo Indicador para ${parent.name}`}
                    </h3>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción del Indicador</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3"
                                      className="w-full p-2 border rounded mt-1" required/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="formula" value={formData.formula} onChange={handleChange}
                                   placeholder="Fórmula (Opcional)" className="w-full p-2 border rounded"/>
                            <input name="unidad_medida" value={formData.unidad_medida} onChange={handleChange}
                                   placeholder="Unidad de Medida" className="w-full p-2 border rounded" required/>
                        </div>
                        <hr/>
                        <h4 className="text-md font-semibold">Meta del Indicador</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input name="linea_base" type="number" value={formData.meta.linea_base}
                                   onChange={handleMetaChange} placeholder="Línea Base"
                                   className="w-full p-2 border rounded" required/>
                            <input name="valor_meta" type="number" value={formData.meta.valor_meta}
                                   onChange={handleMetaChange} placeholder="Valor de la Meta"
                                   className="w-full p-2 border rounded" required/>
                            <input name="periodo_anualizado" type="number" value={formData.meta.periodo_anualizado}
                                   onChange={handleMetaChange} placeholder="Año de la Meta"
                                   className="w-full p-2 border rounded" required/>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Indicador
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}