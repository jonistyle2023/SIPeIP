import React, {useState} from 'react';
import {X} from 'lucide-react';

export default function CatalogFormModal({onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        codigo: '', // Agregado campo codigo
        activo: true,
    });
    const [error, setError] = useState('');

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
            const response = await fetch('http://127.0.0.1:8000/api/v1/config/catalogos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                const data = await response.json();
                console.error('Detalle del error:', data);
                setError(data?.detail || JSON.stringify(data) || 'Error al crear catálogo');
                return;
            }

            onSave();
        } catch (err) {
            setError('Error de red');
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-80">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Nuevo Catálogo</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
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
                            className="w-full p-2 border rounded"
                            required
                        />
                        <input
                            type="text"
                            name="codigo"
                            placeholder="Código del catálogo"
                            value={formData.codigo}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        <input
                            type="text"
                            name="descripcion"
                            placeholder="Descripción (opcional)"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                        <label className="flex items-center space-x-2">
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
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
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
                </form>
            </div>
        </div>
    );
}
