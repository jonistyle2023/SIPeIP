import React, {useCallback, useEffect, useState} from 'react';
import {api} from '../../shared/api/api.js';
import {BookOpen, ChevronDown, ChevronRight, Edit, Flag, Plus, Trash2, Target, ListTree} from 'lucide-react';
import PndFormModal from './modals/PndFormModal.jsx';
import OdsDetailModal from './modals/OdsDetailModal.jsx'; // Importar el nuevo modal
import PndObjectiveFormModal from './modals/PndObjectiveFormModal.jsx';

// Importar los íconos de los ODS como imágenes PNG
import OdsIcon1 from '../../app/assets/OdsIcons/SDG01.png';
import OdsIcon2 from '../../app/assets/OdsIcons/SDG02.png';
import OdsIcon3 from '../../app/assets/OdsIcons/SDG03.png';
import OdsIcon4 from '../../app/assets/OdsIcons/SDG04.png';
import OdsIcon5 from '../../app/assets/OdsIcons/SDG05.png';
import OdsIcon6 from '../../app/assets/OdsIcons/SDG06.png';
import OdsIcon7 from '../../app/assets/OdsIcons/SDG07.png';
import OdsIcon8 from '../../app/assets/OdsIcons/SDG08.png';
import OdsIcon9 from '../../app/assets/OdsIcons/SDG09.png';
import OdsIcon10 from '../../app/assets/OdsIcons/SDG10.png';
import OdsIcon11 from '../../app/assets/OdsIcons/SDG11.png';
import OdsIcon12 from '../../app/assets/OdsIcons/SDG12.png';
import OdsIcon13 from '../../app/assets/OdsIcons/SDG13.png';
import OdsIcon14 from '../../app/assets/OdsIcons/SDG14.png';
import OdsIcon15 from '../../app/assets/OdsIcons/SDG15.png';
import OdsIcon16 from '../../app/assets/OdsIcons/SDG16.png';
import OdsIcon17 from '../../app/assets/OdsIcons/SDG17.png';

export default function MasterData() {
    const [pnds, setPnds] = useState([]);
    const [ods, setOds] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para edición y creación
    const [editPnd, setEditPnd] = useState(null);
    const [isPndModalOpen, setIsPndModalOpen] = useState(false);

    // Objetivos de PND
    const [isPndObjectiveModalOpen, setIsPndObjectiveModalOpen] = useState(false);
    const [selectedPndForObjective, setSelectedPndForObjective] = useState(null);

    // Edición de objetivo específico
    const [editObjective, setEditObjective] = useState(null);
    const [editObjectivePndId, setEditObjectivePndId] = useState(null);

    // Acordeón
    const [openPndId, setOpenPndId] = useState(null); // Para PND
    const [selectedOds, setSelectedOds] = useState(null); // Para el modal de detalles de ODS

    // Mapa para asociar el número de ODS con su imagen PNG importada
    const odsIconImages = {
        1: OdsIcon1,
        2: OdsIcon2,
        3: OdsIcon3,
        4: OdsIcon4,
        5: OdsIcon5,
        6: OdsIcon6,
        7: OdsIcon7,
        8: OdsIcon8,
        9: OdsIcon9,
        10: OdsIcon10,
        11: OdsIcon11,
        12: OdsIcon12,
        13: OdsIcon13,
        14: OdsIcon14,
        15: OdsIcon15,
        16: OdsIcon16,
        17: OdsIcon17,
    };
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

    // Abrir modal para añadir objetivo a PND
    const handleOpenObjectiveModal = (pndId) => {
        setSelectedPndForObjective(pndId);
        setIsPndObjectiveModalOpen(true);
    }

    if (loading) return <div className="p-6 bg-white rounded-lg shadow-sm text-center">Cargando datos maestros...</div>;

    return (
        <>
            {/* Modales */}
            {selectedOds &&
                <OdsDetailModal
                    ods={selectedOds}
                    iconSrc={odsIconImages[selectedOds.numero]}
                    onClose={() => setSelectedOds(null)}
                />
            }
            {isPndObjectiveModalOpen &&
                <PndObjectiveFormModal
                    pndId={selectedPndForObjective}
                    onClose={() => setIsPndObjectiveModalOpen(false)}
                    onSave={fetchData}
                />
            }
            {editPnd && <PndFormModal pnd={editPnd} onClose={() => setEditPnd(null)} onSave={fetchData}/>}
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
                            <Flag className="mr-2 text-green-500"/>Plan Nacional de Desarrollo (PND)
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
                                        {openPndId === pnd.plan_id ? <ChevronDown size={16}/> :
                                            <ChevronRight size={16}/>}
                                        <span className="font-medium text-sm text-gray-800">
                                            {pnd.nombre} ({pnd.periodo})
                                        </span>
                                    </button>
                                    <div className="flex items-center ml-4 gap-2">
                                        <button onClick={() => setEditPnd(pnd)}
                                                className="ml-2 text-blue-600 hover:underline flex items-center">
                                            <Edit size={16}/>
                                        </button>
                                        <button onClick={() => handleOpenObjectiveModal(pnd.pnd_id)}
                                                className="text-xs flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200">
                                            <Plus size={14} className="mr-1"/>Añadir Objetivo
                                        </button>
                                    </div>
                                </div>
                                {openPndId === pnd.plan_id && (
                                    <div className="p-4 border-t text-sm space-y-2">
                                        {pnd.objetivos.length > 0 ? (
                                            pnd.objetivos.map(obj =>
                                                <div key={obj.objetivo_pnd_id}
                                                     className="p-2 bg-gray-100 rounded flex justify-between items-center">
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
                                            <p className="text-gray-500 italic">Este plan no tiene objetivos
                                                definidos.</p>
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
                            <BookOpen className="mr-2 text-blue-500"/>Objetivos de Desarrollo Sostenible (ODS)
                        </h3>
                        <p className="text-sm text-gray-500">Haz clic en un objetivo para ver sus metas e indicadores.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-4">
                        {ods.map(odsItem => {
                            const iconImage = odsIconImages[odsItem.numero];
                            return (
                                <button
                                key={odsItem.ods_id}
                                onClick={() => setSelectedOds(odsItem)}
                                className="aspect-square flex justify-center items-center rounded-lg transition-transform duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                title={`ODS ${odsItem.numero}: ${odsItem.nombre}`}
                            >
                                {iconImage ? (
                                    <img src={iconImage} alt={`ODS ${odsItem.numero}`} className="w-full h-full object-contain"/>
                                ) : (
                                    <span className="text-gray-500">ODS {odsItem.numero}</span>
                                )}
                            </button>)
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}