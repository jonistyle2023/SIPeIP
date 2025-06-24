from rest_framework.permissions import BasePermission

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET']:
            return True
        usuario = request.user
        if hasattr(usuario, 'roles'):
            return 'admin' in usuario.roles  # simplificado
        return False
