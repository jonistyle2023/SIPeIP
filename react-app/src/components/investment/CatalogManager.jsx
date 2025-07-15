import React, {useState, useEffect} from 'react';
import {Plus, Tag, Edit, Trash2} from 'lucide-react';
import {api} from '../../api/api';

const CatalogItem = ({catalog, onEdit, onDelete}) => (
    <div key={catalog.catalogo_id} className="bg-white rounded-md shadow-sm p-3 flex justify-between items-center">
        <span>{catalog.nombre}</span>
        <div>
            <button onClick={() => onEdit(catalog)} className="text-blue-500 hover:text-blue-700 mr-2"><Edit size={16}/>
            </button>
            <button onClick={() => onDelete(catalog.catalogo_id)} className="text-red-500 hover:text-red-700"><Trash2
                size={16}/></button>
        </div>
    </div>
);

const CatalogFormModal = ({isOpen, onClose, onSubmit, initialCatalog}) => {
    const [catalogName, setCatalogName] = useState(initialCatalog?.nombre || '');

    useEffect(() => {
        if (initialCatalog) {
            setCatalogName(initialCatalog.nombre);
        } else {
            setCatalogName('');
        }
    }, [initialCatalog]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({nombre: catalogName, catalogo_id: initialCatalog?.catalogo_id});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">{initialCatalog ? 'Editar Catálogo' : 'Crear Nuevo Catálogo'}</h2>
                <input
                    type="text"
                    className="w-full p-2 border rounded-md mb-3"
                    placeholder="Nombre del catálogo"
                    value={catalogName}
                    onChange={(e) => setCatalogName(e.target.value)}
                />
                <div className="flex justify-end">
                    <button onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mr-2">Cancelar
                    </button>
                    <button onClick={handleSubmit}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">{initialCatalog ? 'Guardar' : 'Crear'}</button>
                </div>
            </div>
        </div>
    );
};

export default function CatalogManager() {
    const [catalogs, setCatalogs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCatalog, setEditingCatalog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCatalogs = useCallback(() => {
        setLoading(true);
        api.get('/config/catalogos/')
            .then(data => {
                setCatalogs(data.results);
                setLoading(false);
            })
            .catch(err => {
                setError('Error al cargar los catálogos.');
                setLoading(false);
                console.error(err);
            });
    }, []);

    useEffect(() => {
        fetchCatalogs();
    }, [fetchCatalogs]);

    const handleCreateCatalog = (newCatalog) => {
        api.post('/config/catalogos/', newCatalog)
            .then(() => {
                fetchCatalogs();
                setIsModalOpen(false);
            })
            .catch(err => {
                setError('Error al crear el catálogo.');
                console.error(err);
            });
    };

    const handleEditCatalog = (catalogToUpdate) => {
        api.put(`/config/catalogos/${catalogToUpdate.catalogo_id}/`, {nombre: catalogToUpdate.nombre})
            .then(() => {
                fetchCatalogs();
                setEditingCatalog(null);
                setIsModalOpen(false);
            })
            .catch(err => {
                setError('Error al editar el catálogo.');
                console.error(err);
            });
    };

    const handleDeleteCatalog = (idToDelete) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este catálogo?')) {
            api.delete(`/config/catalogos/${idToDelete}/`)
                .then(() => {
                    fetchCatalogs();
                })
                .catch(err => {
                    setError('Error al eliminar el catálogo.');
                    console.error(err);
                });
        }
    };

    const openModalForCreate = () => {
        setEditingCatalog(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (catalog) => {
        setEditingCatalog(catalog);
        setIsModalOpen(true);
    };

    const handleModalSubmit = (catalogData) => {
        if (editingCatalog) {
            handleEditCatalog(catalogData);
        } else {
            handleCreateCatalog(catalogData);
        }
    };

    if (loading) return <div>Cargando catálogos...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold"><Tag className="mr-2"/> Gestión de Catálogos</h2>
                <button onClick={openModalForCreate}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center">
                    <Plus className="mr-2"/> Nuevo Catálogo
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogs.map(catalog => (
                    <CatalogItem key={catalog.catalogo_id} catalog={catalog} onEdit={openModalForEdit}
                                 onDelete={handleDeleteCatalog}/>
                ))}
            </div>

            <CatalogFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialCatalog={editingCatalog}
            />
        </div>
    );
}