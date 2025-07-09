from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Rutas para PND
router.register(r'pnd', views.PlanNacionalDesarrolloViewSet, basename='pnd')
router.register(r'pnd-objetivos', views.ObjetivoPNDViewSet, basename='pnd-objetivo')
router.register(r'pnd-politicas', views.PoliticaPNDViewSet, basename='pnd-politica')
router.register(r'pnd-metas', views.MetaPNDViewSet, basename='pnd-meta')
router.register(r'pnd-indicadores', views.IndicadorPNDViewSet, basename='pnd-indicador')

# Rutas para ODS
router.register(r'ods', views.ObjetivoDesarrolloSostenibleViewSet, basename='ods')
router.register(r'ods-estrategias', views.EstrategiaODSViewSet, basename='ods-estrategia')
router.register(r'ods-metas', views.MetaODSViewSet, basename='ods-meta')
router.register(r'planes-institucionales', views.PlanInstitucionalViewSet, basename='plan-institucional')
router.register(r'oei', views.ObjetivoEstrategicoInstitucionalViewSet, basename='oei')
router.register(r'planes-sectoriales', views.PlanSectorialViewSet, basename='plan-sectorial')
router.register(r'alineaciones', views.AlineacionViewSet, basename='alineacion')
router.register(r'planes-institucionales-versiones', views.PlanInstitucionalVersionViewSet, basename='plan-institucional-version')

urlpatterns = [
    path('', include(router.urls)),
    path('list-alignable-types/', views.AlignableContentTypesListView.as_view(), name='list-alignable-types'),
]
