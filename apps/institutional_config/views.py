from rest_framework import viewsets, permissions
from .models import Catalogo, ItemCatalogo, Entidad, UnidadOrganizacional, PeriodoPlanificacion
from .serializers import (
    CatalogoSerializer, ItemCatalogoSerializer, EntidadSerializer, UnidadOrganizacionalSerializer, \
    PeriodoPlanificacionSerializer
)

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
    API endpoint que permite ver, crear, editar y eliminar los Ítems de un Catálogo.
    """
    queryset = ItemCatalogo.objects.all()
    serializer_class = ItemCatalogoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        catalogo_id = self.request.query_params.get('catalogo')
        if catalogo_id:
            queryset = queryset.filter(catalogo_id=catalogo_id)
        return queryset

    # permission_classes = [permissions.IsAdminUser] # Igualmente, restringir a administradores

class EntidadViewSet(viewsets.ModelViewSet):
    """
    API endpoint para la gestión de Entidades del Estado.
    """
    # select_related para optimizar la consulta a la BD, trayendo los datos
    # de las tablas relacionadas (ItemCatalogo) en una sola consulta.
    queryset = Entidad.objects.select_related('nivel_gobierno', 'subsector').all()
    serializer_class = EntidadSerializer
    # permission_classes = [permissions.IsAdminUser]


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