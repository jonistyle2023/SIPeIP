from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, RegistroAuditoriaViewSet, LoginView

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'auditorias', RegistroAuditoriaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
]
