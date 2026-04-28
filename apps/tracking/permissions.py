from rest_framework.permissions import BasePermission, SAFE_METHODS

def is_in_group(user, group_name):
    """
    Verifica si un usuario pertenece a un grupo específico.
    """
    return user.groups.filter(name=group_name).exists()

class IsPlanificador(BasePermission):
    """
    Permite el acceso solo a usuarios del grupo 'Planificador'.
    """
    def has_permission(self, request, view):
        return is_in_group(request.user, 'Planificador')

class IsAprobador(BasePermission):
    """
    Permite el acceso solo a usuarios del grupo 'Aprobador'.
    """
    def has_permission(self, request, view):
        return is_in_group(request.user, 'Aprobador')

class IsAuditorOrPlanning(BasePermission):
    """
    Permite acceso de solo lectura a los grupos 'Auditoría' o 'Planificación Institucional'.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return is_in_group(request.user, 'Auditoría') or is_in_group(request.user, 'Planificación Institucional')
        return False

# Permisos por rol
class TrackingActivityPermission(BasePermission):
    """
    Permisos a nivel de vista para el ViewSet de Actividades de Seguimiento.
    - Planificadores: Pueden crear y eliminar (lógicamente).
    - Aprobadores: Pueden actualizar (parcial o total).
    - Todos los demás usuarios autenticados: Pueden ver (GET, HEAD, OPTIONS).
    - Auditores/Planificación: Tienen acceso de lectura transversal (ya cubierto por IsAuthenticated para GET).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # El método 'destroy' se mapea a DELETE
        if view.action == 'destroy':
            return is_in_group(request.user, 'Planificador')
        
        # El método 'create' se mapea a POST
        elif view.action == 'create':
            return is_in_group(request.user, 'Planificador')

        # Los métodos 'update' y 'partial_update' se mapean a PUT y PATCH
        elif view.action in ['update', 'partial_update']:
            return is_in_group(request.user, 'Aprobador')
        
        # Para 'list' y 'retrieve' (GET), cualquier usuario autenticado tiene permiso.
        elif view.action in ['list', 'retrieve', 'download_csv_report']:
            return True
            
        return False
