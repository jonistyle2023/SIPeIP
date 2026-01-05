import React, {useEffect, useState} from 'react';
import {api} from '../../../shared/api/api.js';
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
    const [selectedMacrosector, setSelectedMacrosector] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                const [tiposData, tipologiasData, sectoresData, entitiesData] = await Promise.all([
                    api.get('/config/catalogos/?codigo=TIPO_PROYECTO'),
                    api.get('/config/catalogos/?codigo=TIPOLOGIA_PROYECTO'),
                    api.get('/config/catalogos/?codigo=MACROSECTOR'),
                    api.get('/config/entidades/')
                ]);

                const sectoresRoot = sectoresData[0]?.items || [];

                setCatalogs({
                    tipos: tiposData[0]?.items || [],
                    tipologias: tipologiasData[0]?.items || [],
                    sectores: sectoresRoot,
                });
                setEntities(entitiesData);

                // Si viene proyecto (editar), preseleccionar campos y macrosector basado en el sector
                if (project) {
                    const sectorId = project.sector;
                    let foundMacro = '';
                    for (const ms of sectoresRoot) {
                        if (ms.hijos && ms.hijos.some(h => h.id === sectorId)) {
                            foundMacro = ms.id;
                            break;
                        }
                    }
                    setSelectedMacrosector(foundMacro || '');
                    setFormData({
                        nombre: project.nombre || '',
                        entidad_ejecutora: project.entidad_ejecutora || '',
                        tipo_proyecto: project.tipo_proyecto || '',
                        tipologia_proyecto: project.tipologia_proyecto || '',
                        sector: project.sector || '',
                        estado: project.estado || 'EN_FORMULACION',
                    });
                }
            } catch (err) {
                setError('No se pudieron cargar los datos necesarios para el formulario.');
                console.error(err);
            }
        };
        loadCatalogs();
    }, [project]);

    useEffect(() => {
        // Persistir la selección de página u otras acciones si se requiere
    }, []);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleMacroChange = (e) => {
        const macroId = e.target.value;
        setSelectedMacrosector(macroId);
        // Limpiar selección de sector cuando cambia macrosector
        setFormData({...formData, sector: ''});
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
            setError(err.message || 'Error al guardar el proyecto.');
        }
    };

    // Obtener sectores disponibles según macrosector seleccionado
    const availableSectors = (() => {
        const ms = catalogs.sectores.find(s => String(s.id) === String(selectedMacrosector));
        return ms?.hijos || [];
    })();

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-80 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold dark:text-white">{project ? 'Editar Proyecto' : 'Nuevo Proyecto de Inversión'}</h3>
                    <button onClick={onClose} className="dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1"><X/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="nombre" value={formData.nombre} onChange={handleChange}
                               placeholder="Nombre del Proyecto" className="md:col-span-2 w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                               required/>
                        <select name="entidad_ejecutora" value={formData.entidad_ejecutora} onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required>
                            <option value="">Entidad Ejecutora</option>
                            {entities.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>

                        {/* Selector de Macrosector */}
                        <select name="macrosector" value={selectedMacrosector} onChange={handleMacroChange}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" >
                            <option value="">Macrosector (seleccione primero)</option>
                            {catalogs.sectores.map(ms => <option key={ms.id} value={ms.id}>{ms.nombre}</option>)}
                        </select>

                        {/* Selector de Sector filtrado por Macrosector */}
                        <select name="sector" value={formData.sector} onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required>
                            <option value="">{selectedMacrosector ? 'Sector' : 'Seleccione un Macrosector primero'}</option>
                            {availableSectors.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>

                        <select name="tipo_proyecto" value={formData.tipo_proyecto} onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required>
                            <option value="">Tipo de Proyecto</option>
                            {catalogs.tipos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                        <select name="tipologia_proyecto" value={formData.tipologia_proyecto} onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white" required>
                            <option value="">Tipología</option>
                            {catalogs.tipologias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar Proyecto</button>
                    </div>
                </form>
            </div>
        </div>
    );
}