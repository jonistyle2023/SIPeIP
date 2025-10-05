from django.shortcuts import render
from rest_framework import viewsets
from .models import AuditEvent
from .serializers import AuditEventSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import views, response, status
from django.contrib.contenttypes.models import ContentType

# Create your views here.
class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar los eventos de auditoría.
    Permite filtrar por content_type y object_id.
    Ejemplo: /api/v1/audit/events/?content_type=10&object_id=1
    """
    queryset = AuditEvent.objects.all()
    serializer_class = AuditEventSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['content_type', 'object_id']

class ContentTypeView(views.APIView):
    """
    Devuelve el ID de un ContentType a partir del nombre del modelo.
    Ej: /api/v1/audit/content-type/?model=proyecto_inversion
    """
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