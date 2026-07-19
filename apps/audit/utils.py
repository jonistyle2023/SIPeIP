from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from .models import AuditEvent

# Campos que nunca deben quedar registrados en texto plano en el detalle de un evento.
SENSITIVE_FIELD_NAMES = {'password'}


def get_client_ip(request):
    """
    Obtiene la IP del cliente para el registro de auditoría.

    Por defecto usa siempre REMOTE_ADDR (la conexión TCP real), que un
    cliente no puede falsificar. Solo se confía en X-Forwarded-For cuando
    settings.TRUST_PROXY_HEADERS está explícitamente activado (ej. detrás
    de un balanceador/reverse proxy propio) — de lo contrario cualquier
    cliente podría enviar ese header y falsear la IP que queda auditada.
    """
    if getattr(settings, 'TRUST_PROXY_HEADERS', False):
        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def serialize_instance(instance, exclude=()):
    """
    Representa los campos locales (no M2M) de una instancia como un dict de
    strings apto para JSONField, usando el id crudo en los campos FK
    (evita disparar consultas adicionales para resolver el objeto relacionado).
    """
    exclude_names = SENSITIVE_FIELD_NAMES | set(exclude)
    result = {}
    for field in instance._meta.fields:
        if field.attname in exclude_names or field.name in exclude_names:
            continue
        value = getattr(instance, field.attname)
        result[field.attname] = str(value) if value is not None else None
    return result


def log_event(user, request, event_type, instance=None, details=None, success=True):
    """
    Crea un registro de auditoría.
    - user: El usuario que realiza la acción (puede ser None, ej. login fallido).
    - request: El objeto request de Django (para IP, user-agent, método y ruta).
    - event_type: Un string que describe el evento (ej: 'ENTITY_UPDATED').
    - instance: La instancia del modelo afectada, si aplica (puede ser None).
    - details: Un diccionario con los detalles del evento en formato JSON.
    - success: Si la acción se completó correctamente (False para intentos fallidos).
    """
    AuditEvent.objects.create(
        user=user if (user and getattr(user, 'is_authenticated', False)) else None,
        event_type=event_type,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
        request_method=request.method,
        request_path=request.path,
        success=success,
        content_type=ContentType.objects.get_for_model(instance) if instance is not None else None,
        object_id=instance.pk if instance is not None else None,
        details=details if details is not None else {},
    )
