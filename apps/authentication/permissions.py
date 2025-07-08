from rest_framework.permissions import BasePermission, SAFE_METHODS

# --- Clases de Permisos Basadas en Roles ---

class IsAdmin(BasePermission):
    """
    Permite acceso solo a usuarios con el rol 'Administrador (Admin)' o 'Super Administrador'.
    Asumimos que estos roles se llaman así en la base de datos.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Verificamos si el usuario tiene alguno de los roles de administrador
        roles_admin = ["Administrador (Admin)", "Super Administrador"]
        return request.user.roles.filter(nombre__in=roles_admin).exists()

class IsAuditor(BasePermission):
    """
    Permite acceso de SOLO LECTURA a usuarios con el rol 'Auditor'.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # El usuario debe tener el rol de Auditor
        is_auditor = request.user.roles.filter(nombre="Auditor").exists()

        # Y el método de la petición debe ser seguro (GET, HEAD, OPTIONS)
        return is_auditor and request.method in SAFE_METHODS

class IsEditor(BasePermission):
    """
    Permite acceso a cualquier usuario que tenga uno de los roles de "Editor".
    Esta es una clase genérica. Se pueden crear clases más específicas si es necesario.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        roles_editor = [
            "Administrador de Entidad",
            "Técnico de Planificación (SNP)",
            "Revisor Institucional (SNP)",
            "Autoridad Validante (SNP/Externa)",
            "Usuario Externo (Entidad Pública)",
            "Consultor/Formulador de Proyectos"
        ]
        return request.user.roles.filter(nombre__in=roles_editor).exists()

# --- Ejemplo de Permiso a Nivel de Objeto ---

class IsOwnerOfPlan(BasePermission):
    """
    Permiso para permitir que solo el creador de un plan o un admin lo edite.
    """
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para todos los autenticados
        if request.method in SAFE_METHODS:
            return True

        # El creador del objeto puede editarlo
        # Asumimos que el objeto (ej. PlanInstitucional) tiene un campo 'creador'
        is_owner = obj.creador == request.user

        # Un admin también puede editarlo
        is_admin = request.user.roles.filter(nombre="Administrador (Admin)").exists()

        return is_owner or is_admin