import React from 'react';
import { useForm } from 'react-hook-form';
import { trackingApi } from '../../../shared/api/api';

const ProgressUpdateForm = ({ activity, onSave, onClose, onError }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            real_progress: activity.real_progress,
            real_start_date: activity.real_start_date,
            real_end_date: activity.real_end_date,
        }
    });

    const onSubmit = async (data) => {
        try {
            await trackingApi.patchActivity(activity.id, data);
            onSave();
        } catch (error) {
            onError(error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Registrar Avance: {activity.name}</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="real_progress" className="block text-sm font-medium">Avance Real (%)</label>
                        <input 
                            type="number" 
                            {...register('real_progress', { 
                                required: 'El avance es obligatorio',
                                min: { value: 0, message: 'El valor no puede ser negativo' },
                                max: { value: 100, message: 'El valor no puede superar el 100%' }
                            })} 
                            className="mt-1 block w-full rounded-md dark:bg-slate-700"
                        />
                        {errors.real_progress && <p className="text-red-500 text-xs mt-1">{errors.real_progress.message}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium">Fecha Inicio Real</label>
                            <input type="date" {...register('real_start_date')} className="mt-1 block w-full rounded-md dark:bg-slate-700"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fecha Fin Real</label>
                            <input type="date" {...register('real_end_date')} className="mt-1 block w-full rounded-md dark:bg-slate-700"/>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">Guardar Avance</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProgressUpdateForm;
