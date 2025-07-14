import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../api/api';
import {Layers, Plus, ChevronDown, ChevronRight} from 'lucide-react';
import SectoralPlanFormModal from './SectoralPlanFormModal';
import SectoralObjectiveFormModal from './SectoralObjectiveFormModal';

export default function SectoralPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openPlanId, setOpenPlanId] = useState(null);

    // Estados para los modales
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
    const [selectedPlanForObjective, setSelectedPlanForObjective] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/strategic-planning/planes-sectoriales/');
            setPlans(data);
        } catch (error) {
            console.error("Error fetching sectoral plans:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenObjectiveModal = (planId) => {
        setSelectedPlanForObjective(planId);
        setIsObjectiveModalOpen(true);
    };

    if (loading) return <div className="p-6 bg-white rounded-lg shadow-sm text-center">Cargando Planes
        Sectoriales...</div>;

    return (
        <>
            {isPlanModalOpen && <SectoralPlanFormModal onClose={() => setIsPlanModalOpen(false)} onSave={fetchData}/>}
            {isObjectiveModalOpen && <SectoralObjectiveFormModal planSectorialId={selectedPlanForObjective}
                                                                 onClose={() => setIsObjectiveModalOpen(false)}
                                                                 onSave={fetchData}/>}

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center"><Layers className="mr-2 text-cyan-500"/>Planes
                        Sectoriales</h3>
                    <button onClick={() => setIsPlanModalOpen(true)}
                            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs">
                        <Plus size={14} className="mr-1"/>Nuevo Plan Sectorial
                    </button>
                </div>
                <div className="space-y-2">
                    {plans.length === 0 && !loading ? (
                        <p className="text-center text-gray-500 py-4">No hay planes sectoriales creados.</p>
                    ) : (
                        plans.map(plan => (
                            <div key={plan.plan_sectorial_id} className="border rounded-lg">
                                <div className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100">
                                    <button
                                        onClick={() => setOpenPlanId(openPlanId === plan.plan_sectorial_id ? null : plan.plan_sectorial_id)}
                                        className="flex items-center text-left flex-grow space-x-2">
                                        {openPlanId === plan.plan_sectorial_id ? <ChevronDown size={16}/> :
                                            <ChevronRight size={16}/>}
                                        <span className="font-medium text-sm text-gray-800">{plan.nombre}</span>
                                    </button>
                                    <div className="flex items-center ml-4">
                                        <button onClick={() => handleOpenObjectiveModal(plan.plan_sectorial_id)}
                                                className="text-xs flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200">
                                            <Plus size={14} className="mr-1"/>Añadir Objetivo
                                        </button>
                                    </div>
                                </div>
                                {openPlanId === plan.plan_sectorial_id && (
                                    <div className="p-4 border-t text-sm space-y-2">
                                        {plan.objetivos && plan.objetivos.length > 0 ? (
                                            plan.objetivos.map(obj =>
                                                <div key={obj.objetivo_sectorial_id}
                                                     className="p-2 bg-gray-100 rounded">
                                                    <p className="font-semibold text-gray-700">{obj.codigo}</p>
                                                    <p className="text-gray-600">{obj.descripcion}</p>
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