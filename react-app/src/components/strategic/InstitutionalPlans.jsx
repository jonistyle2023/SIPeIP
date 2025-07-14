import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../api/api';
import {Layers, Plus, Edit} from 'lucide-react';
import OeiFormModal from './OeiFormModal';

export default function InstitutionalPlans() {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const plansData = await api.get('/strategic-planning/planes-institucionales/');
            setPlans(plansData);
            if (plansData.length > 0) {
                const firstPlanId = plansData[0].plan_institucional_id;
                await handlePlanChange(firstPlanId);
            }
        } catch (error) {
            console.error("Error fetching institutional plans:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePlanChange = async (planId) => {
        try {
            const detailedPlan = await api.get(`/strategic-planning/planes-institucionales/${planId}/`);
            setSelectedPlan(detailedPlan);
        } catch (error) {
            console.error(`Error fetching details for plan ${planId}:`, error);
        }
    };

    const handleSave = async () => {
        if (selectedPlan) {
            await handlePlanChange(selectedPlan.plan_institucional_id);
        }
    };

    if (loading) return <div className="p-6 bg-white rounded-lg shadow-sm text-center">Cargando planes...</div>;

    return (
        <>
            {isModalOpen && selectedPlan && (
                <OeiFormModal
                    planId={selectedPlan.plan_institucional_id}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg flex items-center">
                        <Layers className="mr-2 text-purple-500"/>Objetivos Estratégicos Institucionales
                    </h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={!selectedPlan}
                        className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs disabled:bg-gray-400"
                    >
                        <Plus size={14} className="mr-1"/> Nuevo OEI
                    </button>
                </div>

                {plans.length > 0 && (
                    <div className="mb-4">
                        <label htmlFor="plan-selector" className="block text-sm font-medium text-gray-700">Seleccionar
                            Plan Institucional</label>
                        <select
                            id="plan-selector"
                            onChange={(e) => handlePlanChange(e.target.value)}
                            value={selectedPlan ? selectedPlan.plan_institucional_id : ''}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            {plans.map(plan => (
                                <option key={plan.plan_institucional_id} value={plan.plan_institucional_id}>
                                    Plan ID {plan.plan_institucional_id} (v{plan.version_actual})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedPlan?.objetivos_estrategicos?.length > 0 ? (
                    <div className="space-y-3">
                        {selectedPlan.objetivos_estrategicos.map(oei => (
                            <div key={oei.oei_id}
                                 className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm border border-gray-200">
                                <div>
                                    <p className="font-semibold text-gray-800">{oei.codigo}: <span
                                        className="font-normal">{oei.descripcion}</span></p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Estado: <span
                                        className={`font-medium ${oei.activo ? 'text-green-600' : 'text-red-600'}`}>{oei.activo ? 'Activo' : 'Inactivo'}</span>
                                    </p>
                                </div>
                                <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-full">
                                    <Edit size={16}/>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">{selectedPlan ? 'Este plan no tiene objetivos estratégicos.' : 'No se encontraron planes institucionales.'}</p>
                    </div>
                )}
            </div>
        </>
    );
}