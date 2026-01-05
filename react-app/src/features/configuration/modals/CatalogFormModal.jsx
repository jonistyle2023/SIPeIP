import React, {useState, useEffect} from 'react';
import {X, Trash2} from 'lucide-react';

export default function CatalogFormModal({onClose, onSave, catalogToEdit, onDelete}) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '',
        activo: true,
    });
    const [error, setError] = useState('');
    const [codigosExistentes, setCodigosExistentes] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        fetch('http://127.0.0.1:8000/api/v1/config/catalogos/', {
            headers: {'Authorization': `Token ${token}`}
        })
            .then(res => res.json())
            .then(data => {
                const codigos = data.map(c => c.codigo).filter(Boolean);
                setCodigosExistentes(codigos);
            });
    }, []);

    useEffect(() => {
        if (catalogToEdit) {
            setFormData({
                nombre: catalogToEdit.nombre || '',
                descripcion: catalogToEdit.descripcion || '',
                codigo: catalogToEdit.codigo || '',
                activo: catalogToEdit.activo !== undefined ? catalogToEdit.activo : true,
            });
        }
    }, [catalogToEdit]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        try {
            const url = catalogToEdit
                ? `http://127.0.0.1:8000/api/v1/config/catalogos/${catalogToEdit.id}/`
                : 'http://127.0.0.1:8000/api/v1/config/catalogos/';
            const method = catalogToEdit ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                const data = await response.json();
                setError(data?.detail || JSON.stringify(data) || 'Error al guardar catálogo');
                return;
            }
            onSave();
        } catch (err) {
            setError('Error de red');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Está seguro de eliminar este catálogo? Esta acción no se puede deshacer.')) return;
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/config/catalogos/${catalogToEdit.id}/`, {
                method: 'DELETE',
                headers: {'Authorization': `Token ${token}`}
            });
            if (!response.ok) throw new Error("No se pudo eliminar el catálogo");
            if (onDelete) onDelete();
        } catch (error) {
            setError('Error al eliminar catálogo');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md border dark:border-slate-700">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold dark:text-white">
                        {catalogToEdit ? 'Editar Catálogo' : 'Nuevo Catálogo'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full dark:text-gray-300">
                        <X size={20}/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre del catálogo"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            required
                        />
                        <div>
                            <label className="block text-xs mb-1 dark:text-gray-300">Código del catálogo</label>
                            <select
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                className="w-full p-2 border rounded mb-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                                <option value="">-- Seleccione un código existente --</option>
                                {codigosExistentes.map(cod => (
                                    <option key={cod} value={cod}>{cod}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="codigo"
                                placeholder="O escriba un nuevo código"
                                value={formData.codigo}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                required
                            />
                        </div>
                        <input
                            type="text"
                            name="descripcion"
                            placeholder="Descripción (opcional)"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                        <label className="flex items-center space-x-2 dark:text-gray-300">
                            <input
                                type="checkbox"
                                name="activo"
                                checked={formData.activo}
                                onChange={handleChange}
                            />
                            <span>Activo</span>
                        </label>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center px-6 pb-2">{error}</p>}
                    <div className="p-4 border-t dark:border-slate-700 flex justify-between items-center">
                        <div>
                            {catalogToEdit &&
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center text-xs"
                                >
                                    <Trash2 size={16} className="mr-1"/>Eliminar
                                </button>
                            }
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-200 dark:bg-slate-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-500"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
