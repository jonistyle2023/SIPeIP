from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ObjectiveViewSet, TrackingActivityViewSet

router = DefaultRouter()
router.register(r'objectives', ObjectiveViewSet)
router.register(r'activities', TrackingActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
