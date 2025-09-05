from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'proyectos', views.ProyectoInversionViewSet, basename='proyecto')
router.register(r'marcos-logicos', views.MarcoLogicoViewSet, basename='marcoslogicos')
router.register(r'componentes', views.ComponenteViewSet, basename='componentes')
router.register(r'actividades', views.ActividadViewSet, basename='actividades')
router.register(r'indicadores', views.IndicadorViewSet, basename='indicadores')
router.register(r'metas', views.MetaViewSet, basename='metas')
router.register(r'arrastres', views.ArrastreInversionViewSet, basename='arrastres')
router.register(r'cronogramas', views.CronogramaValoradoViewSet, basename='cronogramas')
router.register(r'dictamenes', views.DictamenPrioridadViewSet, basename='dictamenes')
router.register(r'criterios-priorizacion', views.CriterioPriorizacionViewSet, basename='criterios-priorizacion')
router.register(r'puntuaciones', views.PuntuacionProyectoViewSet, basename='puntuaciones')

urlpatterns = [
    path('', include(router.urls)),
]