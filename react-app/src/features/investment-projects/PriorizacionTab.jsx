import React, { useState, useEffect } from 'react';
import { api } from '../../shared/api/api';

export default function PriorizacionTab({ project }) {
    const [criterios, setCriterios] = useState([]);
    const [puntuaciones, setPuntuaciones] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const critData = await api.get('/investment-projects/criterios-priorizacion/?activo=true');
            const puntData = await api.get(`/investment-projects/puntuaciones/?proyecto=${project.proyecto_id}`);
            setCriterios(critData);

            // Mapea las puntuaciones existentes para un fácil acceso
            const puntMap = puntData.reduce((acc, p) => {
                acc[p.criterio] = { id: p.puntuacion_id, score: p.puntuacion_asignada };
                return acc;
            }, {});
            setPuntuaciones(puntMap);
        };
        fetchData();
    }, [project.proyecto_id]);

    const handleScoreChange = (criterioId, score) => {
        setPuntuaciones(prev => ({ ...prev, [criterioId]: { ...prev[criterioId], score } }));
    };

    const handleSave = async () => {
        for (const criterioId in puntuaciones) {
            const punt = puntuaciones[criterioId];
            if (punt.id) { // Es una puntuación existente, usamos PUT
                await api.put(`/investment-projects/puntuaciones/${punt.id}/`, {
                    proyecto: project.proyecto_id,
                    criterio: criterioId,
                    puntuacion_asignada: punt.score,
                });
            } else { // Es nueva, usamos POST
                await api.post('/investment-projects/puntuaciones/', {
                    proyecto: project.proyecto_id,
                    criterio: criterioId,
                    puntuacion_asignada: punt.score,
                });
            }
        }
        alert('Puntuaciones guardadas.');
    };

    return (
        <div className="space-y-4">
            {criterios.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    No hay criterios de priorización configurados o activos.
                </div>
            ) : (
                criterios.map(c => (
                    <div key={c.criterio_id} className="p-4 border rounded-lg">
                        <label className="font-semibold">{c.nombre} <span className="font-normal text-gray-500">({c.ponderacion}%)</span></label>
                        <p className="text-sm text-gray-600 mb-2">{c.descripcion}</p>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={puntuaciones[c.criterio_id]?.score || ''}
                            onChange={e => handleScoreChange(c.criterio_id, e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Asignar puntuación (0-100)"
                    />
                </div>
            )))}
            <div className="flex justify-end">
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar Puntuaciones</button>
            </div>
        </div>
    );
}