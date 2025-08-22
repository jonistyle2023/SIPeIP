import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {api} from '../../shared/api/api.js';
import {Anchor, ArrowLeft, FileText, HardHat, Link2, Plus, Send, Target, AlertCircle} from 'lucide-react';
import IndicadorList from './IndicadorList.jsx';
import IndicadorFormModal from './IndicadorFormModal.jsx';
import MarcoLogicoFormModal from './MarcoLogicoFormModal.jsx';
import FinancieroTab from './FinancieroTab.jsx';
import ActividadFormModal from './ActividadFormModal.jsx';
import ComponenteFormModal from './ComponenteFormModal.jsx';
import ArrastresTab from './ArrastresTab.jsx';
import AlineacionTab from './AlineacionTab.jsx';

const CONTENT_TYPE_IDS = {
    MARCO_LOGICO: 32,
    COMPONENTE: 9,
};

const TabButton = ({label, icon: Icon, isActive, onClick}) => (
    <button onClick={onClick}
            className={`flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
        <Icon size={16} className="mr-2"/>
        {label}
    </button>
);

const PlaceholderContent = ({tabName, onAction}) => (
    <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-gray-700">{tabName === "Marco Lógico" ? "No hay un Marco Lógico definido" : `Funcionalidad de "${tabName}"`}</h3>
        <p className="text-gray-500 mt-2">{tabName === "Marco Lógico" ? "Crea uno para empezar a añadir componentes e indicadores." : "Este panel está en construcción."}</p>
        {tabName === "Marco Lógico" && (
            <button onClick={onAction}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto">
                <Plus size={16} className="mr-2"/>
                Crear Marco Lógico
            </button>
        )}
    </div>
);

export default function ProjectDetail({project, onReturnToList}) {
    const [activeTab, setActiveTab] = useState('marco_logico');
    const [marcoLogico, setMarcoLogico] = useState(null);
    const [loading, setLoading] = useState(true);
    const [projectDetails, setProjectDetails] = useState(project);

    const [isIndicadorModalOpen, setIsIndicadorModalOpen] = useState(false);
    const [isMLModalOpen, setIsMLModalOpen] = useState(false);
    const [isActividadModalOpen, setIsActividadModalOpen] = useState(false);
    const [isComponenteModalOpen, setIsComponenteModalOpen] = useState(false);
    const [modalParent, setModalParent] = useState(null);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [editIndicador, setEditIndicador] = useState(null);

    const fetchData = useCallback(async () => {
        if (!project?.proyecto_id) return;
        setLoading(true);
        try {
            const [projectData, marcoLogicoData] = await Promise.all([
                api.get(`/investment-projects/proyectos/${project.proyecto_id}/`),
                api.get(`/investment-projects/marcos-logicos/?proyecto=${project.proyecto_id}`)
            ]);
            setProjectDetails(projectData);
            setMarcoLogico(marcoLogicoData && marcoLogicoData.length > 0 ? marcoLogicoData[0] : null);
        } catch (error) {
            console.error("Error fetching project data:", error);
        } finally {
            setLoading(false);
        }
    }, [project.proyecto_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const {finIndicadores, propositoIndicadores} = useMemo(() => {
        const indicadoresML = marcoLogico?.indicadores || [];
        return {
            finIndicadores: indicadoresML.filter(i => i.descripcion?.toLowerCase().startsWith('fin:')),
            propositoIndicadores: indicadoresML.filter(i => i.descripcion?.toLowerCase().startsWith('propósito:')),
        };
    }, [marcoLogico]);

    const getTipoIndicador = (indicador) => {
        if (indicador.descripcion.toLowerCase().startsWith('fin:')) return 'Fin';
        if (indicador.descripcion.toLowerCase().startsWith('propósito:')) return 'Proposito';
        return 'Componente';
    };

    const handleEditIndicador = (indicador) => {
        const tipo = getTipoIndicador(indicador);
        let parentData = {};

        if (tipo === 'Fin' || tipo === 'Proposito') {
            parentData = {
                name: tipo,
                objectId: marcoLogico.marco_logico_id,
                contentTypeId: CONTENT_TYPE_IDS.MARCO_LOGICO
            };
        } else {
            parentData = {
                name: indicador.objeto_asociado.nombre,
                objectId: indicador.objeto_asociado.componente_id,
                contentTypeId: CONTENT_TYPE_IDS.COMPONENTE
            };
        }

        setModalParent(parentData);
        setEditIndicador(indicador);
        setIsIndicadorModalOpen(true);
    };

    const handleDeleteIndicador = async (indicador) => {
        if (window.confirm('¿Seguro que deseas eliminar este indicador?')) {
            try {
                await api.delete(`/investment-projects/indicadores/${indicador.indicador_id}/`);
                fetchData();
            } catch (err) {
                alert('Error al eliminar el indicador: ' + (err.message || ''));
            }
        }
    };

    const handleAddIndicador = (parentType, parentObject) => {
        let parentData = {};
        if (parentType === 'Fin' || parentType === 'Proposito') {
            parentData = {
                name: parentType,
                objectId: parentObject.marco_logico_id,
                contentTypeId: CONTENT_TYPE_IDS.MARCO_LOGICO
            };
        } else {
            parentData = {
                name: parentObject.nombre,
                objectId: parentObject.componente_id,
                contentTypeId: CONTENT_TYPE_IDS.COMPONENTE
            };
        }
        setModalParent(parentData);
        setIsIndicadorModalOpen(true);
    };

    const handleAddActividad = (componente) => {
        setSelectedComponent(componente);
        setIsActividadModalOpen(true);
    };

    const handleSave = () => {
        setIsIndicadorModalOpen(false);
        setIsMLModalOpen(false);
        setIsActividadModalOpen(false);
        setIsComponenteModalOpen(false);
        fetchData();
    };

    const handlePostular = async () => {
        if (window.confirm('¿Está seguro de que desea postular este proyecto al Plan Anual de Inversiones? Esta acción no se puede deshacer.')) {
            try {
                const updatedProject = await api.post(`/investment-projects/proyectos/${projectDetails.proyecto_id}/postular/`, {});
                setProjectDetails(updatedProject);
                alert('¡Proyecto postulado con éxito!');
            } catch (error) {
                alert('Error al postular el proyecto: ' + (error.message || ''));
            }
        }
    };

    const canPostulate = projectDetails.estado === 'EN_FORMULACION' &&
        projectDetails.dictamenes?.some(d => d.estado === 'APROBADO');

    const renderContent = () => {
        if (loading) return <p className="text-center p-4">Cargando...</p>;

        switch (activeTab) {
            case 'marco_logico':
                if (marcoLogico) {
                    return (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">Fin</h3>
                                <p className="text-gray-700 italic mt-1">{marcoLogico.fin}</p>
                                <div className="mt-3">
                                    <IndicadorList
                                        title="Indicadores de Fin"
                                        indicadores={finIndicadores}
                                        onAdd={() => handleAddIndicador('Fin', marcoLogico)}
                                        onEdit={handleEditIndicador}
                                        onDelete={indicador => handleDeleteIndicador(indicador.indicador_id)}
                                    />
                                </div>
                            </div>
                            <hr/>
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">Propósito</h3>
                                <p className="text-gray-700 italic mt-1">{marcoLogico.proposito}</p>
                                <div className="mt-3">
                                    <IndicadorList
                                        title="Indicadores de Propósito"
                                        indicadores={propositoIndicadores}
                                        onAdd={() => handleAddIndicador('Proposito', marcoLogico)}
                                        onEdit={handleEditIndicador}
                                        onDelete={indicador => handleDeleteIndicador(indicador.indicador_id)}
                                    />
                                </div>
                            </div>
                            <hr/>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-xl text-gray-800">Componentes</h3>
                                    <button onClick={() => setIsComponenteModalOpen(true)}
                                            className="flex items-center text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        <Plus size={16} className="mr-1"/>Añadir Componente
                                    </button>
                                </div>
                                <div className="space-y-4 mt-2">
                                    {marcoLogico.componentes?.map(comp => (
                                        <div key={comp.componente_id} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{comp.nombre}</p>
                                                    <p className="text-xs text-gray-500">Ponderación: {comp.ponderacion}%</p>
                                                </div>
                                                <button onClick={() => handleAddActividad(comp)}
                                                        className="flex items-center text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                                    <Plus size={14} className="mr-1"/>Añadir Actividad
                                                </button>
                                            </div>
                                            <div className="mt-4 space-y-2 pl-4 border-l-2">
                                                <h5 className="text-sm font-semibold">Actividades:</h5>
                                                {comp.actividades?.length > 0 ? comp.actividades.map(act => (
                                                    <div key={act.actividad_id} className="text-sm text-gray-700">
                                                        <p>- {act.descripcion}</p>
                                                        <p className="text-xs text-gray-500 ml-4">({act.fecha_inicio} al {act.fecha_fin})</p>
                                                    </div>
                                                )) : <p className="text-xs text-gray-500 italic">No hay actividades
                                                    definidas.</p>}
                                            </div>
                                            <div className="mt-4">
                                                <IndicadorList
                                                    title="Indicadores del Componente"
                                                    indicadores={comp.indicadores}
                                                    onAdd={() => handleAddIndicador('Componente', comp)}
                                                    onEdit={handleEditIndicador}
                                                    onDelete={indicador => handleDeleteIndicador(indicador.indicador_id)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return <PlaceholderContent tabName="Marco Lógico" onAction={() => setIsMLModalOpen(true)}/>;
                }
            case 'financiero':
                return marcoLogico ?
                    <FinancieroTab marcoLogico={marcoLogico} onDataChange={fetchData}/> :
                    <PlaceholderContent tabName="Financiero"/>;
            case 'alineacion':
                return <AlineacionTab project={projectDetails} onDataChange={fetchData}/>;
            case 'arrastres':
                return <ArrastresTab project={projectDetails} onDataChange={fetchData}/>;
            case 'documentos':
                return <PlaceholderContent tabName="Documentos"/>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {isMLModalOpen && <MarcoLogicoFormModal project={projectDetails} onClose={() => setIsMLModalOpen(false)}
                                                    onSave={handleSave}/>}
            {isIndicadorModalOpen && (
                <IndicadorFormModal
                    parent={modalParent}
                    onClose={() => {
                        setIsIndicadorModalOpen(false);
                        setEditIndicador(null);
                    }}
                    onSave={handleSave}
                    indicador={editIndicador}
                />
            )}
            {isActividadModalOpen &&
                <ActividadFormModal componente={selectedComponent} onClose={() => setIsActividadModalOpen(false)}
                                    onSave={handleSave}/>}
            {isComponenteModalOpen && (
                <ComponenteFormModal
                    marcoLogicoId={marcoLogico?.marco_logico_id}
                    onClose={() => setIsComponenteModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            {/* --- AVISO DE OBSERVACIONES --- */}
            {projectDetails.estado === 'EN_FORMULACION' && projectDetails.ultimas_observaciones && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-400"/>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-yellow-800">
                                Este proyecto fue devuelto para corrección.
                            </p>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p><strong>Observaciones:</strong> {projectDetails.ultimas_observaciones}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <button onClick={onReturnToList}
                    className="flex items-center text-sm text-blue-600 font-semibold hover:underline">
                <ArrowLeft size={16} className="mr-1"/>
                Volver al Pipeline
            </button>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{projectDetails.nombre}</h2>
                        <p className="text-sm text-gray-500">CUP: {projectDetails.cup || 'N/A'} • {projectDetails.sector_nombre}</p>
                        <span
                            className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
                            {projectDetails.estado?.replace('_', ' ')}
                        </span>
                    </div>
                    {canPostulate && (
                        <button
                            onClick={handlePostular}
                            className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Send size={18} className="mr-2"/>
                            Postular al PAI
                        </button>
                    )}
                </div>
            </div>

            <div className="border-b flex">
                <TabButton label="Marco Lógico" icon={Target} isActive={activeTab === 'marco_logico'}
                           onClick={() => setActiveTab('marco_logico')}/>
                <TabButton label="Financiero" icon={HardHat} isActive={activeTab === 'financiero'}
                           onClick={() => setActiveTab('financiero')}/>
                <TabButton label="Alineación" icon={Link2} isActive={activeTab === 'alineacion'}
                           onClick={() => setActiveTab('alineacion')}/>
                <TabButton label="Arrastres" icon={Anchor} isActive={activeTab === 'arrastres'}
                           onClick={() => setActiveTab('arrastres')}/>
                <TabButton label="Documentos" icon={FileText} isActive={activeTab === 'documentos'}
                           onClick={() => setActiveTab('documentos')}/>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm min-h-[300px]">
                {renderContent()}
            </div>
        </div>
    );
}