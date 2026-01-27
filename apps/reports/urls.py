from django.urls import path
from .views import ExportReportView, DashboardStatsView

urlpatterns = [
    path('export/', ExportReportView.as_view(), name='export-report'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]