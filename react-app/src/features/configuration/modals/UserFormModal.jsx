import React, {useState, useEffect} from 'react';
import {X} from 'lucide-react';

export default function UserFormModal({user, onClose, onSave}) {
    const [formData, setFormData] = useState({
        nombre_usuario: '',
        password: '',
        entidad_codigo: '',
        datos_basicos: {nombre: '', apellido: ''},
        roles_ids: [],
        is_active: true,
    });
    const [allRoles, setAllRoles] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Cargar la lista de todos los roles disponibles
        const fetchRoles = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('http://127.0.0.1:8000/api/auth/roles/', {
                    headers: {'Authorization': `Token ${token}`}
                });
                const data = await response.json();
                setAllRoles(data);
            } catch (err) {
                console.error("Error fetching roles:", err);
            }
        };
        fetchRoles();

        // Si estamos editando, rellenar el formulario
        if (user) {
            setFormData({
                nombre_usuario: user.nombre_usuario,
                password: '', // La contraseña no se precarga por seguridad
                entidad_codigo: user.entidad_codigo || '',
                datos_basicos: user.datos_basicos || {nombre: '', apellido: ''},
                roles_ids: user.roles.map(r => r.id),
                is_active: user.is_active,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        if (name === 'nombre' || name === 'apellido') {
            setFormData(prev => ({...prev, datos_basicos: {...prev.datos_basicos, [name]: value}}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };

    const handleRoleChange = (roleId) => {
        setFormData(prev => {
            const newRoles = prev.roles_ids.includes(roleId)
                ? prev.roles_ids.filter(id => id !== roleId)
                : [...prev.roles_ids, roleId];
            return {...prev, roles_ids: newRoles};
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const token = localStorage.getItem('authToken');
        const url = user ? `http://127.0.0.1:8000/api/auth/usuarios/${user.id}/` : 'http://127.0.0.1:8000/api/auth/usuarios/';
        const method = user ? 'PUT' : 'POST';

        // No enviar la contraseña si está vacía durante la edición
        const body = {...formData};
        if (user && !body.password) {
            delete body.password;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(JSON.stringify(data));
            }
            onSave();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="nombre" placeholder="Nombre" value={formData.datos_basicos.nombre}
                               onChange={handleChange} className="p-2 border rounded" required/>
                        <input type="text" name="apellido" placeholder="Apellido"
                               value={formData.datos_basicos.apellido} onChange={handleChange}
                               className="p-2 border rounded" required/>
                        <input type="text" name="nombre_usuario" placeholder="Nombre de Usuario"
                               value={formData.nombre_usuario} onChange={handleChange} className="p-2 border rounded"
                               required/>
                        <input type="password" name="password"
                               placeholder={user ? "Nueva Contraseña (opcional)" : "Contraseña"}
                               value={formData.password} onChange={handleChange} className="p-2 border rounded"
                               required={!user}/>
                        <input type="text" name="entidad_codigo" placeholder="Código de Entidad"
                               value={formData.entidad_codigo} onChange={handleChange} className="p-2 border rounded"/>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Roles</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {allRoles.map(role => (
                                    <label key={role.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                        <input type="checkbox" checked={formData.roles_ids.includes(role.id)}
                                               onChange={() => handleRoleChange(role.id)}/>
                                        <span>{role.nombre}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center px-6 pb-2">{error}</p>}
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar
                        </button>
                        <button type="submit" disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400">{isLoading ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}