from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, RegistroAuditoriaViewSet, LoginView
from apps.authentication.views import CambioClaveView

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'auditorias', RegistroAuditoriaViewSet)
router.register(r'auditoria', RegistroAuditoriaViewSet, basename='auditoria')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('cambiar-clave/', CambioClaveView.as_view(), name='cambio-clave'),
]
