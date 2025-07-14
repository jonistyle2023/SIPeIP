import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';

export default function EntityFormModal({entity, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        codigo_unico: '',
        nivel_gobierno: '',
        sector: '',
        activo: true,
    });
    const [nivelesGobierno, setNivelesGobierno] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCatalogs = async () => {
            const token = localStorage.getItem('authToken');
            // Fetch Niveles de Gobierno
            const resNiveles = await fetch('http://127.0.0.1:8000/api/v1/config/catalogos/?codigo=NIVEL_GOBIERNO', {headers: {'Authorization': `Token ${token}`}});
            const dataNiveles = await resNiveles.json();
            if (dataNiveles.length > 0) setNivelesGobierno(dataNiveles[0].items);

            // Fetch Sectores
            const resSectores = await fetch('http://127.0.0.1:8000/api/v1/config/catalogos/?codigo=SECTORES', {headers: {'Authorization': `Token ${token}`}});
            const dataSectores = await resSectores.json();
            if (dataSectores.length > 0) setSectores(dataSectores[0].items);
        };
        fetchCatalogs();

        if (entity) {
            setFormData({
                nombre: entity.nombre,
                codigo_unico: entity.codigo_unico,
                nivel_gobierno: entity.nivel_gobierno,
                sector: entity.sector || '',
                activo: entity.activo,
            });
        }
    }, [entity]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const url = entity ? `http://127.0.0.1:8000/api/v1/config/entidades/${entity.id}/` : 'http://127.0.0.1:8000/api/v1/config/entidades/';
        const method = entity ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json', 'Authorization': `Token ${token}`},
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(JSON.stringify(data));
            onSave();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center"><h3
                    className="text-lg font-semibold">{entity ? 'Editar Entidad' : 'Nueva Entidad'}</h3>
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
                            {nivelesGobierno.map(n => <option key={n.id} value={n.id}>{n.nombre}</option>)}</select>
                        <select name="sector" value={formData.sector} onChange={handleChange}
                                className="w-full p-2 border rounded">
                            <option value="">Seleccione Sector (Opcional)</option>
                            {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
                        <label className="flex items-center space-x-2"><input type="checkbox" name="activo"
                                                                              checked={formData.activo}
                                                                              onChange={handleChange}/><span>Activo</span></label>
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