import React, {useState} from 'react';
import {api} from '../../shared/api/api.js';
import {X, CheckCircle, XCircle} from 'lucide-react';

export default function DictamenStatusModal({dictamen, action, onClose, onSave}) {
    const [observaciones, setObservaciones] = useState('');
    const [error, setError] = useState('');

    const isApproving = action === 'aprobar';
    const title = isApproving ? 'Aprobar Dictamen' : 'Rechazar Dictamen';
    const Icon = isApproving ? CheckCircle : XCircle;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post(`/investment-projects/dictamenes/${dictamen.dictamen_id}/${action}/`, {observaciones});
            onSave();
        } catch (err) {
            setError(err.message || `Error al ${action} el dictamen.`);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center dark:text-white">
                        <Icon className={`mr-2 ${isApproving ? 'text-green-500' : 'text-red-500'}`}/>
                        {title}
                    </h3>
                    <button onClick={onClose} className="dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full p-1"><X/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proyecto</p>
                            <p className="text-sm bg-gray-100 dark:bg-slate-700 dark:text-white p-2 rounded mt-1">{dictamen.proyecto_nombre}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Observaciones {isApproving ? '(Opcional)' : '(Requerido)'}
                            </label>
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows="4"
                                className="w-full p-2 border rounded mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                placeholder="Añade una justificación para tu decisión..."
                                required={!isApproving}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-center pb-4">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar
                        </button>
                        <button type="submit"
                                className={`px-4 py-2 text-white rounded ${isApproving ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {isApproving ? 'Aprobar' : 'Rechazar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}