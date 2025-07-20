import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CatalogItemFormModal from './CatalogItemFormModal.jsx';

export default function CatalogManager() {
    const [catalogs, setCatalogs] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [items, setItems] = useState([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchCatalogs = async () => {
        setLoadingCatalogs(true);
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/config/catalogos/', { headers: { 'Authorization': `Token ${token}` } });
            if (!response.ok) throw new Error("Error al cargar catálogos");
            const data = await response.json();
            setCatalogs(data);
            if (data.length > 0) {
                handleSelectCatalog(data[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCatalogs(false);
        }
    };

    useEffect(() => {
        fetchCatalogs();
    }, []);

    const handleSelectCatalog = (catalog) => {
        setSelectedCatalog(catalog);
        setItems(catalog.items || []);
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchCatalogs();
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('¿Está seguro de eliminar este ítem? Esta acción no se puede deshacer.')) return;
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/config/items-catalogo/${itemId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` }
            });
            if (!response.ok) throw new Error("No se pudo eliminar el ítem");
            fetchCatalogs();
        } catch (error) {
            alert("Error al eliminar el ítem.");
            console.error(error);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-3">Catálogos del Sistema</h4>
                {loadingCatalogs ? <p>Cargando...</p> : (
                    <ul className="space-y-1">
                        {catalogs.map(cat => (
                            <li key={cat.id}>
                                <button onClick={() => handleSelectCatalog(cat)} className={`w-full text-left p-2 rounded text-sm ${selectedCatalog?.id === cat.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}>
                                    {cat.nombre}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                {selectedCatalog ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Ítems de: <span className="text-blue-600">{selectedCatalog.nombre}</span></h4>
                            <button onClick={() => handleOpenModal()} className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs"><Plus size={14} className="mr-1" />Nuevo Ítem</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr><th className="p-2">Nombre</th><th className="p-2">Código</th><th className="p-2">Acciones</th></tr>
                                </thead>
                                <tbody>
                                {loadingItems ? <tr><td colSpan="3" className="text-center p-4">Cargando...</td></tr> : items.map(item => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{item.nombre}</td>
                                        <td className="p-2">{item.codigo || '-'}</td>
                                        <td className="p-2 flex space-x-2">
                                            <button onClick={() => handleOpenModal(item)} className="p-1 text-blue-500 hover:text-blue-700"><Edit size={14} /></button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="p-1 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={14} />
                                            </button>                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : <p>Seleccione un catálogo para ver sus ítems.</p>}
            </div>
            {isModalOpen && <CatalogItemFormModal item={editingItem} catalogId={selectedCatalog?.id} onClose={handleCloseModal} onSave={handleSave} />}
        </div>
    );
}