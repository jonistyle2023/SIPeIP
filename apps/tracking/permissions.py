from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.authentication.permissions import IsAdmin, IsEditor


class TrackingActivityPermission(BasePermission):
    """
    - Administradores/Editores: pueden crear, actualizar y eliminar (lógicamente).
    - Cualquier usuario autenticado: puede ver (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return IsAdmin().has_permission(request, view) or IsEditor().has_permission(request, view)
