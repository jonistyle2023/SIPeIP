import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../shared/api/api';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, List, GitMerge } from 'lucide-react';
import CatalogItemFormModal from './CatalogItemFormModal';
import CatalogFormModal from './CatalogFormModal';
import ItemTable from './ItemTable'; // <-- Importa la nueva tabla

// --- SUB-COMPONENTE RECURSIVO PARA ÁRBOL DE ÍTEMS ---
const ItemNode = ({ item, level = 0, onAddItem, onEditItem, onDeleteItem }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ marginLeft: `${level * 20}px` }}>
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center">
                    {item.hijos && item.hijos.length > 0 && (
                        <button onClick={() => setIsOpen(!isOpen)} className="p-1">
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}
                    <span className="ml-2">{item.nombre} ({item.codigo || 'S/C'})</span>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onAddItem(null, item)} title="Añadir sub-ítem" className="p-1 text-green-500"><Plus size={14}/></button>
                    <button onClick={() => onEditItem(item, null)} title="Editar ítem" className="p-1 text-blue-500"><Edit size={14}/></button>
                    <button onClick={() => onDeleteItem(item.id)} title="Eliminar ítem" className="p-1 text-red-500"><Trash2 size={14}/></button>
                </div>
            </div>
            {isOpen && item.hijos && item.hijos.map(child => (
                <ItemNode key={child.id} item={child} level={level + 1} onAddItem={onAddItem} onEditItem={onEditItem} onDeleteItem={onDeleteItem} />
            ))}
        </div>
    );
};

