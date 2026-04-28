from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType

from .models import Objective, TrackingActivity
from .serializers import ObjectiveSerializer, TrackingActivitySerializer
from .permissions import TrackingActivityPermission
from apps.audit.models import AuditEvent

def create_audit_event(user, instance, event_type, details):
    """Función auxiliar para crear eventos de auditoría."""
    AuditEvent.objects.create(
        user=user,
        event_type=event_type,
        details=details,
        content_type=ContentType.objects.get_for_model(instance),
        object_id=instance.pk
    )

class ObjectiveViewSet(viewsets.ModelViewSet):
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [IsAuthenticated]

# Integrar la auditoria con el módulo audit
class TrackingActivityViewSet(viewsets.ModelViewSet):
    queryset = TrackingActivity.objects.all()  # Añadido para que el router pueda inferir basename
    serializer_class = TrackingActivitySerializer
    permission_classes = [IsAuthenticated, TrackingActivityPermission]

    def get_queryset(self):
        return TrackingActivity.objects.filter(is_active=True)

    def perform_create(self, serializer):
        activity = serializer.save(created_by=self.request.user)
        details = {"message": f"Actividad de seguimiento '{activity.name}' creada.", "data": serializer.data}
        create_audit_event(self.request.user, activity, 'TRACKING_ACTIVITY_CREATED', details)

    def perform_update(self, serializer):
        activity = serializer.save(updated_by=self.request.user)
        details = {"message": f"Actividad de seguimiento '{activity.name}' actualizada.", "data": serializer.data}
        create_audit_event(self.request.user, activity, 'TRACKING_ACTIVITY_UPDATED', details)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        details = {"message": f"Actividad de seguimiento '{instance.name}' eliminada lógicamente."}
        create_audit_event(self.request.user, instance, 'TRACKING_ACTIVITY_DELETED', details)
