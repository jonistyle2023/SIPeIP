from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework import filters
from rest_framework.decorators import action

from datetime import timedelta

from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdminOrReadOnly

from django.utils import timezone
from django.contrib.auth.hashers import check_password, make_password
from django_filters.rest_framework import DjangoFilterBackend

from .serializers import UsuarioSerializer, RegistroAuditoriaSerializer
from .models import Usuario, RegistroAuditoria

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated, IsAdminOrReadOnly]

    @action(detail=True, methods=['patch'], url_path='desactivar')
    def desactivar_usuario(self, request, pk=None):
        usuario = self.get_object()
        if not usuario.esta_activo:
            return Response({"mensaje": "El usuario ya está desactivado."}, status=status.HTTP_400_BAD_REQUEST)

        usuario.esta_activo = False
        usuario.save()

        # Registro en auditoría
        RegistroAuditoriaViewSet.registrar_evento(
            usuario=usuario,
            funcionalidad='Gestión de Usuarios',
            accion='Desactivación',
            detalles='El usuario fue desactivado desde la administración.'
        )

        return Response({"mensaje": "Usuario desactivado correctamente."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='activar')
    def activar_usuario(self, request, pk=None):
        usuario = self.get_object()
        if usuario.esta_activo:
            return Response({"mensaje": "El usuario ya está activo."}, status=status.HTTP_400_BAD_REQUEST)

        usuario.esta_activo = True
        usuario.save()

        RegistroAuditoriaViewSet.registrar_evento(
            usuario=usuario,
            funcionalidad='Gestión de Usuarios',
            accion='Activación',
            detalles='El usuario fue reactivado desde la administración.'
        )

        return Response({"mensaje": "Usuario activado correctamente."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='ultimo-acceso')
    def obtener_ultimo_acceso(self, request, pk=None):
        usuario = self.get_object()
        return Response({
            "nombre_usuario": usuario.nombre_usuario,
            "ultimo_acceso": usuario.ultimo_acceso
        })

    def perform_create(self, serializer):
        instance = serializer.save()
        RegistroAuditoria.objects.create(
            usuario=instance,
            accion='Crear',
            funcionalidad='Gestión de Usuarios',
            entidad_afectada_tipo='Usuario',
            entidad_afectada_id=instance.usuarios_id,
            detalles='Se creó un nuevo usuario',
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        RegistroAuditoria.objects.create(
            usuario=instance,
            accion='Actualizar',
            funcionalidad='Gestión de Usuarios',
            entidad_afectada_tipo='Usuario',
            entidad_afectada_id=instance.usuarios_id,
            detalles='Se actualizó el usuario',
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        RegistroAuditoria.objects.create(
            usuario=instance,
            accion='Eliminar',
            funcionalidad='Gestión de Usuarios',
            entidad_afectada_tipo='Usuario',
            entidad_afectada_id=instance.usuarios_id,
            detalles='Se eliminó el usuario',
        )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LoginView(APIView):
    MAX_INTENTOS = 3
    BLOQUEO_MINUTOS = 5

    def post(self, request):
        data = request.data

        nombre_usuario = data.get("nombre_usuario")
        clave = data.get("clave")

        try:
            usuario = Usuario.objects.get(nombre_usuario=nombre_usuario)
        except Usuario.DoesNotExist:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        # Verificar si está inactivo
        if not usuario.esta_activo:
            return Response({"error": "Usuario desactivado. Contacte con un administrador."}, status=status.HTTP_403_FORBIDDEN)

        # Verificar si está bloqueado
        if usuario.esta_bloqueado:
            tiempo_transcurrido = timezone.now() - usuario.fecha_bloqueo if usuario.fecha_bloqueo else timedelta(minutes=0)
            if tiempo_transcurrido < timedelta(minutes=self.BLOQUEO_MINUTOS):
                return Response({"error": "Cuenta bloqueada. Intente nuevamente más tarde."}, status=status.HTTP_403_FORBIDDEN)
            else:
                # Desbloquear automáticamente después del tiempo
                usuario.esta_bloqueado = False
                usuario.intentos_fallidos = 0
                usuario.fecha_bloqueo = None
                usuario.save()

        # Validar contraseña
        if not check_password(clave, usuario.clave):
            usuario.intentos_fallidos += 1

            # Registrar intento fallido
            RegistroAuditoriaViewSet.registrar_evento(
                usuario=usuario,
                funcionalidad='Login',
                accion='Intento fallido'
            )

            if usuario.intentos_fallidos >= self.MAX_INTENTOS:
                usuario.esta_bloqueado = True
                usuario.fecha_bloqueo = timezone.now()
                usuario.save()

                # Registrar cuenta bloqueada
                RegistroAuditoriaViewSet.registrar_evento(
                    usuario=usuario,
                    funcionalidad='Login',
                    accion='Cuenta bloqueada'
                )

                return Response({"error": "Cuenta bloqueada por múltiples intentos fallidos."}, status=status.HTTP_403_FORBIDDEN)

            usuario.save()
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        # Si la contraseña es correcta:
        usuario.intentos_fallidos = 0
        usuario.ultimo_acceso = timezone.now()
        usuario.save()

        # Aquí deberías generar token o sesión
        return Response({"mensaje": "Inicio de sesión exitoso"}, status=status.HTTP_200_OK)


class RegistroAuditoriaViewSet(viewsets.ModelViewSet):
    queryset = RegistroAuditoria.objects.all().order_by('-timestamp')
    serializer_class = RegistroAuditoriaSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['usuario__nombre_usuario', 'accion', 'modulo']
    search_fields = ['usuario__nombre_usuario', 'accion', 'modulo', 'entidad_afectada_tipo']

    @staticmethod
    def registrar_evento(usuario, funcionalidad, accion, detalles=None, modulo='Autenticacion', entidad_tipo=None, entidad_id=None):
        RegistroAuditoria.objects.create(
            usuario=usuario,
            funcionalidad=funcionalidad,
            accion=accion,
            detalles=detalles,
            modulo=modulo,
            entidad_afectada_tipo=entidad_tipo,
            entidad_afectada_id=entidad_id
        )

class CambioClaveView(APIView):
    def post(self, request):
        data = request.data
        nombre_usuario = data.get("nombre_usuario")
        clave_actual = data.get("clave_actual")
        nueva_clave = data.get("nueva_clave")

        if not (nombre_usuario and clave_actual and nueva_clave):
            return Response({"error": "Todos los campos son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(nombre_usuario=nombre_usuario)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if not check_password(clave_actual, usuario.clave):
            return Response({"error": "La contraseña actual es incorrecta."}, status=status.HTTP_403_FORBIDDEN)

        # Validación de nueva clave
        if len(nueva_clave) < 8 or not any(c.isupper() for c in nueva_clave):
            return Response(
                {"error": "La nueva clave debe tener al menos 8 caracteres y una letra mayúscula."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Actualizar clave
        usuario.clave = make_password(nueva_clave)
        usuario.save()

        # Registrar en auditoría
        RegistroAuditoriaViewSet.registrar_evento(
            usuario=usuario,
            funcionalidad='Cambio de Clave',
            accion='Cambio de contraseña exitoso',
            detalles='El usuario cambió su contraseña correctamente.'
        )

        return Response({"mensaje": "Contraseña actualizada con éxito."}, status=status.HTTP_200_OK)

