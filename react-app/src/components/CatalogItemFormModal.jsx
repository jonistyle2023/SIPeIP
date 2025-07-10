import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CatalogItemFormModal({ item, catalogId, onClose, onSave }) {
    const [formData, setFormData] = useState({
        nombre: '',
        codigo: '',
        catalogo: catalogId,
        activo: true,
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            setFormData({
                nombre: item.nombre,
                codigo: item.codigo || '',
                catalogo: item.catalogo,
                activo: item.activo,
            });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const url = item ? `http://127.0.0.1:8000/api/v1/config/items-catalogo/${item.id}/` : 'http://127.0.0.1:8000/api/v1/config/items-catalogo/';
        const method = item ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(JSON.stringify(data));
            onSave();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">{item ? 'Editar Ítem' : 'Nuevo Ítem'}</h3><button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <input type="text" name="nombre" placeholder="Nombre del Ítem" value={formData.nombre} onChange={handleChange} className="w-full p-2 border rounded" required />
                        <input type="text" name="codigo" placeholder="Código (Opcional)" value={formData.codigo} onChange={handleChange} className="w-full p-2 border rounded" />
                        <label className="flex items-center space-x-2"><input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} /><span>Activo</span></label>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center px-6 pb-2">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button></div>
                </form>
            </div>
        </div>
    );
}