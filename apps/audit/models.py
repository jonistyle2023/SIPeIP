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
    details = models.JSONField(verbose_name="Detalles del Evento")

    # Campos para la relación genérica
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        verbose_name = "Evento de Auditoría"
    verbose_name_plural = "Eventos de Auditoría"
    ordering = ['-timestamp']

    def __str__(self):
        return f'{self.event_type} por {self.user} en {self.timestamp.strftime("%Y-%m-%d %H:%M")}'