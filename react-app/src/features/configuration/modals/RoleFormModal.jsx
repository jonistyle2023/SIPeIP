import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';
import {api} from "../../../shared/api/api.js";

export default function RoleFormModal({rol, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Si estamos editando, rellenar el formulario con los datos del rol
        if (rol) {
            setFormData({
                nombre: rol.nombre,
                descripcion: rol.descripcion || '',
            });
        }
    }, [rol]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Determinar si es una creación (POST) o una actualización (PUT)
        const apiCall = rol
            ? api.put(`/auth/roles/${rol.id}/`, formData)
            : api.post('/auth/roles/', formData);

        try {
            await apiCall;
            onSave(); // Llama a la función onSave para cerrar el modal y recargar los datos
        } catch (err) {
            // Muestra un mensaje de error más descriptivo
            const errorMessage = err.message.includes('{') ? "Error en los datos enviados." : err.message;
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold dark:text-white">{rol ? 'Editar Rol' : 'Nuevo Rol'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full dark:text-gray-300"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre del Rol"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            required
                        />
                        <textarea
                            name="descripcion"
                            placeholder="Descripción del Rol"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            rows="3"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center px-6 pb-2">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">{isLoading ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}