import React, {useCallback, useEffect, useState} from 'react';
import {api} from '../../shared/api/api.js';
import {ChevronDown, ChevronRight, Edit, Layers, Plus, Trash} from 'lucide-react';
import SectoralPlanFormModal from './SectoralPlanFormModal.jsx';
import SectoralObjectiveFormModal from './SectoralObjectiveFormModal.jsx';

export default function SectoralPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openPlanId, setOpenPlanId] = useState(null);

    // Modales
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
    const [selectedPlanForObjective, setSelectedPlanForObjective] = useState(null);

    // Edición y eliminación
    const [editingPlan, setEditingPlan] = useState(null);
    const [deletingPlanId, setDeletingPlanId] = useState(null);

    // Edición y eliminación de objetivos
    const [editingObjective, setEditingObjective] = useState(null);
    const [deletingObjectiveId, setDeletingObjectiveId] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/strategic-planning/planes-sectoriales/');
            setPlans(data);
        } catch (error) {
            console.error("Error al cargar planes sectoriales:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Planes sectoriales ---
    const handleEditPlan = (plan) => {
        setEditingPlan(plan);
        setIsPlanModalOpen(true);
    };

    const handleDeletePlan = (planId) => {
        setDeletingPlanId(planId);
    };

    const confirmDeletePlan = async () => {
        try {
            await api.delete(`/strategic-planning/planes-sectoriales/${deletingPlanId}/`);
            setDeletingPlanId(null);
            fetchData();
        } catch (err) {
            alert('Error al eliminar el plan sectorial.');
        }
    };

    // --- Objetivos sectoriales ---
    const handleOpenObjectiveModal = (planId) => {
        setSelectedPlanForObjective(planId);
        setEditingObjective(null);
        setIsObjectiveModalOpen(true);
    };

    const handleEditObjective = (objetivo) => {
        setEditingObjective(objetivo);
        setSelectedPlanForObjective(objetivo.plan_sectorial);
        setIsObjectiveModalOpen(true);
    };

    const handleDeleteObjective = (objetivoId) => {
        setDeletingObjectiveId(objetivoId);
    };

    const confirmDeleteObjective = async () => {
        try {
            await api.delete(`/strategic-planning/objetivos-sectoriales/${deletingObjectiveId}/`);
            setDeletingObjectiveId(null);
            fetchData();
        } catch (err) {
            alert('Error al eliminar el objetivo sectorial.');
        }
    };

    if (loading) return <div className="p-6 bg-white rounded-lg shadow-sm text-center">Cargando planes
        sectoriales...</div>;

    return (
        <>
            {(isPlanModalOpen || editingPlan) && (
                <SectoralPlanFormModal
                    plan={editingPlan}
                    onClose={() => {
                        setIsPlanModalOpen(false);
                        setEditingPlan(null);
                    }}
                    onSave={fetchData}
                />
            )}
            {(isObjectiveModalOpen || editingObjective) && (
                <SectoralObjectiveFormModal
                    planSectorialId={selectedPlanForObjective || (editingObjective && editingObjective.plan_sectorial)}
                    objetivo={editingObjective}
                    onClose={() => {
                        setIsObjectiveModalOpen(false);
                        setEditingObjective(null);
                        setSelectedPlanForObjective(null);
                    }}
                    onSave={fetchData}
                />
            )}

            {/* Modal de confirmación para eliminar plan */}
            {deletingPlanId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <p>¿Seguro que deseas eliminar este plan sectorial?</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setDeletingPlanId(null)}
                                    className="px-3 py-1 bg-gray-200 rounded">Cancelar
                            </button>
                            <button onClick={confirmDeletePlan}
                                    className="px-3 py-1 bg-red-600 text-white rounded">Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar objetivo */}
            {deletingObjectiveId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <p>¿Seguro que deseas eliminar este objetivo sectorial?</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setDeletingObjectiveId(null)}
                                    className="px-3 py-1 bg-gray-200 rounded">Cancelar
                            </button>
                            <button onClick={confirmDeleteObjective}
                                    className="px-3 py-1 bg-red-600 text-white rounded">Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center">
                        <Layers className="mr-2 text-blue-500"/>Planes Sectoriales
                    </h3>
                    <button
                        onClick={() => {
                            setIsPlanModalOpen(true);
                            setEditingPlan(null);
                        }}
                        className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs"
                    >
                        <Plus size={14} className="mr-1"/>Nuevo Plan
                    </button>
                </div>
                <div className="space-y-2">
                    {plans.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No hay planes sectoriales creados.</p>
                    ) : (
                        plans.map(plan => (
                            <div key={plan.plan_sectorial_id} className="border rounded-lg">
                                <div className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100">
                                    <button
                                        onClick={() => setOpenPlanId(openPlanId === plan.plan_sectorial_id ? null : plan.plan_sectorial_id)}
                                        className="flex items-center text-left flex-grow space-x-2"
                                    >
                                        {openPlanId === plan.plan_sectorial_id ? <ChevronDown size={16}/> :
                                            <ChevronRight size={16}/>}
                                        <span className="font-medium text-sm text-gray-800">
                                            {plan.nombre}
                                        </span>
                                    </button>
                                    <div className="flex items-center ml-4 gap-2">
                                        <button
                                            onClick={() => handleEditPlan(plan)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                                            title="Editar plan"
                                        >
                                            <Edit size={16}/>
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.plan_sectorial_id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                            title="Eliminar plan"
                                        >
                                            <Trash size={16}/>
                                        </button>
                                        <button
                                            onClick={() => handleOpenObjectiveModal(plan.plan_sectorial_id)}
                                            className="text-xs flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-200"
                                        >
                                            <Plus size={14} className="mr-1"/>Añadir Objetivo
                                        </button>
                                    </div>
                                </div>
                                {openPlanId === plan.plan_sectorial_id && (
                                    <div className="p-4 border-t text-sm space-y-2">
                                        {plan.objetivos && plan.objetivos.length > 0 ? (
                                            plan.objetivos.map(objetivo =>
                                                <div key={objetivo.objetivo_sectorial_id}
                                                     className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                                    <div>
                                                        <p className="font-semibold text-gray-700">{objetivo.codigo}</p>
                                                        <p className="text-gray-600">{objetivo.descripcion}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditObjective(objetivo)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                                                            title="Editar Objetivo"
                                                        >
                                                            <Edit size={16}/>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteObjective(objetivo.objetivo_sectorial_id)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                                            title="Eliminar Objetivo"
                                                        >
                                                            <Trash size={16}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <p className="text-gray-500 italic">Este plan no tiene objetivos
                                                definidos.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}