from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from datetime import timedelta

from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdminOrReadOnly

from django.utils import timezone
from django.contrib.auth.hashers import check_password

from .serializers import UsuarioSerializer, RegistroAuditoriaSerializer
from .models import Usuario, RegistroAuditoria

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]  # [IsAuthenticated, IsAdminOrReadOnly]

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
    queryset = RegistroAuditoria.objects.all()
    serializer_class = RegistroAuditoriaSerializer

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

