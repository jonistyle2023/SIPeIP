from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CatalogoViewSet, ItemCatalogoViewSet, EntidadViewSet, UnidadOrganizacionalViewSet, \
    PeriodoPlanificacionViewSet
)

router = DefaultRouter()
router.register(r'catalogos', CatalogoViewSet, basename='catalogo')
router.register(r'items-catalogo', ItemCatalogoViewSet, basename='itemcatalogo')
router.register(r'entidades', EntidadViewSet, basename='entidad')
router.register(r'unidades-organizacionales', UnidadOrganizacionalViewSet, basename='unidadorganizacional')
router.register(r'periodos', PeriodoPlanificacionViewSet, basename='periodo')

urlpatterns = [
    path('', include(router.urls)),
]