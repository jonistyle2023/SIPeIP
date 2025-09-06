import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import {handleFormChange, handleFormSubmit} from '../../shared/utils/formUtils';
import {api} from '../../shared/api/api';

export default function EntityFormModal({entity, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        codigo_unico: '',
        nivel_gobierno: '',
        subsector: '',
        activo: true,
    });
    const [nivelesGobierno, setNivelesGobierno] = useState([]);
    const [subsectores, setSubsectores] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const dataNiveles = await api.get('/config/catalogos/?codigo=NIVEL_GOBIERNO');
                if (dataNiveles.length > 0) setNivelesGobierno(dataNiveles[0].items);

                const dataMacro = await api.get('/config/catalogos/?codigo=MACROSECTOR');
                if (dataMacro.length > 0) {
                    const itemsRaiz = dataMacro[0].items || [];
                    const todosLosSubsectores = itemsRaiz.flatMap(macrosector => macrosector.hijos || []);
                    setSubsectores(todosLosSubsectores);
                }
            } catch (err) {
                console.error("Error al cargar catálogos:", err);
            }
        };

        fetchCatalogs();

        if (entity) {
            setFormData({
                nombre: entity.nombre,
                codigo_unico: entity.codigo_unico,
                nivel_gobierno: entity.nivel_gobierno || '',
                subsector: entity.subsector || '',
                activo: entity.activo,
            });
        }
    }, [entity]);

    const handleChange = (e) => handleFormChange(e, setFormData);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const payload = {
            ...formData,
            subsector: formData.subsector || null
        };

        const url = entity
            ? `http://127.0.0.1:8000/api/v1/config/entidades/${entity.id}/`
            : 'http://127.0.0.1:8000/api/v1/config/entidades/';
        const method = entity ? 'PUT' : 'POST';

        await handleFormSubmit({url, method, formData: payload, token, onSave, setError});
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{entity ? 'Editar Entidad' : 'Nueva Entidad'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input type="text" name="nombre" placeholder="Nombre de la Entidad" value={formData.nombre}
                               onChange={handleChange} className="w-full p-2 border rounded" required/>
                        <input type="text" name="codigo_unico" placeholder="Código Único" value={formData.codigo_unico}
                               onChange={handleChange} className="w-full p-2 border rounded" required/>
                        <select name="nivel_gobierno" value={formData.nivel_gobierno} onChange={handleChange}
                                className="w-full p-2 border rounded" required>
                            <option value="">Seleccione Nivel de Gobierno</option>
                            {nivelesGobierno.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}
                        </select>
                        <select name="subsector" value={formData.subsector} onChange={handleChange}
                                className="w-full p-2 border rounded">
                            <option value="">Seleccione Subsector (Opcional)</option>
                            {subsectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange}/>
                            <span>Activo</span>
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