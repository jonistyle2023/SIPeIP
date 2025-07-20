import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../shared/api/api.js';
import {Flag, BookOpen, Plus, ChevronDown, ChevronRight, Edit, Trash2} from 'lucide-react';
import PndFormModal from './PndFormModal.jsx';
import OdsFormModal from './OdsFormModal.jsx';
import PndObjectiveFormModal from './PndObjectiveFormModal.jsx';

export default function MasterData() {
    const [pnds, setPnds] = useState([]);
    const [ods, setOds] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para edición y creación
    const [editPnd, setEditPnd] = useState(null);
    const [editOds, setEditOds] = useState(null);
    const [isPndModalOpen, setIsPndModalOpen] = useState(false);
    const [isOdsModalOpen, setIsOdsModalOpen] = useState(false);

    // Objetivos de PND
    const [isPndObjectiveModalOpen, setIsPndObjectiveModalOpen] = useState(false);
    const [selectedPndForObjective, setSelectedPndForObjective] = useState(null);

    // Edición de objetivo específico
    const [editObjective, setEditObjective] = useState(null);
    const [editObjectivePndId, setEditObjectivePndId] = useState(null);

    // Acordeón
    const [openPndId, setOpenPndId] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pndData, odsData] = await Promise.all([
                api.get('/strategic-planning/pnd/'),
                api.get('/strategic-planning/ods/')
            ]);
            setPnds(pndData);
            setOds(odsData);
        } catch (error) {
            console.error("Error fetching master data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Eliminar PND
    const handleDeletePnd = async (id) => {
        if (window.confirm("¿Eliminar este Plan Nacional?")) {
            await api.delete(`/strategic-planning/pnd/${id}/`);
            fetchData();
        }
    };

    // Eliminar ODS
    const handleDeleteOds = async (id) => {
        if (window.confirm("¿Eliminar este ODS?")) {
            await api.delete(`/strategic-planning/ods/${id}/`);
            fetchData();
        }
    };

    // Abrir modal para añadir objetivo a PND
    const handleOpenObjectiveModal = (pndId) => {
        setSelectedPndForObjective(pndId);
        setIsPndObjectiveModalOpen(true);
    }

    if (loading) return <div className="p-6 bg-white rounded-lg shadow-sm text-center">Cargando datos maestros...</div>;

    return (
        <>
            {/* Modales */}
            {isPndObjectiveModalOpen &&
                <PndObjectiveFormModal
                    pndId={selectedPndForObjective}
                    onClose={() => setIsPndObjectiveModalOpen(false)}
                    onSave={fetchData}
                />
            }
            {editPnd && <PndFormModal pnd={editPnd} onClose={() => setEditPnd(null)} onSave={fetchData}/>}
            {isOdsModalOpen && <OdsFormModal onClose={() => setIsOdsModalOpen(false)} onSave={fetchData}/>}
            {editOds && <OdsFormModal ods={editOds} onClose={() => setEditOds(null)} onSave={fetchData}/>}
            {isPndObjectiveModalOpen &&
                <PndObjectiveFormModal
                    pndId={selectedPndForObjective}
                    onClose={() => setIsPndObjectiveModalOpen(false)}
                    onSave={fetchData}
                />
            }
            {editObjective &&
                <PndObjectiveFormModal
                    pndId={editObjectivePndId}
                    objetivo={editObjective}
                    onClose={() => {
                        setEditObjective(null);
                        setEditObjectivePndId(null);
                    }}
                    onSave={() => {
                        setEditObjective(null);
                        setEditObjectivePndId(null);
                        fetchData();
                    }}
                />
            }

            <div className="space-y-6">
                {/* PND */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg flex items-center">
                            <Flag className="mr-2 text-green-500"/>Planes Nacionales (PND)
                        </h3>
                        <button onClick={() => setIsPndModalOpen(true)}
                                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs">
                            <Plus size={14} className="mr-1"/>Nuevo Plan
                        </button>
                    </div>
                    <div className="space-y-2">
                        {pnds.map(pnd => (
                            <div key={pnd.plan_id} className="border rounded-lg">
                                <div className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100">
                                    <button onClick={() => setOpenPndId(openPndId === pnd.plan_id ? null : pnd.plan_id)}
                                            className="flex items-center text-left flex-grow space-x-2">
                                        {openPndId === pnd.plan_id ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                        <span className="font-medium text-sm text-gray-800">
                                            {pnd.nombre} ({pnd.periodo})
                                        </span>
                                    </button>
                                    <div className="flex items-center">
                                        <button onClick={() => handleOpenObjectiveModal(pnd.pnd_id)}
                                                className="text-xs flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200">
                                            <Plus size={14} className="mr-1"/>Añadir Objetivo
                                        </button>
                                        <button onClick={() => setEditPnd(pnd)}
                                                className="ml-2 text-blue-600 hover:underline flex items-center">
                                            <Edit size={16} className="mr-1"/>Editar
                                        </button>
                                        <button onClick={() => handleDeletePnd(pnd.plan_id)}
                                                className="ml-2 text-red-600 hover:underline flex items-center">
                                            <Trash2 size={16} className="mr-1"/>Eliminar
                                        </button>
                                    </div>
                                </div>
                                {openPndId === pnd.plan_id && (
                                    <div className="p-4 border-t text-sm space-y-2">
                                        {pnd.objetivos.length > 0 ? (
                                            pnd.objetivos.map(obj =>
                                                <div key={obj.objetivo_pnd_id} className="p-2 bg-gray-100 rounded flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-gray-700">{obj.codigo}</p>
                                                        <p className="text-gray-600">{obj.descripcion}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <button
                                                            onClick={() => {
                                                                setEditObjective(obj);
                                                                setEditObjectivePndId(pnd.plan_id);
                                                            }}
                                                            className="text-blue-600 hover:underline flex items-center"
                                                        >
                                                            <Edit size={16} className="mr-1"/>Editar
                                                        </button>
                                                        {/* Puedes agregar aquí el botón de eliminar objetivo si lo necesitas */}
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <p className="text-gray-500 italic">Este plan no tiene objetivos definidos.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ODS */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg flex items-center">
                            <BookOpen className="mr-2 text-blue-500"/>Objetivos Sostenibles (ODS)
                        </h3>
                        <button onClick={() => setIsOdsModalOpen(true)}
                                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs">
                            <Plus size={14} className="mr-1"/>Nuevo ODS
                        </button>
                    </div>
                    <div className="space-y-3">
                        {ods.map(o =>
                            <div key={o.ods_id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-gray-800">ODS {o.numero}: {o.nombre}</p>
                                    <p className="text-sm text-gray-600 mt-1">{o.descripcion}</p>
                                </div>
                                <div className="flex flex-col space-y-1 ml-4">
                                    <button onClick={() => setEditOds(o)}
                                            className="text-blue-600 hover:underline flex items-center">
                                        <Edit size={16} className="mr-1"/>Editar
                                    </button>
                                    <button onClick={() => handleDeleteOds(o.ods_id)}
                                            className="text-red-600 hover:underline flex items-center">
                                        <Trash2 size={16} className="mr-1"/>Eliminar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}