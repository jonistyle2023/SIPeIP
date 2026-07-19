import json

from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import AuditEvent
from .serializers import AuditEventSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import views, response, status
from django.contrib.contenttypes.models import ContentType
from apps.authentication.permissions import IsAdmin

# Create your views here.
class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar los eventos de auditoría.
    Permite filtrar por content_type y object_id.
    Ejemplo: /api/v1/audit/events/?content_type=10&object_id=1

    Acceso restringido a Administradores: el módulo de auditoría expone
    la trazabilidad completa del sistema.
    """
    queryset = AuditEvent.objects.all()
    serializer_class = AuditEventSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['content_type', 'object_id', 'user', 'event_type']

    def get_queryset(self):
        queryset = super().get_queryset()
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        if fecha_desde:
            queryset = queryset.filter(timestamp__date__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(timestamp__date__lte=fecha_hasta)
        return queryset

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request, *args, **kwargs):
        """
        Exporta a un archivo JSON descargable los eventos de auditoría que
        cumplen los mismos filtros que el listado (content_type, object_id,
        user, event_type, fecha_desde, fecha_hasta). El formato de cada
        registro está inspirado en los "Records" de AWS CloudTrail.
        """
        queryset = self.filter_queryset(self.get_queryset()).select_related('user', 'content_type')

        records = [
            {
                'eventVersion': '1.0',
                'eventId': event.id,
                'eventTime': event.timestamp.isoformat(),
                'eventType': event.event_type,
                'eventSource': f'{event.content_type.app_label}.{event.content_type.model}' if event.content_type else None,
                'sourceIPAddress': event.ip_address,
                'userAgent': event.user_agent,
                'requestMethod': event.request_method,
                'requestPath': event.request_path,
                'userIdentity': {
                    'id': event.user_id,
                    'username': getattr(event.user, 'nombre_usuario', None),
                },
                'resource': {
                    'type': event.content_type.model if event.content_type else None,
                    'id': event.object_id,
                },
                'responseElements': event.details,
                'success': event.success,
            }
            for event in queryset
        ]

        payload = {
            'exportVersion': '1.0',
            'generatedAt': timezone.now().isoformat(),
            'generatedBy': request.user.nombre_usuario,
            'recordCount': len(records),
            'Records': records,
        }

        filename = f'audit_trail_{timezone.now().strftime("%Y%m%dT%H%M%SZ")}.json'
        export_response = HttpResponse(
            json.dumps(payload, indent=2, default=str, ensure_ascii=False),
            content_type='application/json',
        )
        export_response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return export_response

class ContentTypeView(views.APIView):
    """
    Devuelve el ID de un ContentType a partir del nombre del modelo.
    Ej: /api/v1/audit/content-type/?model=proyecto_inversion

    Acceso restringido a Administradores (ver AuditEventViewSet).
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        model_name = request.query_params.get('model')
        if not model_name:
            return response.Response(
                {"error": "El parámetro 'model' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            content_type = ContentType.objects.get(model=model_name)
            return response.Response({"id": content_type.id, "model": model_name})
        except ContentType.DoesNotExist:
            return response.Response(
                {"error": f"El modelo '{model_name}' no fue encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )