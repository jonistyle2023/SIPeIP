import React, {useState, useEffect} from 'react';
import {
    Building, SlidersHorizontal, Book, Plus, Edit, Trash2,
    Database, CheckCircle, CalendarDays, Network
} from 'lucide-react';
import EntityFormModal from './modals/EntityFormModal.jsx';
import CatalogManager from './CatalogManager.jsx';
import {PeriodsManager} from './PeriodsManager.jsx';
import UnitManager from './UnitManager.jsx';

// --- Sub-componentes para la UI ---
const InfoCard = ({icon: Icon, title, subtitle, items}) => (<div className="bg-white p-6 rounded-lg shadow-sm h-full">
    <div className="flex items-center mb-4">
        <div className="p-3 bg-blue-100 rounded-full mr-4"><Icon className="text-blue-600" size={24}/></div>
        <div><h4 className="font-bold text-lg text-gray-800">{title}</h4><p
            className="text-xs text-gray-500">{subtitle}</p></div>
    </div>
    <ul className="space-y-2 text-sm text-gray-700">{items.map(item => <li key={item} className="flex items-center">
        <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0"/>{item}</li>)}</ul>
</div>);
const WorkflowStep = ({number, title, description, color}) => (
    <div className="flex flex-col items-center text-center w-40">
        <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-md ${color}`}> {number}</div>
        <h5 className="font-semibold text-gray-800">{title}</h5><p
        className="text-xs text-gray-500 mt-1">{description}</p></div>);

// Tabla para mostrar las entidades
const EntityTable = ({onEdit, refreshKey}) => {
    const [entities, setEntities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    // ...dentro de EntityTable...

    const handleDelete = async (entityId) => {
        if (!window.confirm('¿Está seguro de eliminar la entidad? Esta acción no se puede deshacer.')) return;
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/config/entidades/${entityId}/`, {
                method: 'DELETE',
                headers: {'Authorization': `Token ${token}`}
            });
            if (!response.ok) {
                // Manejo explícito en lugar de lanzar excepción
                alert("No se pudo eliminar la entidad.");
                console.error("Failed to delete entity", response);
                return;
            }
            setEntities(prev => prev.filter(e => e.id !== entityId));
        } catch (error) {
            alert("Error al eliminar la entidad.");
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchEntities = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/config/entidades/', {headers: {'Authorization': `Token ${token}`}});
                if (!response.ok) {
                    console.error("Failed to fetch entities", response);
                    setEntities([]);
                    return;
                }
                const data = await response.json();
                setEntities(data);
            } catch (error) {
                console.error("Error fetching entities:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntities();
    }, [refreshKey]);

    if (loading) return <p className="text-center p-4">Cargando entidades...</p>;

    // Filtramos las entidades basándonos en el término de búsqueda
    const filteredEntities = entities.filter(entity =>
        entity.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.codigo_unico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.nivel_gobierno_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.subsector_nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <input type="text" placeholder="Buscar por nombre, código, nivel..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 mb-4 border rounded-md" />
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                    <th className="p-3">Nombre de la Entidad</th>
                    <th className="p-3">Código Único</th>
                    <th className="p-3">Nivel de Gobierno</th>
                    <th className="p-3">Subsector</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {filteredEntities.map(entity => (
                    <tr key={entity.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{entity.nombre}</td>
                        <td className="p-3">{entity.codigo_unico}</td>
                        <td className="p-3">{entity.nivel_gobierno_nombre}</td>
                        <td className="p-3">{entity.subsector_nombre || '-'}</td>
                        <td className="p-3"><span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${entity.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{entity.activo ? 'Activo' : 'Inactivo'}</span>
                        </td>
                        <td className="p-3 flex items-center space-x-2">
                            <button onClick={() => onEdit(entity)} className="p-1 text-blue-500 hover:text-blue-700">
                                <Edit size={16}/></button>
                            <button
                                onClick={() => handleDelete(entity.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

// Componente interno para la gestión de entidades
const EntityManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleOpenModal = (entity = null) => {
        setEditingEntity(entity);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEntity(null);
    };
    const handleSave = () => {
        handleCloseModal();
        setRefreshKey(oldKey => oldKey + 1);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal()}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <Plus size={16} className="mr-2"/>Nueva Entidad
                </button>
            </div>
            <EntityTable key={refreshKey} onEdit={handleOpenModal}/>
            {isModalOpen && <EntityFormModal entity={editingEntity} onClose={handleCloseModal} onSave={handleSave}/>}
        </div>
    );
};


// --- Componente Principal ---

export default function InstitutionalContent() {
    const [activeFunctionalTab, setActiveFunctionalTab] = useState('entidades');

    return (
        <div className="space-y-8">
            {/* --- SECCIÓN 1: Flujo de Trabajo Principal --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-8 text-gray-800 text-center">Flujo de Trabajo Principal</h3>
                <div
                    className="flex flex-col md:flex-row justify-around items-center space-y-8 md:space-y-0 md:space-x-4">
                    <WorkflowStep number="1" title="Configuración Inicial"
                                  description="Establecimiento de entidades y catálogos base." color="bg-blue-500"/>
                    <WorkflowStep number="2" title="Planificación"
                                  description="Definición de objetivos, metas y alineación (PND/ODS)." color="bg-green-500"/>
                    <WorkflowStep number="3" title="Inversión"
                                  description="Priorizar proyectos y vincularlos al presupuesto (PAI)." color="bg-purple-500"/>
                    <WorkflowStep number="4" title="Seguimiento"
                                  description="Monitorear el avance físico y financiero en tiempo real." color="bg-orange-500"/>
                    <WorkflowStep number="5" title="Evaluación/Auditoría"
                                  description="Medir el impacto y garantizar la transparencia y trazabilidad." color="bg-red-500"/>
                </div>
            </div>

            {/* --- SECCIÓN 2: Gestión Funcional --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                <div className="flex items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Gestión Funcional</h2>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                    <button onClick={() => setActiveFunctionalTab('entidades')}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeFunctionalTab === 'entidades' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <Building size={16} className="mr-2"/>Gestión de Entidades
                    </button>
                    <button onClick={() => setActiveFunctionalTab('unidades')}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeFunctionalTab === 'unidades' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <Network size={16} className="mr-2"/>Unidades Organizacionales
                    </button>
                    <button onClick={() => setActiveFunctionalTab('catalogos')}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeFunctionalTab === 'catalogos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <SlidersHorizontal size={16} className="mr-2"/>Catálogos
                    </button>
                    <button onClick={() => setActiveFunctionalTab('periodos')}
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeFunctionalTab === 'periodos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        <CalendarDays size={16} className="mr-2"/>Períodos
                    </button>
                </div>

                <div>
                    {activeFunctionalTab === 'entidades' && <EntityManagement/>}
                    {activeFunctionalTab === 'unidades' && <UnitManager/>}
                    {activeFunctionalTab === 'catalogos' && <CatalogManager/>}
                    {activeFunctionalTab === 'periodos' && <PeriodsManager/>}
                </div>
            </div>

            {/* --- SECCIÓN 3: Secciones Informativas (agrupadas al final) --- */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard icon={Building} title="Gestión de Entidades"
                              subtitle="Administración de entidades del Estado"
                              items={["Entidades vinculadas al PGE", "Códigos únicos de creación", "Atributos clave (Nombre, Código único, el Nivel de Gobierno y su estado)", "Validación de Entidades Adscritas", "Único usuario con rol administrador por cada entidad"]}/>
                    <InfoCard icon={SlidersHorizontal} title="Unidades Organizacionales"
                              subtitle="Modelo jerárquico con estructura en árbol (recursividad)"
                              items={["Definición de unidad organizacional (MacroSector y Sector)", "Atributos de la Unidad", "Validación de la jerarquía organizativa", "Se asignan roles y permisos específicos a los usuarios según la jerarquía organizativa"]}/>
                    <InfoCard icon={Database} title="Catálogos del Sistema (Códigos)"
                              subtitle="Disponibles para el registro de catálogos escenciales para el ciclo de planificación"
                              items={["NIVEL_GOBIERNO", "MACROSECTOR", "TIPOS_PLAN", "TIPO_PROYECTO", "TIPOLOGIA_PROYECTO"]}/>
                    <InfoCard icon={Book} title="Periodos de Planificación"
                              subtitle="Necesarios para la planificación, la inversión y el seguimiento"
                              items={["Abrir y cerrar periodos", "Incluye: nombre del período, fecha de inicio, fecha de fin, el estado", "Permite gestionar los periodos de los planes", "Permite definir los acceso par auna, varias o todas las entidades registradas"]}/>
                </div>
            </div>
        </div>
    );
}