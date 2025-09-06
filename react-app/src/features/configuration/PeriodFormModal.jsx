import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import {handleFormChange, handleFormSubmit} from '../../shared/utils/formUtils';

export default function PeriodFormModal({period, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'ABIERTO',
        es_activo_para_carga: false,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (period) {
            setFormData({
                nombre: period.nombre,
                fecha_inicio: period.fecha_inicio,
                fecha_fin: period.fecha_fin,
                estado: period.estado,
                es_activo_para_carga: period.es_activo_para_carga,
            });
        }
    }, [period]);

    const handleChange = (e) => handleFormChange(e, setFormData);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const url = period ? `http://127.0.0.1:8000/api/v1/config/periodos/${period.id}/` : 'http://127.0.0.1:8000/api/v1/config/periodos/';
        const method = period ? 'PUT' : 'POST';

        await handleFormSubmit({url, method, formData, token, onSave, setError});
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{period ? 'Editar Período' : 'Nuevo Período'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input type="text" name="nombre" placeholder="Nombre del Período" value={formData.nombre}
                               onChange={handleChange} className="w-full p-2 border rounded" required/>
                        <div>
                            <label className="text-sm">Fecha de Inicio</label>
                            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange}
                                   className="w-full p-2 border rounded" required/>
                        </div>
                        <div>
                            <label className="text-sm">Fecha de Fin</label>
                            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange}
                                   className="w-full p-2 border rounded" required/>
                        </div>
                        <select name="estado" value={formData.estado} onChange={handleChange}
                                className="w-full p-2 border rounded">
                            <option value="ABIERTO">Abierto</option>
                            <option value="EN_CIERRE">En Cierre</option>
                            <option value="CERRADO">Cerrado</option>
                        </select>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="es_activo_para_carga" checked={formData.es_activo_para_carga}
                                   onChange={handleChange}/>
                            <span>Activo para carga de información</span>
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