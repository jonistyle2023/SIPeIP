// Debe reflejar los mismos nombres de rol que apps/authentication/permissions.py::IsAdmin
const ADMIN_ROLES = [
    'Administrador (Admin)',
    'Super Administrador',
    'Administrador del Sistema de la SNP',
];

// Debe reflejar los mismos nombres de rol que apps/authentication/permissions.py::IsEditor
const EDITOR_ROLES = [
    'Administrador de Entidad',
    'Técnico de Planificación (SNP)',
    'Revisor Institucional (SNP)',
    'Autoridad Validante (SNP/Externa)',
    'Usuario Externo (Entidad Pública)',
    'Consultor/Formulador de Proyectos',
    'Editor Institucional',
];

export const isAdmin = (user) => Boolean(user?.roles?.some((rol) => ADMIN_ROLES.includes(rol)));

// Admin o Editor: los únicos roles que el backend deja escribir (crear/editar/eliminar)
// sobre proyectos de inversión. El rol Auditor es de solo lectura.
export const canWriteProjects = (user) => Boolean(
    user?.roles?.some((rol) => ADMIN_ROLES.includes(rol) || EDITOR_ROLES.includes(rol))
);
