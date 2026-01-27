from django.urls import path
from .views import ExportReportView, DashboardStatsView, TrackingActivityReportView

urlpatterns = [
    path('export/', ExportReportView.as_view(), name='export-report'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('tracking-activities/', TrackingActivityReportView.as_view(), name='report-tracking-activities'),
]
