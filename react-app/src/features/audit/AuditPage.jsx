import React, {useEffect, useState} from 'react';
import {ShieldCheck, Search, FileJson, Loader2, Download} from 'lucide-react';
import {api} from '../../shared/api/api.js';

const JsonViewer = ({data}) => (
    <pre className="bg-gray-800 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">
        {JSON.stringify(data, null, 2)}
    </pre>
);

export default function AuditPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [usuarios, setUsuarios] = useState([]);

    const [filters, setFilters] = useState({user: '', event_type: '', fecha_desde: '', fecha_hasta: ''});
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        // Carga best-effort: solo un Admin puede listar usuarios; si falla, se oculta el dropdown.
        api.get('/auth/usuarios/')
            .then(setUsuarios)
            .catch(() => setUsuarios([]));
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                Object.entries(appliedFilters).forEach(([key, value]) => {
                    if (value) params.append(key, value);
                });
                const query = params.toString();
                const response = await api.get(`/audit/events/${query ? `?${query}` : ''}`);
                setEvents(response);
            } catch (err) {
                console.error(err);
                setError('No se pudo cargar el historial de auditoría.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [appliedFilters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setAppliedFilters(filters);
    };

    // Exporta a JSON (estilo AWS CloudTrail) los eventos que cumplen los filtros aplicados.
    const handleExport = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams();
            Object.entries(appliedFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            const query = params.toString();
            const response = await fetch(
                `http://127.0.0.1:8000/api/v1/audit/events/export/${query ? `?${query}` : ''}`,
                {headers: {'Authorization': `Token ${token}`}}
            );
            if (!response.ok) throw new Error('No se pudo generar la exportación.');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error(err);
            alert('No se pudo exportar el historial de auditoría.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-colors">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                    <ShieldCheck className="mr-3 text-blue-600 dark:text-blue-400"/>
                    Módulo de Auditoría y Trazabilidad
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Consulta y seguimiento de todas las acciones realizadas en el sistema.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {usuarios.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
                            <select
                                className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm dark:bg-slate-700 dark:text-white"
                                value={filters.user}
                                onChange={e => handleFilterChange('user', e.target.value)}
                            >
                                <option value="">Todos</option>
                                {usuarios.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre_usuario}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Evento</label>
                        <input
                            type="text"
                            placeholder="Ej: CREACION, LOGIN..."
                            className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm dark:bg-slate-700 dark:text-white"
                            value={filters.event_type}
                            onChange={e => handleFilterChange('event_type', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm dark:bg-slate-700 dark:text-white"
                            value={filters.fecha_desde}
                            onChange={e => handleFilterChange('fecha_desde', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm dark:bg-slate-700 dark:text-white"
                            value={filters.fecha_hasta}
                            onChange={e => handleFilterChange('fecha_hasta', e.target.value)}
                        />
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                    <button type="submit" className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-md">
                        <Search size={16} className="mr-2"/> Filtrar
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting}
                        className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-semibold px-4 py-2 rounded-md"
                    >
                        {exporting
                            ? <Loader2 size={16} className="mr-2 animate-spin"/>
                            : <Download size={16} className="mr-2"/>}
                        Exportar JSON
                    </button>
                </div>
            </form>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm transition-colors">
                <h3 className="font-semibold dark:text-white mb-4">Historial de Eventos</h3>

                {loading && (
                    <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                        <Loader2 className="animate-spin mr-2" size={20}/> Cargando eventos...
                    </div>
                )}
                {!loading && error && <p className="text-center text-red-500 py-4">{error}</p>}
                {!loading && !error && events.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No se encontraron eventos de auditoría con estos filtros.</p>
                )}
                {!loading && !error && events.length > 0 && (
                    <div className="space-y-2">
                        {events.map(event => (
                            <details key={event.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <summary className="cursor-pointer p-3 text-sm flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                        {event.user || 'Sistema'} · <span className="text-blue-600 dark:text-blue-400">{event.event_type}</span>
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                        {event.content_type && <span className="mr-2">{event.content_type} #{event.object_id}</span>}
                                        {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                </summary>
                                <div className="p-3 pt-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                                        <FileJson size={12} className="mr-1"/> Detalles
                                    </p>
                                    <JsonViewer data={event.details}/>
                                </div>
                            </details>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
