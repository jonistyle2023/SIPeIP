import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../api/api';
import {Layers, Plus, Edit, Trash2, Link2} from 'lucide-react';

// Modal de Formulario Completo
const ProgramaFormModal = ({programa, onClose, onSave}) => {
    const [nombre, setNombre] = useState(programa?.nombre || '');
    const [entidad, setEntidad] = useState(programa?.entidad || '');
    const [oeiAlineados, setOeiAlineados] = useState(programa?.oei_alineados || []);
    const [entidadesList, setEntidadesList] = useState([]);
    const [oeiList, setOeiList] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDataForModal = async () => {
            try {
                const [entidadesData, oeiData] = await Promise.all([
                    api.get('/config/entidades/'),
                    api.get('/strategic-planning/oei/')
                ]);
                setEntidadesList(entidadesData);
                setOeiList(oeiData);
            } catch (err) {
                setError('Error al cargar datos para el formulario.');
            }
        };
        fetchDataForModal();
    }, []);

    const handleOeiChange = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setOeiAlineados(selectedIds);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            nombre,
            entidad: parseInt(entidad),
            oei_alineados_ids: oeiAlineados
        };
        try {
            if (programa) {
                await api.put(`/strategic-planning/programas/${programa.programa_id}/`, payload);
            } else {
                await api.post('/strategic-planning/programas/', payload);
            }
            onSave();
        } catch (err) {
            setError(err.message || 'Error al guardar');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">{programa ? 'Editar Programa' : 'Nuevo Programa Institucional'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Programa</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full p-2 border rounded mt-1"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Entidad Responsable</label>
                        <select
                            value={entidad}
                            onChange={(e) => setEntidad(e.target.value)}
                            className="w-full p-2 border rounded mt-1"
                            required
                        >
                            <option value="">-- Seleccione una entidad --</option>
                            {entidadesList.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">OEI Alineados</label>
                        <select
                            multiple
                            value={oeiAlineados}
                            onChange={handleOeiChange}
                            className="w-full p-2 border rounded mt-1 h-32"
                        >
                            {oeiList.map(oei => <option key={oei.oei_id}
                                                        value={oei.oei_id}>{oei.codigo} - {oei.descripcion}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Puedes seleccionar varios manteniendo presionada la
                            tecla Ctrl (o Cmd).</p>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div className="flex justify-end mt-4 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function ProgramasManager() {
    const [programas, setProgramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrograma, setEditingPrograma] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/strategic-planning/programas/');
            setProgramas(data);
        } catch (error) {
            console.error("Error fetching programas:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingPrograma(null);
        fetchData();
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este programa?')) {
            await api.delete(`/strategic-planning/programas/${id}/`);
            fetchData();
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            {isModalOpen && <ProgramaFormModal programa={editingPrograma} onClose={() => {
                setIsModalOpen(false);
                setEditingPrograma(null);
            }} onSave={handleSave}/>}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg flex items-center"><Layers className="mr-2 text-green-500"/>Programas
                    Institucionales</h3>
                <button onClick={() => {
                    setEditingPrograma(null);
                    setIsModalOpen(true);
                }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"><Plus size={16}
                                                                                                           className="mr-2"/>Nuevo
                    Programa
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="p-3">Nombre del Programa</th>
                        <th className="p-3">Entidad</th>
                        <th className="p-3">OEI Vinculados</th>
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {programas.map(p => (
                        <tr key={p.programa_id} className="border-b">
                            <td className="p-3 font-medium">{p.nombre}</td>
                            <td className="p-3 text-gray-600">{p.entidad_nombre}</td>
                            <td className="p-3 text-blue-600 font-semibold">
                                <Link2 size={14} className="inline mr-1"/>
                                {p.oei_alineados.map(oei => (
                                    <span key={oei.oei_id}>{oei.codigo} - {oei.descripcion}<br/></span>
                                ))}
                            </td>
                            <td className="p-3 text-right">
                                <button onClick={() => {
                                    setEditingPrograma(p);
                                    setIsModalOpen(true);
                                }} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(p.programa_id)}
                                        className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}