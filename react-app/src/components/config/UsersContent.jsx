import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, UserX, UserCog, Plus, Edit, Trash2, ShieldCheck, ShieldAlert, KeyRound, Search, CheckCircle, XCircle, LogIn, Lock, Layers } from 'lucide-react';
import UserFormModal from '../UserFormModal';

// Componente para las tarjetas de KPI
const KpiCard = ({title, value, icon: Icon, color}) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${color}`}>
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 mr-4">
                <Icon className="h-6 w-6 text-gray-600"/>
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{title}</p>
            </div>
        </div>
    </div>
);

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState('gestion');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Función para obtener los usuarios del backend
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://127.0.0.1:8000/api/auth/usuarios/', {
                headers: {'Authorization': `Token ${token}`}
            });
            if (!response.ok) throw new Error('No se pudo obtener la lista de usuarios.');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = () => {
        handleCloseModal();
        fetchUsers(); // Recargar la lista de usuarios después de guardar
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`http://127.0.0.1:8000/api/auth/usuarios/${userId}/`, {
                    method: 'DELETE',
                    headers: {'Authorization': `Token ${token}`}
                });
                if (!response.ok) throw new Error('No se pudo eliminar el usuario.');
                fetchUsers();
            } catch (err) {
                alert(err.message);
            }
        }
    }

    // Calculamos los KPIs a partir de la lista de usuarios
    const kpis = useMemo(() => {
        const total = users.length;
        const activos = users.filter(u => u.is_active).length;
        const administradores = users.filter(u => u.roles.some(r => r.nombre.toLowerCase().includes('admin'))).length;
        const pendientes = total - activos;
        return {total, activos, pendientes, administradores};
    }, [users]);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-8">
            {/* --- NUEVA SECCIÓN: Flujo de Autenticación SSO --- */}
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center"><LogIn className="mr-3 text-blue-500"/>Flujo
                    de Autenticación SSO</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                        <h4 className="font-bold text-red-800 mb-3">Sistema Actual</h4>
                        <ul className="space-y-2 text-sm text-red-700">
                            <li className="flex items-start"><XCircle size={16} className="mr-2 mt-0.5 flex-shrink-0"/>Página
                                principal con módulos separados
                            </li>
                            <li className="flex items-start"><XCircle size={16} className="mr-2 mt-0.5 flex-shrink-0"/>Login
                                independiente por módulo
                            </li>
                            <li className="flex items-start"><XCircle size={16} className="mr-2 mt-0.5 flex-shrink-0"/>Múltiples
                                credenciales requeridas
                            </li>
                        </ul>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                        <h4 className="font-bold text-green-800 mb-3">Propuesta SSO</h4>
                        <ul className="space-y-2 text-sm text-green-700">
                            <li className="flex items-start"><CheckCircle size={16}
                                                                          className="mr-2 mt-0.5 flex-shrink-0"/>Ingreso
                                centralizado único
                            </li>
                            <li className="flex items-start"><CheckCircle size={16}
                                                                          className="mr-2 mt-0.5 flex-shrink-0"/>Autenticación
                                Single Sign On
                            </li>
                            <li className="flex items-start"><CheckCircle size={16}
                                                                          className="mr-2 mt-0.5 flex-shrink-0"/>Módulos
                                basados en permisos de rol
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN ACTUALIZADA: Roles y Permisos --- */}
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center"><Lock className="mr-3 text-blue-500"/>Roles
                    y Permisos del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card Administrador */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center mb-4"><ShieldCheck className="text-purple-500 mr-3"
                                                                             size={24}/><h3
                            className="font-bold text-lg">Administrador</h3></div>
                        <p className="text-xs text-gray-500 mb-4">Super Admin / Admin TI</p>
                        <div className="space-y-3 text-sm">
                            <div><h5 className="font-semibold">Gestión de Usuarios</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>CRUD
                                completo</p></div>
                            <div><h5 className="font-semibold">Config. Institucional</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>Acceso
                                completo</p></div>
                            <div><h5 className="font-semibold">Gestión Objetivos</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>Configuración
                                sistema</p></div>
                            <div><h5 className="font-semibold">Proyectos Inversión</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>Config.
                                reglas y flujos</p></div>
                        </div>
                    </div>
                    {/* Card Editor */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center mb-4"><Edit className="text-blue-500 mr-3" size={24}/><h3
                            className="font-bold text-lg">Editor</h3></div>
                        <p className="text-xs text-gray-500 mb-4">Usuarios Funcionales</p>
                        <div className="space-y-3 text-sm">
                            <div className="p-2 bg-blue-50 rounded-md text-blue-800">Admin de Entidad</div>
                            <div className="p-2 bg-blue-50 rounded-md text-blue-800">Técnico Planificación</div>
                            <div className="p-2 bg-blue-50 rounded-md text-blue-800">Revisor Institucional</div>
                            <div className="p-2 bg-blue-50 rounded-md text-blue-800">Usuario Externo</div>
                            <div className="p-2 bg-blue-50 rounded-md text-blue-800">Consultor/Formulador</div>
                            <div><h5 className="font-semibold mt-2">Acceso Variable</h5><p
                                className="flex items-center text-gray-600"><ShieldAlert size={14}
                                                                                         className="mr-2 text-yellow-500"/>Según
                                rol específico</p></div>
                            <div><h5 className="font-semibold">Reportes</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>Generación
                                y visualización</p></div>
                        </div>
                    </div>
                    {/* Card Auditor */}
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center mb-4"><Search className="text-gray-500 mr-3" size={24}/><h3
                            className="font-bold text-lg">Auditor</h3></div>
                        <p className="text-xs text-gray-500 mb-4">Control Interno</p>
                        <div className="space-y-3 text-sm">
                            <div><h5 className="font-semibold">Acceso de Lectura</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>Solo
                                consulta</p></div>
                            <div><h5 className="font-semibold">Reportes Auditoría</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>Generación
                                completa</p></div>
                            <div><h5 className="font-semibold">Bitácoras</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>Acceso
                                historial</p></div>
                            <div><h5 className="font-semibold">Versiones</h5><p
                                className="flex items-center text-gray-600"><CheckCircle size={14}
                                                                                         className="mr-2 text-green-500"/>Consulta
                                versiones</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Gestión de Usuarios */}
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center"><Users className="mr-3 text-blue-500"/>Gestión
                    de Usuarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <KpiCard title="Total Usuarios" value={kpis.total} icon={Users} color="border-blue-500"/>
                    <KpiCard title="Usuarios Activos" value={kpis.activos} icon={UserCheck} color="border-green-500"/>
                    <KpiCard title="Pendientes" value={kpis.pendientes} icon={UserX} color="border-yellow-500"/>
                    <KpiCard title="Administradores" value={kpis.administradores} icon={UserCog}
                             color="border-purple-500"/>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Lista de Usuarios</h4>
                        <button onClick={() => handleOpenModal()}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <Plus size={16} className="mr-2"/>
                            Nuevo Usuario
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-3">Usuario</th>
                                <th className="p-3">Rol</th>
                                <th className="p-3">Entidad</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                                        <div>
                                            <p className="font-medium text-gray-800">{user.datos_basicos?.nombre || user.nombre_usuario}</p>
                                            <p className="text-gray-500">{user.nombre_usuario}</p>
                                        </div>
                                    </td>
                                    <td className="p-3">{user.roles.map(r => r.nombre).join(', ')}</td>
                                    <td className="p-3">{user.entidad_codigo || 'N/A'}</td>
                                    <td className="p-3">
                      <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                                    </td>
                                    <td className="p-3 flex items-center space-x-2">
                                        <button onClick={() => handleOpenModal(user)}
                                                className="p-1 text-blue-500 hover:text-blue-700"><Edit size={16}/>
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)}
                                                className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && <UserFormModal user={editingUser} onClose={handleCloseModal} onSave={handleSaveUser}/>}
        </div>
    );
}