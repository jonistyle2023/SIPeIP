from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Objective, TrackingActivity
from .serializers import ObjectiveSerializer, TrackingActivitySerializer
from .permissions import TrackingActivityPermission
from apps.audit.mixins import AuditedModelViewSetMixin
from apps.audit.utils import log_event, serialize_instance

class ObjectiveViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [IsAuthenticated]

# Integrar la auditoria con el módulo audit
class TrackingActivityViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = TrackingActivity.objects.all()  # Añadido para que el router pueda inferir basename
    serializer_class = TrackingActivitySerializer
    permission_classes = [IsAuthenticated, TrackingActivityPermission]

    def get_queryset(self):
        return TrackingActivity.objects.filter(is_active=True).select_related('project', 'responsible')

    def perform_create(self, serializer):
        activity = serializer.save(created_by=self.request.user)
        log_event(
            user=self.request.user, request=self.request, event_type='TRACKINGACTIVITY_CREATED',
            instance=activity, details={'fields': serialize_instance(activity)}
        )

    def perform_update(self, serializer):
        before = serialize_instance(serializer.instance)
        activity = serializer.save(updated_by=self.request.user)
        after = serialize_instance(activity)
        changed_fields = {
            field: {'antes': before.get(field), 'despues': value}
            for field, value in after.items()
            if before.get(field) != value
        }
        log_event(
            user=self.request.user, request=self.request, event_type='TRACKINGACTIVITY_UPDATED',
            instance=activity, details={'changed_fields': changed_fields}
        )

    def perform_destroy(self, instance):
        # Borrado lógico: la actividad se conserva, solo se desactiva.
        instance.is_active = False
        instance.save()
        log_event(
            user=self.request.user, request=self.request, event_type='TRACKINGACTIVITY_DELETED',
            instance=instance, details={'fields': serialize_instance(instance)}
        )
