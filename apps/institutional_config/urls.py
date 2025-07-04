# ==============================================================================
# ARCHIVO: apps/institutional_config/urls.py
# OBJETIVO: Definir las rutas (URLs) específicas para esta aplicación.
# NOTA: Probablemente necesites crear este archivo dentro de la carpeta 'institutional_config'.
# ==============================================================================
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CatalogoViewSet, ItemCatalogoViewSet, EntidadViewSet, UnidadOrganizacionalViewSet, \
    PeriodoPlanificacionViewSet
)

# DefaultRouter registra automáticamente las rutas para un ViewSet.
# Generará:
# /catalogos/ -> para la lista (GET) y creación (POST)
# /catalogos/{id}/ -> para detalle (GET), actualización (PUT/PATCH) y eliminación (DELETE)
router = DefaultRouter()
router.register(r'catalogos', CatalogoViewSet, basename='catalogo')
router.register(r'items-catalogo', ItemCatalogoViewSet, basename='itemcatalogo')
router.register(r'entidades', EntidadViewSet, basename='entidad')
router.register(r'unidades-organizacionales', UnidadOrganizacionalViewSet, basename='unidadorganizacional')
router.register(r'periodos', PeriodoPlanificacionViewSet, basename='periodo')

# Las URLs de la API son determinadas automáticamente por el router.
urlpatterns = [
    path('', include(router.urls)),
]