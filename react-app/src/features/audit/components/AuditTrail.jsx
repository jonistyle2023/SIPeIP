import React, { useState, useEffect } from 'react';
import { api } from '../../../shared/api/api.js';
import { History, FileJson, GitCommitVertical } from 'lucide-react';

// Sub-componente para mostrar el JSON de forma bonita
const JsonViewer = ({ data }) => (
    <pre className="bg-gray-800 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">
        {JSON.stringify(data, null, 2)}
    </pre>
);

// Componente principal de la auditoría
export default function AuditTrail({ modelName, objectId }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('summary'); // 'summary' o 'json'

    useEffect(() => {
        const fetchAuditEvents = async () => {
            if (!modelName || !objectId) return;

            setLoading(true);
            setError('');
            try {
                // 1. Obtener el ID del ContentType para nuestro modelo
                const contentTypeRes = await api.get(`/audit/content-type/?model=${modelName}`);
                const contentTypeId = contentTypeRes.id;

                // 2. Usar ese ID para buscar los eventos de auditoría
                const eventsRes = await api.get(`/audit/events/?content_type=${contentTypeId}&object_id=${objectId}`);
                setEvents(eventsRes);
            } catch (err) {
                setError('No se pudo cargar el historial de auditoría.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAuditEvents();
    }, [modelName, objectId]);

    if (loading) return <div className="text-center p-4">Cargando historial...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
    if (events.length === 0) return <div className="text-center p-4 text-gray-500">No hay registros de auditoría para este objeto.</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg flex items-center"><History size={20} className="mr-2"/> Historial de Cambios</h4>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('summary')} className={`px-3 py-1 text-xs flex items-center rounded-full ${viewMode === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        <GitCommitVertical size={14} className="mr-1"/> Resumen
                    </button>
                    <button onClick={() => setViewMode('json')} className={`px-3 py-1 text-xs flex items-center rounded-full ${viewMode === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                        <FileJson size={14} className="mr-1"/> JSON
                    </button>
                </div>
            </div>

            {/* Renderizado condicional de la vista */}
            {viewMode === 'summary' && (
                <ul className="border-l-2 border-gray-200 ml-2 space-y-6">
                    {events.map(event => (
                        <li key={event.id} className="relative pl-8">
                            <div className="absolute -left-[7px] top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                            <p className="text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleString()}
                            </p>
                            <p className="font-semibold text-gray-800">
                                {event.user || 'Sistema'} realizó la acción: <span className="text-blue-600">{event.event_type}</span>
                            </p>
                            {/* Aquí puedes añadir lógica para mostrar los campos cambiados */}
                        </li>
                    ))}
                </ul>
            )}

            {viewMode === 'json' && (
                <div className="space-y-4">
                    {events.map(event => (
                        <details key={event.id} className="bg-gray-50 rounded-lg">
                            <summary className="cursor-pointer p-3 font-semibold text-sm">
                                {event.event_type} - {new Date(event.timestamp).toLocaleString()}
                            </summary>
                            <div className="p-2">
                                <JsonViewer data={event.details} />
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </div>
    );
}