# Create your models here.
from django.db import models
from django.utils import timezone

class Usuario(models.Model):
    usuarios_id = models.AutoField(primary_key=True, unique=True)
    nombre_usuario = models.CharField(max_length=150, unique=True)
    entidad_codigo = models.CharField(max_length=50, null=True, blank=True)
    roles = models.TextField()
    clave = models.CharField(max_length=128, null=True, blank=True)  # Campo para contraseña cifrada
    datos_basicos = models.JSONField()
    fecha_creacion = models.DateTimeField(default=timezone.now)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)

    # Bloque por intentos fallidos
    intentos_fallidos = models.IntegerField(default=0)
    esta_bloqueado = models.BooleanField(default=False)
    fecha_bloqueo = models.DateTimeField(null=True, blank=True)
    puede_intentar_nuevamente = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.nombre_usuario


class RegistroAuditoria(models.Model):
    registro_id = models.AutoField(primary_key=True, unique=True)
    timestamp = models.DateTimeField(default=timezone.now)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    modulo = models.CharField(max_length=100, default='Planificacion')
    funcionalidad = models.CharField(max_length=100, null=True, blank=True)
    accion = models.CharField(max_length=100, null=True, blank=True)
    entidad_afectada_tipo = models.CharField(max_length=100, null=True, blank=True)
    entidad_afectada_id = models.IntegerField(null=True, blank=True)
    detalles = models.TextField(null=True, blank=True)

    def __str__(self):
        return f'{self.usuario.nombre_usuario} - {self.accion} - {self.timestamp}'
