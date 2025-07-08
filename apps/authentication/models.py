from django.db import models
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

# MODELO PARA ROLES
class Rol(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

# MODELO DE USUARIO PERSONALIZADO
class UsuarioManager(BaseUserManager):
    def create_user(self, nombre_usuario, password=None, **extra_fields):
        if not nombre_usuario:
            raise ValueError('El nombre de usuario es obligatorio')
        user = self.model(nombre_usuario=nombre_usuario, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, nombre_usuario, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(nombre_usuario, password, **extra_fields)

# MODELO DE USUARIO MODIFICADO PARA HEREDAR DE DJANGO
class Usuario(AbstractBaseUser, PermissionsMixin):
    nombre_usuario = models.CharField(max_length=150, unique=True)
    entidad_codigo = models.CharField(max_length=50, null=True, blank=True)
    roles = models.ManyToManyField(Rol, blank=True, related_name="usuarios")
    datos_basicos = models.JSONField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)
    intentos_fallidos = models.IntegerField(default=0)
    esta_bloqueado = models.BooleanField(default=False)
    fecha_bloqueo = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = UsuarioManager()

    USERNAME_FIELD = 'nombre_usuario'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'authentication_usuario'
    def __str__(self):
        return self.nombre_usuario

# Esta función crea automáticamente un Token cada vez que se crea un nuevo Usuario.
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

class RegistroAuditoria(models.Model):
    registro_id = models.AutoField(primary_key=True, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    modulo = models.CharField(max_length=100, default='Planificacion')
    funcionalidad = models.CharField(max_length=100, default='General')
    accion = models.CharField(max_length=100, default='Desconocido')
    entidad_afectada_tipo = models.CharField(max_length=100, null=True, blank=True)
    entidad_afectada_id = models.IntegerField(null=True, blank=True)
    detalles = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'registro_auditoria'