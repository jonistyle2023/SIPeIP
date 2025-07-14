import React, {useState, useEffect, useCallback} from 'react';
import {api} from '../../api/api';
import {Flag, BookOpen, Plus, ChevronDown, ChevronRight, Edit, Trash2} from 'lucide-react';
import PndFormModal from './PndFormModal';
import OdsFormModal from './OdsFormModal';
import PndObjectiveFormModal from './PndObjectiveFormModal';

export default function MasterData() {
    const [pnds, setPnds] = useState([]);
    const [ods, setOds] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para controlar qué acordeón de PND está abierto
    const [openPndId, setOpenPndId] = useState(null);

    // Estados para controlar la visibilidad de cada modal
    const [isPndModalOpen, setIsPndModalOpen] = useState(false);
    const [isOdsModalOpen, setIsOdsModalOpen] = useState(false);
    const [isPndObjectiveModalOpen, setIsPndObjectiveModalOpen] = useState(false);

    // Estado para saber a qué PND añadirle un objetivo
    const [selectedPndForObjective, setSelectedPndForObjective] = useState(null);

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

    const handleOpenObjectiveModal = (pndId) => {
        setSelectedPndForObjective(pndId);
        setIsPndObjectiveModalOpen(true);
    };

    if (loading) return <div className="p-6 bg-white rounded-lg shadow-sm text-center">Cargando datos maestros...</div>;

    return (
        <>
            {/* Renderizado condicional de los modales */}
            {isPndModalOpen && <PndFormModal onClose={() => setIsPndModalOpen(false)} onSave={fetchData}/>}
            {isOdsModalOpen && <OdsFormModal onClose={() => setIsOdsModalOpen(false)} onSave={fetchData}/>}
            {isPndObjectiveModalOpen &&
                <PndObjectiveFormModal pndId={selectedPndForObjective} onClose={() => setIsPndObjectiveModalOpen(false)}
                                       onSave={fetchData}/>}

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg flex items-center"><Flag className="mr-2 text-green-500"/>Planes
                            Nacionales (PND)</h3>
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
                                        {openPndId === pnd.plan_id ? <ChevronDown size={16}/> :
                                            <ChevronRight size={16}/>}
                                        <span
                                            className="font-medium text-sm text-gray-800">{pnd.nombre} ({pnd.periodo})</span>
                                    </button>
                                    <div className="flex items-center">
                                        <button onClick={() => handleOpenObjectiveModal(pnd.plan_id)}
                                                className="text-xs flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200">
                                            <Plus size={14} className="mr-1"/>Añadir Objetivo
                                        </button>
                                    </div>
                                </div>
                                {openPndId === pnd.plan_id && (
                                    <div className="p-4 border-t text-sm space-y-2">
                                        {pnd.objetivos.length > 0 ? (
                                            pnd.objetivos.map(obj =>
                                                <div key={obj.objetivo_pnd_id} className="p-2 bg-gray-100 rounded">
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
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg flex items-center"><BookOpen
                            className="mr-2 text-blue-500"/>Objetivos Sostenibles (ODS)</h3>
                        <button onClick={() => setIsOdsModalOpen(true)}
                                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs">
                            <Plus size={14} className="mr-1"/>Nuevo ODS
                        </button>
                    </div>
                    <div className="space-y-3">
                        {ods.map(o =>
                            <div key={o.ods_id} className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-bold text-gray-800">ODS {o.numero}: {o.nombre}</p>
                                <p className="text-sm text-gray-600 mt-1">{o.descripcion}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};