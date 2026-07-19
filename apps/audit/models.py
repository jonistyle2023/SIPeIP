from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# Create your models here.
class AuditEvent(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Usuario"
    )
    event_type = models.CharField(
        max_length=100,
        verbose_name="Tipo de Evento"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha y Hora"
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name="Dirección IP"
    )
    user_agent = models.CharField(max_length=500, blank=True, default='', verbose_name="User-Agent")
    request_method = models.CharField(max_length=10, blank=True, default='', verbose_name="Método HTTP")
    request_path = models.CharField(max_length=255, blank=True, default='', verbose_name="Ruta")
    success = models.BooleanField(default=True, verbose_name="Éxito")
    details = models.JSONField(verbose_name="Detalles del Evento")

    # Campos para la relación genérica. Nulos para permitir eventos sin un
    # objeto de dominio asociado (login, logout, intentos fallidos, etc.).
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        verbose_name = "Evento de Auditoría"
        verbose_name_plural = "Eventos de Auditoría"
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.event_type} por {self.user} en {self.timestamp.strftime("%Y-%m-%d %H:%M")}'