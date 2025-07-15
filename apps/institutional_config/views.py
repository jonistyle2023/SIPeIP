# OBJETIVO: Definir la lógica de la API (qué hacer para cada petición).

from rest_framework import viewsets, permissions
from .models import Catalogo, ItemCatalogo, Entidad, UnidadOrganizacional, PeriodoPlanificacion
from .serializers import (
    CatalogoSerializer, ItemCatalogoSerializer, EntidadSerializer, UnidadOrganizacionalSerializer, \
    PeriodoPlanificacionSerializer
)

# ModelViewSet porque provee el CRUD completo (GET, POST, PUT, DELETE)
# de forma automática, sin necesidad de escribir cada función por separado.

class CatalogoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver, crear, editar y eliminar Catálogos.
    Un catálogo agrupa ítems (ej. Catálogo 'SECTORES' agrupa ítems como 'Salud', 'Educación').
    NOTA: Solo los administradores pueden gestionar los catálogos
    """
    queryset = Catalogo.objects.all().prefetch_related('items') # prefetch_related optimiza la consulta anidada
    serializer_class = CatalogoSerializer
    # permission_classes = [permissions.IsAdminUser] # RESTRICCIÓN

class ItemCatalogoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver, crear, editar y eliminar los Ítems de un Catálogo.
    """
    queryset = ItemCatalogo.objects.all()
    serializer_class = ItemCatalogoSerializer
    # permission_classes = [permissions.IsAdminUser] # Igualmente, restringir a administradores

class EntidadViewSet(viewsets.ModelViewSet):
    """
    API endpoint para la gestión de Entidades del Estado.
    """
    # select_related para optimizar la consulta a la BD, trayendo los datos
    # de las tablas relacionadas (ItemCatalogo) en una sola consulta.
    queryset = Entidad.objects.select_related('nivel_gobierno', 'sector').all()
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