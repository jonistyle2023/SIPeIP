from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, RegistroAuditoriaViewSet, LoginView, LogoutView, RolViewSet
from apps.authentication.views import CambioClaveView

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'auditorias', RegistroAuditoriaViewSet)
router.register(r'roles', RolViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('cambiar-clave/', CambioClaveView.as_view(), name='cambio-clave'),
]
