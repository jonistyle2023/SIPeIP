import React, {useState, useEffect} from 'react';
import {api} from '../../../shared/api/api.js';
import {X} from 'lucide-react';

export default function MarcoLogicoFormModal({project, onClose, onSave}) {
    const [fin, setFin] = useState('');
    const [proposito, setProposito] = useState('');
    const [error, setError] = useState('');
    const [odsList, setOdsList] = useState([]);
    const [selectedOdsId, setSelectedOdsId] = useState(null);
    const [loadingOds, setLoadingOds] = useState(false);
    const [odsError, setOdsError] = useState(null);

    useEffect(() => {
        const endpoints = ['/strategic-planning/ods/'];
        let mounted = true;

        const fetchOds = async () => {
            setLoadingOds(true);
            setOdsError(null);
            try {
                for (const ep of endpoints) {
                    try {
                        const data = await api.get(ep);
                        if (!mounted) return;
                        const list = Array.isArray(data) ? data : (data.results || []);
                        if (list.length > 0) {
                            setOdsList(list);
                            setLoadingOds(false);
                            return;
                        }
                    } catch (e) {
                    }
                }
                if (mounted) {
                    setOdsError('No fue posible cargar los ODS. Verifique la configuración del backend.');
                }
            } finally {
                if (mounted) setLoadingOds(false);
            }
        };

        fetchOds();
        return () => { mounted = false; };
    }, []);

    const nameOf = (o) => o?.nombre || o?.name || o?.title || o?.titulo || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (loadingOds) {
            setError('Aún se están cargando los ODS. Espere por favor.');
            return;
        }
        if (!fin) {
            setError('Debe seleccionar un Objetivo de Desarrollo (ODS).');
            return;
        }

        try {
            const payload = {
                proyecto: project.proyecto_id,
                fin: fin,
                proposito,
            };
            await api.post('/investment-projects/marcos-logicos/', payload);
            onSave();
        } catch (err) {
            setError(err.message || 'Ocurrió un error al crear el Marco Lógico.');
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-80 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold dark:text-white">Marco Lógico para "{project.nombre}"</h3>
                    <button onClick={onClose} className="dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1"><X size={24}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="fin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Fin del Proyecto (Objetivo de Desarrollo al cual contribuye el proyecto)
                            </label>

                            {loadingOds && <p className="text-sm text-gray-500 dark:text-gray-400">Cargando ODS...</p>}
                            {odsError && <p className="text-sm text-red-500">{odsError}</p>}

                            {!loadingOds && !odsError && (
                                <select
                                    id="fin"
                                    value={selectedOdsId ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // tratar id como número si corresponde
                                        const id = val === '' ? null : (isNaN(val) ? val : Number(val));
                                        setSelectedOdsId(id);
                                        
                                        const selectedOds = odsList.find(o => (o.id || o.pk || o.ods_id) == id);
                                        setFin(selectedOds ? nameOf(selectedOds) : '');
                                    }}
                                    className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    required
                                >
                                    <option value="">-- Seleccione un Objetivo de Desarrollo --</option>
                                    {odsList.map((o) => {
                                        const id = o.id || o.pk || o.ods_id;
                                        return (
                                            <option key={id} value={id}>
                                                {nameOf(o)}
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>

                        <div>
                            <label htmlFor="proposito" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Propósito del Proyecto
                            </label>
                            <textarea
                                id="proposito"
                                value={proposito}
                                onChange={(e) => setProposito(e.target.value)}
                                rows="4"
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                placeholder="El resultado directo o el efecto esperado al finalizar el proyecto."
                                required
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loadingOds || !!odsError}>Guardar Marco
                            Lógico
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}