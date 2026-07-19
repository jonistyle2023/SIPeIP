from .utils import log_event, serialize_instance


class AuditedModelViewSetMixin:
    """
    Mixin para ModelViewSet (o viewsets.GenericViewSet + mixins) que registra
    automáticamente cada creación, actualización y eliminación en AuditEvent.

    Debe ir ANTES del ViewSet base en la lista de herencia:
        class MiViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet): ...

    Un ViewSet que necesite semántica distinta (ej. borrado lógico en vez de
    físico) puede seguir sobrescribiendo perform_destroy normalmente; el
    mixin solo provee el comportamiento por defecto.
    """
    # Nombres de campo adicionales a excluir del detalle auditado en este ViewSet.
    audit_exclude_fields = ()

    def _event_type(self, instance, action):
        return f'{instance.__class__.__name__.upper()}_{action}'

    def perform_create(self, serializer):
        instance = serializer.save()
        log_event(
            user=self.request.user,
            request=self.request,
            event_type=self._event_type(instance, 'CREATED'),
            instance=instance,
            details={'fields': serialize_instance(instance, self.audit_exclude_fields)},
        )

    def perform_update(self, serializer):
        before = serialize_instance(serializer.instance, self.audit_exclude_fields)
        instance = serializer.save()
        after = serialize_instance(instance, self.audit_exclude_fields)
        changed_fields = {
            field: {'antes': before.get(field), 'despues': value}
            for field, value in after.items()
            if before.get(field) != value
        }
        log_event(
            user=self.request.user,
            request=self.request,
            event_type=self._event_type(instance, 'UPDATED'),
            instance=instance,
            details={'changed_fields': changed_fields},
        )

    def perform_destroy(self, instance):
        log_event(
            user=self.request.user,
            request=self.request,
            event_type=self._event_type(instance, 'DELETED'),
            instance=instance,
            details={'fields': serialize_instance(instance, self.audit_exclude_fields)},
        )
        instance.delete()
