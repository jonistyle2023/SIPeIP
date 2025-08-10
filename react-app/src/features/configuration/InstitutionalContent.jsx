import React, {useState, useEffect} from 'react';
import {
    Building, SlidersHorizontal, Book, Plus, Edit, Trash2, Check, Shield,
    Database, CheckCircle, CalendarDays, Network
} from 'lucide-react';
import EntityFormModal from './EntityFormModal.jsx';
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
            if (!response.ok) throw new Error("No se pudo eliminar la entidad");
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
                if (!response.ok) throw new Error("Failed to fetch entities");
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

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                    <th className="p-3">Nombre de la Entidad</th>
                    <th className="p-3">Código Único</th>
                    <th className="p-3">Nivel de Gobierno</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {entities.map(entity => (
                    <tr key={entity.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{entity.nombre}</td>
                        <td className="p-3">{entity.codigo_unico}</td>
                        <td className="p-3">{entity.nivel_gobierno_nombre}</td>
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
            {/* --- SECCIONES INFORMATIVAS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard icon={Building} title="Gestión de Entidades" subtitle="Administración de entidades del Estado"
                          items={['Entidades vinculadas al PGE', 'Unidades organizacionales', 'Códigos únicos de creación', 'Jerarquías institucionales']}/>
                <InfoCard icon={SlidersHorizontal} title="Parámetros del Sistema"
                          subtitle="Control de comportamiento global"
                          items={['Configuración general', 'Reglas de validación', 'Flujos de aprobación', 'Control de módulos']}/>
                <InfoCard icon={Book} title="Metodologías y Estructuras" subtitle="Planificación y alineación"
                          items={['Tipos de planes', 'Objetivos y metas', 'Indicadores', 'Estructuras jerárquicas']}/>
                <InfoCard icon={Database} title="Catálogos y Datos Maestros" subtitle="Consistencia de información"
                          items={['Tipos de intervención', 'Sectores y clasificaciones', 'Unidades de medida', 'ODS']}/>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-8 text-gray-800 text-center">Flujo de Trabajo Principal</h3>
                <div
                    className="flex flex-col md:flex-row justify-around items-center space-y-8 md:space-y-0 md:space-x-4">
                    <WorkflowStep number="1" title="Configuración Inicial"
                                  description="Establecimiento de entidades y catálogos base" color="bg-blue-500"/>
                    <WorkflowStep number="2" title="Reglas de Negocio"
                                  description="Definición de validaciones y metodologías" color="bg-green-500"/>
                    <WorkflowStep number="3" title="Jerarquías"
                                  description="Alineaciones entre instrumentos de planificación" color="bg-purple-500"/>
                    <WorkflowStep number="4" title="Períodos"
                                  description="Gestión de ciclos de planificación y seguimiento" color="bg-orange-500"/>
                    <WorkflowStep number="5" title="Delegación" description="Control de usuarios externos por entidad"
                                  color="bg-red-500"/>
                </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                <h3 className="font-bold text-red-800 mb-3 flex items-center"><Shield size={20} className="mr-3"/>Gestión
                    de Calidad de Datos</h3>
                <p className="text-sm text-red-900 mb-4">El siguiente paso crucial es analizar cómo se gestionará la
                    calidad de los datos ingresados, dado que la "información basura" y la "falta de rigurosidad" son
                    problemas identificados en el sistema actual.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div><h5 className="font-semibold text-gray-800">Reglas de Validación</h5>
                        <ul className="mt-2 space-y-1 list-disc list-inside text-gray-700">
                            <li>Validación en tiempo real</li>
                            <li>Campos obligatorios</li>
                            <li>Formatos específicos</li>
                            <li>Rangos permitidos</li>
                        </ul>
                    </div>
                    <div><h5 className="font-semibold text-gray-800">Flujos de Aprobación</h5>
                        <ul className="mt-2 space-y-1 list-disc list-inside text-gray-700">
                            <li>Revisión multinivel</li>
                            <li>Aprobación jerárquica</li>
                            <li>Comentarios y observaciones</li>
                            <li>Trazabilidad completa</li>
                        </ul>
                    </div>
                    <div><h5 className="font-semibold text-gray-800">Controles de Calidad</h5>
                        <ul className="mt-2 space-y-1 list-disc list-inside text-gray-700">
                            <li>Auditoría de cambios</li>
                            <li>Reportes de inconsistencias</li>
                            <li>Métricas de calidad</li>
                            <li>Alertas automáticas</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN FUNCIONAL --- */}
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
        </div>
    );
}