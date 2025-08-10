import React, {useEffect, useState} from 'react';
import {api} from '../../shared/api/api.js';
import {X} from 'lucide-react';

export default function ProjectFormModal({project, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        entidad_ejecutora: '',
        tipo_proyecto: '',
        tipologia_proyecto: '',
        sector: '',
        estado: 'EN_FORMULACION',
    });
    const [catalogs, setCatalogs] = useState({tipos: [], tipologias: [], sectores: []});
    const [entities, setEntities] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                // --- CORRECCIÓN ---
                // Cada llamada a la API ahora pide explícitamente el 'codigo' del catálogo correcto.
                const [tiposData, tipologiasData, sectoresData, entitiesData] = await Promise.all([
                    api.get('/config/catalogos/?codigo=TIPO_PROYECTO'),      // Pide el catálogo de Tipos de Proyecto
                    api.get('/config/catalogos/?codigo=TIPOLOGIA_PROYECTO'), // Pide el catálogo de Tipologías
                    api.get('/config/catalogos/?codigo=SECTORES'),           // Pide el catálogo de Sectores
                    api.get('/config/entidades/')                            // Pide la lista de entidades
                ]);

                setCatalogs({
                    tipos: tiposData[0]?.items || [],
                    tipologias: tipologiasData[0]?.items || [],
                    sectores: sectoresData[0]?.items || [],
                });
                setEntities(entitiesData);

            } catch (err) {
                setError('No se pudieron cargar los datos necesarios para el formulario.');
                console.error(err);
            }
        };
        loadCatalogs();

        if (project) {
            setFormData({
                nombre: project.nombre,
                entidad_ejecutora: project.entidad_ejecutora,
                tipo_proyecto: project.tipo_proyecto,
                tipologia_proyecto: project.tipologia_proyecto,
                sector: project.sector,
                estado: project.estado,
            });
        }
    }, [project]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (project) {
                await api.put(`/investment-projects/proyectos/${project.proyecto_id}/`, formData);
            } else {
                await api.post('/investment-projects/proyectos/', formData);
            }
            onSave();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center"><h3
                    className="text-lg font-semibold">{project ? 'Editar Proyecto' : 'Nuevo Proyecto de Inversión'}</h3>
                    <button onClick={onClose}><X/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="nombre" value={formData.nombre} onChange={handleChange}
                               placeholder="Nombre del Proyecto" className="md:col-span-2 w-full p-2 border rounded"
                               required/>
                        <select name="entidad_ejecutora" value={formData.entidad_ejecutora} onChange={handleChange}
                                className="w-full p-2 border rounded" required>
                            <option value="">Entidad Ejecutora</option>
                            {entities.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select>
                        <select name="sector" value={formData.sector} onChange={handleChange}
                                className="w-full p-2 border rounded" required>
                            <option value="">Sector</option>
                            {catalogs.sectores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
                        <select name="tipo_proyecto" value={formData.tipo_proyecto} onChange={handleChange}
                                className="w-full p-2 border rounded" required>
                            <option value="">Tipo de Proyecto</option>
                            {catalogs.tipos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
                        <select name="tipologia_proyecto" value={formData.tipologia_proyecto} onChange={handleChange}
                                className="w-full p-2 border rounded" required>
                            <option value="">Tipología</option>
                            {catalogs.tipologias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Proyecto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}