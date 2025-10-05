from rest_framework import viewsets, permissions
from .models import Catalogo, ItemCatalogo, Entidad, UnidadOrganizacional, PeriodoPlanificacion
from .serializers import (
    CatalogoSerializer, ItemCatalogoSerializer, EntidadSerializer, UnidadOrganizacionalSerializer, \
    PeriodoPlanificacionSerializer
)
from apps.audit.utils import log_event


class CatalogoViewSet(viewsets.ModelViewSet):
    queryset = Catalogo.objects.all().prefetch_related('items')
    serializer_class = CatalogoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        codigo = self.request.query_params.get('codigo')
        if codigo:
            queryset = queryset.filter(codigo=codigo)
        return queryset
        # permission_classes = [permissions.IsAdminUser] # RESTRICCIÓN

class ItemCatalogoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para los Ítems de un Catálogo. Ahora devuelve una estructura jerárquica.
    """
    queryset = ItemCatalogo.objects.all()
    serializer_class = ItemCatalogoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        catalogo_id = self.request.query_params.get('catalogo')
        if catalogo_id:
            queryset = queryset.filter(catalogo_id=catalogo_id, padre__isnull=True)
        return queryset
    # permission_classes = [permissions.IsAdminUser] # Igualmente, restringir a administradores

class EntidadViewSet(viewsets.ModelViewSet):
    """
    API endpoint para la gestión de Entidades del Estado.
    """
    queryset = Entidad.objects.select_related('nivel_gobierno', 'subsector').all()
    serializer_class = EntidadSerializer
    # permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        # 1. Obtenemos el estado del objeto ANTES de guardarlo
        old_instance = self.get_object()
        old_data = EntidadSerializer(old_instance).data

        # 2. Guardamos el objeto con los nuevos datos
        new_instance = serializer.save()

        # 3. Construimos el JSON de detalles
        details = {
            "eventVersion": "1.0",
            "userIdentity": {
                "id": self.request.user.id,
                "username": self.request.user.username
            },
            "changedFields": {
                "nombre": {
                    "old": old_data.get('nombre'),
                    "new": new_instance.nombre
                },
                "codigo_unico": {
                    "old": old_data.get('codigo_unico'),
                    "new": new_instance.codigo_unico
                },
                "activo": {
                    "old": old_data.get('activo'),
                    "new": new_instance.activo
                }
                # Puedes añadir más campos aquí
            }
        }

        # 4. Registramos el evento de auditoría
        log_event(
            user=self.request.user,
            request=self.request,
            event_type='ENTITY_UPDATED',
            instance=new_instance,
            details=details
        )


class UnidadOrganizacionalViewSet(viewsets.ModelViewSet):
    queryset = UnidadOrganizacional.objects.select_related('entidad', 'padre').all()
    serializer_class = UnidadOrganizacionalSerializer
    """
    API endpoint para la gestión de Unidades Organizacionales dentro de una Entidad.
    """
    def get_queryset(self):
        queryset = super().get_queryset()
        entidad_id = self.request.query_params.get('entidad')
        if entidad_id:
            queryset = queryset.filter(entidad_id=entidad_id)
        return queryset
    # permission_classes = [permissions.IsAdminUser]

class PeriodoPlanificacionViewSet(viewsets.ModelViewSet):
    """
    API endpoint para la gestión de los Períodos de Planificación.
    """
    queryset = PeriodoPlanificacion.objects.all()
    serializer_class = PeriodoPlanificacionSerializer
    # permission_classes = [permissions.IsAdminUser]