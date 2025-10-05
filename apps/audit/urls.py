from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditEventViewSet, ContentTypeView

router = DefaultRouter()
router.register(r'events', AuditEventViewSet, basename='auditevent')

urlpatterns = [
    path('', include(router.urls)),
    path('content-type/', ContentTypeView.as_view(), name='content-type'),
]