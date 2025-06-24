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
        nombre_usuario = request.data.get('nombre_usuario')
        clave = request.data.get('clave')

        try:
            usuario = Usuario.objects.get(nombre_usuario=nombre_usuario)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=404)

        # Verificar si está bloqueado
        if usuario.esta_bloqueado:
            if usuario.puede_intentar_nuevamente and timezone.now() < usuario.puede_intentar_nuevamente:
                return Response({'error': 'Usuario bloqueado temporalmente. Intente más tarde.'}, status=403)
            else:
                usuario.esta_bloqueado = False
                usuario.intentos_fallidos = 0
                usuario.puede_intentar_nuevamente = None
                usuario.fecha_bloqueo = None
                usuario.save()

        # Verificación de clave usando check_password
        if not check_password(clave, usuario.clave):
            usuario.intentos_fallidos += 1

            RegistroAuditoria.objects.create(
                usuario=usuario,
                accion="Intento fallido",
                funcionalidad="Login",
                detalles="Contraseña incorrecta"
            )

            if usuario.intentos_fallidos >= self.MAX_INTENTOS:
                usuario.esta_bloqueado = True
                usuario.fecha_bloqueo = timezone.now()
                usuario.puede_intentar_nuevamente = timezone.now() + timedelta(minutes=self.BLOQUEO_MINUTOS)
                usuario.save()
                return Response({'error': 'Usuario bloqueado por múltiples intentos fallidos.'}, status=403)

            usuario.save()
            return Response({'error': 'Contraseña incorrecta.'}, status=401)

        # Login exitoso
        usuario.intentos_fallidos = 0
        usuario.ultimo_acceso = timezone.now()
        usuario.save()

        RegistroAuditoria.objects.create(
            usuario=usuario,
            accion="Login exitoso",
            funcionalidad="Login",
            detalles="Acceso correcto"
        )

        return Response({'mensaje': 'Inicio de sesión exitoso'})


class RegistroAuditoriaViewSet(viewsets.ModelViewSet):
    queryset = RegistroAuditoria.objects.all()
    serializer_class = RegistroAuditoriaSerializer
