from django.contrib.contenttypes.models import ContentType
from .models import AuditEvent

def log_event(user, request, event_type, instance, details):
    """
    Crea un registro de auditoría.
    - user: El usuario que realiza la acción.
    - request: El objeto request de Django (para obtener la IP).
    - event_type: Un string que describe el evento (ej: 'ENTITY_UPDATED').
    - instance: La instancia del modelo que fue modificada.
    - details: Un diccionario con los detalles del evento en formato JSON.
    """
    # Obtener la IP del request
    ip_address = request.META.get('REMOTE_ADDR')

    AuditEvent.objects.create(
        user=user,
        event_type=event_type,
        ip_address=ip_address,
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.pk,
        details=details
    )