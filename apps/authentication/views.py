from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from datetime import timedelta
from . import serializers
from .models import Usuario, RegistroAuditoria, Rol
from .serializers import UsuarioSerializer, RegistroAuditoriaSerializer, RolSerializer

class RolViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar Roles.
    """
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [AllowAny] # Cambiar a [IsAuthenticated, IsAdminUser] en producción

class UsuarioViewSet(viewsets.ModelViewSet):
    """
    API endpoint para la gestión completa de Usuarios.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny] # Cambiar a permisos más restrictivos

    @action(detail=True, methods=['patch'], url_path='desactivar')
    def desactivar_usuario(self, request, pk=None):
        usuario = self.get_object()
        if not usuario.is_active:
            return Response({"mensaje": "El usuario ya está desactivado."}, status=status.HTTP_400_BAD_REQUEST)
        usuario.is_active = False
        usuario.save()
        RegistroAuditoria.objects.create(usuario=usuario, accion='Desactivación', funcionalidad='Gestión de Usuarios')
        return Response({"mensaje": "Usuario desactivado correctamente."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='activar')
    def activar_usuario(self, request, pk=None):
        usuario = self.get_object()
        if usuario.is_active:
            return Response({"mensaje": "El usuario ya está activo."}, status=status.HTTP_400_BAD_REQUEST)
        usuario.is_active = True
        usuario.save()
        RegistroAuditoria.objects.create(usuario=usuario, accion='Activación', funcionalidad='Gestión de Usuarios')
        return Response({"mensaje": "Usuario activado correctamente."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='ultimo-acceso')
    def obtener_ultimo_acceso(self, request, pk=None):
        usuario = self.get_object()
        return Response({"nombre_usuario": usuario.nombre_usuario, "ultimo_acceso": usuario.ultimo_acceso})

    def perform_create(self, serializer):
        usuario = serializer.save()
        RegistroAuditoria.objects.create(usuario=usuario, accion='Crear', funcionalidad='Gestión de Usuarios', entidad_afectada_id=usuario.id)

    def perform_update(self, serializer):
        usuario = serializer.save()
        RegistroAuditoria.objects.create(usuario=usuario, accion='Actualizar', funcionalidad='Gestión de Usuarios', entidad_afectada_id=usuario.id)

    def perform_destroy(self, instance):
        RegistroAuditoria.objects.create(usuario=instance, accion='Eliminar', funcionalidad='Gestión de Usuarios', entidad_afectada_id=instance.id)
        super().perform_destroy(instance)

class LoginView(APIView):
    """
    Maneja el inicio de sesión de los usuarios.
    """
    permission_classes = [AllowAny]
    MAX_INTENTOS = 3
    BLOQUEO_MINUTOS = 5

    def post(self, request):
        nombre_usuario = request.data.get("nombre_usuario")
        password = request.data.get("clave") # Aceptamos 'clave' del frontend

        try:
            usuario = Usuario.objects.get(nombre_usuario=nombre_usuario)
        except Usuario.DoesNotExist:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        if not usuario.is_active:
            return Response({"error": "Usuario desactivado. Contacte con un administrador."}, status=status.HTTP_403_FORBIDDEN)

        if usuario.esta_bloqueado:
            tiempo_bloqueo = timezone.now() - usuario.fecha_bloqueo
            if tiempo_bloqueo < timedelta(minutes=self.BLOQUEO_MINUTOS):
                return Response({"error": "Cuenta bloqueada. Intente nuevamente más tarde."}, status=status.HTTP_403_FORBIDDEN)
            else:
                usuario.esta_bloqueado = False
                usuario.intentos_fallidos = 0
                usuario.save()

        user_authenticated = authenticate(request, username=nombre_usuario, password=password)

        if user_authenticated:
            usuario.intentos_fallidos = 0
            usuario.ultimo_acceso = timezone.now()
            usuario.save()
            token, _ = Token.objects.get_or_create(user=usuario)
            return Response({
                "mensaje": "Inicio de sesión exitoso",
                "token": token.key,
                "usuario": {"id": usuario.id, "nombre_usuario": usuario.nombre_usuario, "roles": [rol.nombre for rol in usuario.roles.all()]}
            }, status=status.HTTP_200_OK)
        else:
            usuario.intentos_fallidos += 1
            if usuario.intentos_fallidos >= self.MAX_INTENTOS:
                usuario.esta_bloqueado = True
                usuario.fecha_bloqueo = timezone.now()
            usuario.save()
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CambioClaveView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        usuario = request.user
        clave_actual = request.data.get("clave_actual")
        nueva_clave = request.data.get("nueva_clave")

        # VALIDACIÓN DE DATOS DE ENTRADA
        if not clave_actual or not nueva_clave:
            return Response({"error": "Los campos 'clave_actual' y 'nueva_clave' son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(clave_actual, usuario.password):
            return Response({"error": "La contraseña actual es incorrecta."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UsuarioSerializer()
        try:
            serializer.validate_password(nueva_clave)
        except serializers.ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)

        usuario.set_password(nueva_clave)
        usuario.save()
        RegistroAuditoria.objects.create(usuario=usuario, accion='Cambio de Clave', funcionalidad='Seguridad')
        return Response({"mensaje": "Contraseña actualizada con éxito."}, status=status.HTTP_200_OK)

class RegistroAuditoriaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint de solo lectura para consultar los registros de auditoría.
    """
    queryset = RegistroAuditoria.objects.all().order_by('-timestamp')
    serializer_class = RegistroAuditoriaSerializer
    permission_classes = [IsAuthenticated] # Proteger en producción
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['usuario__nombre_usuario', 'accion', 'modulo']
    search_fields = ['detalles', 'accion']

