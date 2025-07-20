import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../shared/api/api.js';
import { Link2, Zap, Layers, Flag } from 'lucide-react';

export default function AlineacionTab({ project, onDataChange }) {
    const [programas, setProgramas] = useState([]);
    const [selectedPrograma, setSelectedPrograma] = useState(project.programa_institucional || '');
    const [contribucion, setContribucion] = useState(project.contribucion_programa || '');
    const [alignmentChain, setAlignmentChain] = useState(null);
    const [loading, setLoading] = useState(false);

    // Carga la lista de todos los programas institucionales
    useEffect(() => {
        api.get('/strategic-planning/programas/').then(setProgramas); // Asumiendo que tienes este endpoint
    }, []);

    // Carga la cadena de alineación cuando hay un programa vinculado
    const fetchAlignmentChain = useCallback(async () => {
        if (project.programa_institucional) {
            setLoading(true);
            try {
                // 1. Obtener el programa para ver sus OEI alineados
                const programaData = await api.get(`/strategic-planning/programas/${project.programa_institucional}/`);
                if (programaData.oei_alineados && programaData.oei_alineados.length > 0) {
                    const oeiId = programaData.oei_alineados[0]; // Tomamos el primer OEI vinculado
                    // 2. Usar el OEI para obtener la alineación con el PND
                    const alignmentData = await api.get(`/strategic-planning/alineaciones/?oei_id=${oeiId}`);
                    setAlignmentChain(alignmentData.length > 0 ? alignmentData[0] : null);
                } else {
                    setAlignmentChain(null);
                }
            } catch (error) {
                console.error("Error fetching alignment chain", error);
                setAlignmentChain(null);
            } finally {
                setLoading(false);
            }
        } else {
            setAlignmentChain(null);
        }
    }, [project.programa_institucional]);

    useEffect(() => {
        fetchAlignmentChain();
    }, [fetchAlignmentChain]);

    const handleSaveAlignment = async () => {
        try {
            await api.patch(`/investment-projects/proyectos/${project.proyecto_id}/`, {
                programa_institucional: selectedPrograma ? parseInt(selectedPrograma) : null,
                contribucion_programa: contribucion ? parseFloat(contribucion) : null,
            });
            onDataChange();
            alert('Alineación guardada con éxito.');
        } catch (error) {
            alert('Error al guardar la alineación.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">1. Vinculación del Proyecto con el Programa Institucional</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Seleccionar Programa</label>
                        <select
                            value={selectedPrograma}
                            onChange={e => setSelectedPrograma(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                        >
                            <option value="">-- Ninguno --</option>
                            {programas.map(prog => (
                                <option key={prog.programa_id} value={prog.programa_id}>{prog.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contribución al Programa (%)</label>
                        <input
                            type="number"
                            value={contribucion}
                            onChange={e => setContribucion(e.target.value)}
                            className="mt-1 block w-full p-2 border rounded-md"
                            placeholder="Ej: 25.00"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={handleSaveAlignment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Guardar Vinculación
                    </button>
                </div>
            </div>

            {loading && <p>Cargando cadena de alineación...</p>}
            {alignmentChain && (
                <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold text-lg mb-3">2. Cadena de Alineación Estratégica (Automática)</h3>
                    <div className="space-y-3 text-sm">
                        <p className="flex items-start"><Zap size={18} className="text-purple-500 mr-3 mt-1"/> <span className="font-bold mr-2">Proyecto:</span> {project.nombre}</p>
                        <div className="pl-5 border-l-2 ml-2"><p className="flex items-start"><Layers size={18} className="text-indigo-500 mr-3 mt-1"/><span className="font-bold mr-2">Se vincula al Programa:</span> {project.programa_institucional_nombre}</p></div>
                        <div className="pl-12 border-l-2 ml-2"><p className="flex items-start"><i data-lucide="target">🎯</i><span className="font-bold mr-2">Que contribuye al OEI:</span> {alignmentChain.instrumento_origen.description}</p></div>
                        <div className="pl-20 border-l-2 ml-2"><p className="flex items-start"><Flag size={18} className="text-green-500 mr-3 mt-1"/><span className="font-bold mr-2">Alineado con el Objetivo PND:</span> {alignmentChain.instrumento_destino.description}</p></div>
                    </div>
                </div>
            )}
        </div>
    );
}