import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { trackingApi } from '../../shared/api/api';
import ActivityForm from './components/ActivityForm';
import ProgressUpdateForm from './components/ProgressUpdateForm';

// Componente de la tabla de actividades
const ActivitiesTable = ({ activities, onEdit, onDelete, onUpdateProgress }) => {
    return (
        <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg">
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Código</th>
                        <th scope="col" className="px-6 py-3">Actividad</th>
                        <th scope="col" className="px-6 py-3">Estado</th>
                        <th scope="col" className="px-6 py-3">Avance Real</th>
                        <th scope="col" className="px-6 py-3">Responsable</th>
                        <th scope="col" className="px-6 py-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {activities.map((activity) => (
                        <tr key={activity.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{activity.activity_code}</td>
                            <td className="px-6 py-4">{activity.name}</td>
                            <td className="px-6 py-4">{activity.reported_status}</td>
                            <td className="px-6 py-4">{activity.real_progress}%</td>
                            <td className="px-6 py-4">{activity.responsible_name || 'N/A'}</td>
                            <td className="px-6 py-4 flex items-center space-x-2">
                                <button onClick={() => onEdit(activity)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                <button onClick={() => onDelete(activity.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                <button onClick={() => onUpdateProgress(activity)} className="text-green-500 hover:text-green-700"><CheckCircle size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default function PlanningMonitoringPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [isProgressModalOpen, setProgressModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const data = await trackingApi.getActivities();
            setActivities(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleSave = () => {
        setCreateModalOpen(false);
        setUpdateModalOpen(false);
        setProgressModalOpen(false);
        fetchActivities();
    };

    const handleError = (errorMessage) => {
        setError(errorMessage);
        alert(errorMessage); // Usar un simple alert por ahora
    };

    const handleCreate = () => {
        setSelectedActivity(null);
        setCreateModalOpen(true);
    };

    const handleEdit = (activity) => {
        setSelectedActivity(activity);
        setUpdateModalOpen(true);
    };
    
    const handleUpdateProgress = (activity) => {
        setSelectedActivity(activity);
        setProgressModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
            try {
                await trackingApi.deleteActivity(id);
                fetchActivities();
            } catch (err) {
                handleError(err.message);
            }
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error && !isCreateModalOpen && !isUpdateModalOpen && !isProgressModalOpen) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Seguimiento y Control de Actividades</h1>
                <button onClick={handleCreate} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    <Plus size={20} className="mr-2" />
                    Crear Actividad
                </button>
            </div>
            
            <ActivitiesTable 
                activities={activities}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateProgress={handleUpdateProgress}
            />

            {isCreateModalOpen && (
                <ActivityForm 
                    onClose={() => setCreateModalOpen(false)} 
                    onSave={handleSave}
                    onError={handleError}
                />
            )}
            {isUpdateModalOpen && (
                <ActivityForm 
                    activity={selectedActivity}
                    onClose={() => setUpdateModalOpen(false)} 
                    onSave={handleSave}
                    onError={handleError}
                />
            )}
            {isProgressModalOpen && (
                <ProgressUpdateForm 
                    activity={selectedActivity}
                    onClose={() => setProgressModalOpen(false)} 
                    onSave={handleSave}
                    onError={handleError}
                />
            )}
        </div>
    );
}
