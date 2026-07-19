from rest_framework.permissions import BasePermission, SAFE_METHODS

# Roles que actúan a nivel nacional (SNP) o de supervisión y por lo tanto no
# se restringen a una sola entidad ejecutora.
CROSS_ENTIDAD_ROLES = [
    "Administrador (Admin)", "Super Administrador", "Administrador del Sistema de la SNP",
    "Auditor",
    "Técnico de Planificación (SNP)", "Revisor Institucional (SNP)", "Autoridad Validante (SNP/Externa)",
]


def tiene_alcance_nacional(user):
    return bool(user and user.is_authenticated and user.roles.filter(nombre__in=CROSS_ENTIDAD_ROLES).exists())


def get_nested_attr(obj, path):
    """Resuelve un path 'a__b__c' sobre una instancia ya cargada (equivalente
    a un lookup de Django pero aplicado a un objeto en memoria, no a un
    queryset)."""
    for part in path.split('__'):
        if obj is None:
            return None
        obj = getattr(obj, part, None)
    return obj

# --- Permisos Basados en Roles ---

class IsAdmin(BasePermission):
    """
    Permite acceso solo a usuarios con el rol 'Administrador (Admin)' o 'Super Administrador'.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Verificamos si el usuario tiene alguno de los roles de administrador
        roles_admin = ["Administrador (Admin)", "Super Administrador", "Administrador del Sistema de la SNP"]
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
    De momento es una clase genérica. Se pueden crear clases más específicas si es necesario.
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
            "Consultor/Formulador de Proyectos",
            "Editor Institucional"
        ]
        return request.user.roles.filter(nombre__in=roles_editor).exists()

# --- Permiso a Nivel de Objeto ---

class IsOwnerOfPlan(BasePermission):
    """
    Permiso para permitir que solo el creador de un plan o un admin lo edite.
    """
    def has_object_permission(self, request, view, obj):
        # Permisos de lectura para todos los autenticados
        if request.method in SAFE_METHODS:
            return True
        # El creador del objeto puede editarlo
        is_owner = obj.creador == request.user
        # Un admin también puede editarlo
        roles_admin = ["Administrador (Admin)", "Super Administrador", "Administrador del Sistema de la SNP"]
        is_admin = request.user.roles.filter(nombre__in=roles_admin).exists()
        return is_owner or is_admin


class IsSameEntidadForWrite(BasePermission):
    """
    Restringe la escritura (create/update/destroy) a objetos que pertenecen
    a la misma entidad del usuario, salvo que el usuario tenga un rol de
    alcance nacional (ver CROSS_ENTIDAD_ROLES). La lectura nunca se
    restringe aquí — solo agrega una capa adicional sobre los permisos de
    rol ya existentes (IsAdmin | IsEditor | IsAuditor), no los reemplaza.

    El ViewSet que use este permiso debe combinarse con
    EntidadScopedWriteMixin y definir `entidad_lookup` (la ruta, estilo
    Django, desde la instancia hasta el código de su entidad dueña, ej.
    'entidad_ejecutora__codigo_unico').
    """

    def has_permission(self, request, view):
        if request.method != 'POST':
            return True
        if tiene_alcance_nacional(request.user):
            return True
        entidad_codigo = view.get_entidad_codigo_from_payload(request)
        return entidad_codigo is None or entidad_codigo == request.user.entidad_codigo

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if tiene_alcance_nacional(request.user):
            return True
        entidad_lookup = getattr(view, 'entidad_lookup', None)
        if not entidad_lookup:
            return True
        entidad_codigo = get_nested_attr(obj, entidad_lookup)
        return entidad_codigo is not None and entidad_codigo == request.user.entidad_codigo


class EntidadScopedWriteMixin:
    """
    Complemento de IsSameEntidadForWrite: resuelve el código de entidad
    dueña de un objeto nuevo a partir del payload de creación.

    Atributos de clase requeridos en el ViewSet:
    - create_entidad_field: nombre del campo del payload que referencia
      (por id) al objeto padre, o directamente a la Entidad.
    - create_entidad_model: el modelo al que apunta ese id.
    - create_entidad_lookup: ruta, estilo Django, desde ese modelo hasta
      Entidad.codigo_unico (por defecto 'codigo_unico', para cuando el
      campo ya es una FK directa a Entidad).
    """
    create_entidad_field = None
    create_entidad_model = None
    create_entidad_lookup = 'codigo_unico'

    def get_entidad_codigo_from_payload(self, request):
        if not self.create_entidad_field or not self.create_entidad_model:
            return None
        pk = request.data.get(self.create_entidad_field)
        if not pk:
            return None
        return self.create_entidad_model.objects.filter(pk=pk).values_list(
            self.create_entidad_lookup, flat=True
        ).first()