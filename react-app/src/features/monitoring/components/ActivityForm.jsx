import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { trackingApi } from '../../../shared/api/api';
import Select from 'react-select';

const ActivityForm = ({ activity, onSave, onClose, onError }) => {
    const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
        defaultValues: activity || {}
    });

    const [projects, setProjects] = useState([]);
    const [objectives, setObjectives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [projectsResponse, objectivesResponse] = await Promise.all([
                    trackingApi.getProjects(),
                    trackingApi.getObjectives()
                ]);

                // CORREGIDO: Acceder a la propiedad 'results' de la respuesta paginada
                const projectsList = projectsResponse.results || projectsResponse;
                const objectivesList = objectivesResponse.results || objectivesResponse;

                setProjects(projectsList.map(p => ({ value: p.proyecto_id, label: p.nombre })));
                setObjectives(objectivesList.map(o => ({ value: o.id, label: o.name })));
            } catch (error) {
                // Este error ahora solo se activará si la petición de red falla
                onError('Error al cargar datos para el formulario.');
            } finally {
                setLoading(false);
            }
        };
        loadFormData();
    }, [onError]);
    
    useEffect(() => {
        reset(activity);
    }, [activity, reset]);

    const onSubmit = async (data) => {
        try {
            const objectivesIds = data.objectives ? data.objectives.map(obj => obj.value) : [];
            const payload = {
                ...data,
                project: data.project.value,
                objectives: objectivesIds,
            };

            if (activity) {
                await trackingApi.updateActivity(activity.id, payload);
            } else {
                await trackingApi.createActivity(payload);
            }
            onSave();
        } catch (error) {
            onError(error.message);
        }
    };

    if (loading) return <div>Cargando formulario...</div>;

    return (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">{activity ? 'Editar' : 'Crear'} Actividad</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Actividad</label>
                        <input type="text" {...register('name', { required: 'El nombre es obligatorio' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-slate-700"/>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium">Proyecto</label>
                        <Controller
                            name="project"
                            control={control}
                            rules={{ required: 'Debe seleccionar un proyecto' }}
                            render={({ field }) => <Select {...field} options={projects} isDisabled={!!activity} />}
                        />
                        {errors.project && <p className="text-red-500 text-xs mt-1">{errors.project.message}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium">Objetivos</label>
                        <Controller
                            name="objectives"
                            control={control}
                            rules={{ required: 'Debe seleccionar al menos un objetivo' }}
                            render={({ field }) => <Select {...field} options={objectives} isMulti />}
                        />
                        {errors.objectives && <p className="text-red-500 text-xs mt-1">{errors.objectives.message}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium">Fecha Inicio Planificada</label>
                            <input type="date" {...register('planned_start_date', { required: 'Campo requerido' })} className="mt-1 block w-full rounded-md dark:bg-slate-700"/>
                            {errors.planned_start_date && <p className="text-red-500 text-xs mt-1">{errors.planned_start_date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fecha Fin Planificada</label>
                            <input type="date" {...register('planned_end_date', { required: 'Campo requerido' })} className="mt-1 block w-full rounded-md dark:bg-slate-700"/>
                            {errors.planned_end_date && <p className="text-red-500 text-xs mt-1">{errors.planned_end_date.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivityForm;
