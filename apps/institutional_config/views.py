from rest_framework import viewsets, permissions
from .models import Catalogo, ItemCatalogo, Entidad, UnidadOrganizacional, PeriodoPlanificacion
from .serializers import (
    CatalogoSerializer, ItemCatalogoSerializer, EntidadSerializer, UnidadOrganizacionalSerializer, \
    PeriodoPlanificacionSerializer
)
from apps.audit.mixins import AuditedModelViewSetMixin
from apps.authentication.permissions import IsAdmin

WRITE_ACTIONS = ('create', 'update', 'partial_update', 'destroy')


class AdminWriteMixin:
    """Lectura para cualquier usuario autenticado; escritura restringida a Administradores."""

    def get_permissions(self):
        if self.action in WRITE_ACTIONS:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]


class CatalogoViewSet(AuditedModelViewSetMixin, AdminWriteMixin, viewsets.ModelViewSet):
    queryset = Catalogo.objects.all().prefetch_related('items')
    serializer_class = CatalogoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        codigo = self.request.query_params.get('codigo')
        if codigo:
            queryset = queryset.filter(codigo=codigo)
        return queryset

class ItemCatalogoViewSet(AuditedModelViewSetMixin, AdminWriteMixin, viewsets.ModelViewSet):
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

class EntidadViewSet(AuditedModelViewSetMixin, AdminWriteMixin, viewsets.ModelViewSet):
    """
    API endpoint para la gestión de Entidades del Estado.
    """
    queryset = Entidad.objects.select_related('nivel_gobierno', 'subsector').all()
    serializer_class = EntidadSerializer


class UnidadOrganizacionalViewSet(AuditedModelViewSetMixin, AdminWriteMixin, viewsets.ModelViewSet):
    queryset = UnidadOrganizacional.objects.select_related('entidad', 'padre').all()
    serializer_class = UnidadOrganizacionalSerializer
    """
    API endpoint para la gestión de Unidades Organizacionales dentro de una Entidad.
    """
    def get_queryset(self):
        queryset = super().get_queryset()
        entidad_id = self.request.query_params.get('entidad')
        if entidad_id:
            queryset = queryset.filter(entidad_id=entidad_id, padre__isnull=True)
        return queryset

class PeriodoPlanificacionViewSet(AuditedModelViewSetMixin, AdminWriteMixin, viewsets.ModelViewSet):
    """
    API endpoint para la gestión de los Períodos de Planificación.
    """
    queryset = PeriodoPlanificacion.objects.all()
    serializer_class = PeriodoPlanificacionSerializer