export default function CatalogManager() {
    const [catalogs, setCatalogs] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [items, setItems] = useState([]); // Árbol de ítems
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('tree'); // 'tree' o 'table'

    // Estados de los modales
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [parentItem, setParentItem] = useState(null);
    const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
    const [catalogToEdit, setCatalogToEdit] = useState(null);

    // --- Carga de catálogos ---
    const fetchCatalogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/config/catalogos/');
            setCatalogs(data);
            if (data.length > 0) {
                setSelectedCatalog(data[0]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCatalogs();
    }, [fetchCatalogs]);

    // --- Carga de ítems jerárquicos ---
    const fetchItems = useCallback(async (catalog) => {
        if (!catalog) {
            setItems([]);
            return;
        }
        setLoading(true);
        try {
            const data = await api.get(`/config/items-catalogo/?catalogo=${catalog.id}`);
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCatalog) fetchItems(selectedCatalog);
    }, [selectedCatalog, fetchItems]);

    const handleSelectCatalog = (catalog) => {
        setSelectedCatalog(catalog);
        fetchItems(catalog);
    };

    // --- Modales para ítems jerárquicos ---
    const handleOpenItemModal = (itemToEdit = null, parent = null) => {
        setEditingItem(itemToEdit);
        setParentItem(parent);
        setIsItemModalOpen(true);
    };

    const handleSaveItem = () => {
        setIsItemModalOpen(false);
        setEditingItem(null);
        setParentItem(null);
        fetchItems(selectedCatalog);
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('¿Eliminar este ítem y todos sus sub-ítems?')) {
            await api.delete(`/config/items-catalogo/${itemId}/`);
            fetchItems(selectedCatalog);
        }
    };

    // --- Catálogo: editar/eliminar ---
    const handleEditCatalog = (catalog) => {
        setCatalogToEdit(catalog);
        setIsCatalogModalOpen(true);
    };

    const handleDeleteCatalog = async (catalog) => {
        if (!window.confirm('¿Está seguro de eliminar este catálogo? Esta acción no se puede deshacer.')) return;
        try {
            await api.delete(`/config/catalogos/${catalog.id}/`);
            await fetchCatalogs();
            setSelectedCatalog(null);
        } catch (error) {
            alert("Error al eliminar el catálogo.");
            console.error(error);
        }
    };

    const handleSaveCatalog = async () => {
        await fetchCatalogs();
        setIsCatalogModalOpen(false);
        setCatalogToEdit(null);
    };

    const handleCloseCatalogModal = () => {
        setIsCatalogModalOpen(false);
        setCatalogToEdit(null);
    };

    // --- NUEVA LÓGICA PARA APLANAR Y ORDENAR DATOS PARA LA TABLA ---
    const flattenedItems = useMemo(() => {
        const flatten = (items, level = 0) => {
            let allItems = [];
            for (const item of items) {
                allItems.push({ ...item, level });
                if (item.hijos && item.hijos.length > 0) {
                    allItems = allItems.concat(flatten(item.hijos, level + 1));
                }
            }
            return allItems;
        };
        return flatten(items);
    }, [items]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-3">Catálogos del Sistema</h4>
                {loading ? <p>Cargando...</p> : (
                    <>
                        <ul className="space-y-1">
                            {catalogs.map(cat => (
                                <li key={cat.id} className="flex items-center">
                                    <button onClick={() => handleSelectCatalog(cat)}
                                            className={`flex-1 text-left p-2 rounded text-sm ${selectedCatalog?.id === cat.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}>
                                        {cat.nombre}
                                    </button>
                                    <button
                                        onClick={() => handleEditCatalog(cat)}
                                        className="ml-2 p-1 text-blue-500 hover:text-blue-700"
                                        title="Editar catálogo"
                                    >
                                        <Edit size={16}/>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCatalog(cat)}
                                        className="ml-1 p-1 text-red-500 hover:text-red-700"
                                        title="Eliminar catálogo"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => { setIsCatalogModalOpen(true); setCatalogToEdit(null); }}
                            className="mt-4 w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        >
                            <Plus size={14} className="mr-1"/>Nuevo Catálogo
                        </button>
                    </>
                )}
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                {selectedCatalog ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="font-semibold">Jerarquía de: <span className="text-blue-600">{selectedCatalog.nombre}</span></h4>
                                {/* --- INTERRUPTOR DE VISTA --- */}
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => setViewMode('tree')} className={`px-3 py-1 text-xs flex items-center rounded-full ${viewMode === 'tree' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                        <GitMerge size={14} className="mr-1"/> Vista Jerárquica
                                    </button>
                                    <button onClick={() => setViewMode('table')} className={`px-3 py-1 text-xs flex items-center rounded-full ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                        <List size={14} className="mr-1"/> Vista de Tabla
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => handleOpenItemModal(null, null)} className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs">
                                <Plus size={14} className="mr-1"/>Nuevo Ítem Raíz
                            </button>
                        </div>

                        {/* --- RENDERIZADO CONDICIONAL DE LA VISTA --- */}
                        {loading ? <p>Cargando...</p> : (
                            viewMode === 'tree' ? (
                                <div className="space-y-1">
                                    {items.map(item => (
                                        <ItemNode
                                            key={item.id}
                                            item={item}
                                            onAddItem={handleOpenItemModal}
                                            onEditItem={(itemToEdit) => handleOpenItemModal(itemToEdit, null)}
                                            onDeleteItem={handleDeleteItem}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <ItemTable
                                    items={flattenedItems}
                                    onEditItem={(itemToEdit) => handleOpenItemModal(itemToEdit, null)}
                                    onDeleteItem={handleDeleteItem}
                                />
                            )
                        )}
                    </>
                ) : <p>Seleccione un catálogo.</p>}
            </div>

            {isItemModalOpen &&
                <CatalogItemFormModal
                    item={editingItem}
                    catalogId={selectedCatalog?.id}
                    parentItem={parentItem}
                    // Pasamos la lista aplanada para el selector de 'padre'
                    allItems={flattenedItems}
                    onClose={() => setIsItemModalOpen(false)}
                    onSave={handleSaveItem}
                />
            }
            {isCatalogModalOpen &&
                <CatalogFormModal
                    onClose={handleCloseCatalogModal}
                    onSave={handleSaveCatalog}
                    catalogToEdit={catalogToEdit}
                    onDelete={handleSaveCatalog}
                />}
        </div>
    );
}