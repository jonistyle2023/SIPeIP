from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import pandas as pd
from weasyprint import HTML
import datetime

from apps.tracking.models import TrackingActivity
from apps.investment_projects.models import ProyectoInversion
from apps.strategic_objectives.models import Alineacion

# Funcionalidad de reportes dentro de la aplicación
class TrackingActivityReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        report_format = request.query_params.get('format', 'json').lower()
        queryset = TrackingActivity.objects.filter(is_active=True).select_related('project', 'responsible')

        data = []
        for activity in queryset:
            data.append({
                'Código': activity.activity_code,
                'Nombre': activity.name,
                'Proyecto': activity.project.nombre,
                'Estado': activity.get_reported_status_display(),
                'Prioridad': activity.priority,
                'Responsable': activity.responsible.get_full_name() if activity.responsible else 'N/A',
                'Fecha Inicio Plan.': activity.planned_start_date,
                'Fecha Fin Plan.': activity.planned_end_date,
                'Avance Real (%)': activity.real_progress,
            })
        
        df = pd.DataFrame(data)

        if report_format == 'pdf':
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="reporte_actividades_{datetime.date.today()}.pdf"'
            html_string = f"""
            <html>
                <head><style>@page {{ size: A4 landscape; }} body {{ font-family: sans-serif; }} h1 {{ text-align: center; }} table {{ width: 100%; border-collapse: collapse; }} th, td {{ border: 1px solid #ddd; padding: 8px; font-size: 10px; }} th {{ background-color: #f2f2f2; }}</style></head>
                <body><h1>Reporte de Actividades de Seguimiento</h1><p>Generado el: {datetime.date.today().strftime('%d/%m/%Y')}</p>{df.to_html(index=False)}</body>
            </html>
            """
            HTML(string=html_string).write_pdf(response)
            return response

        elif report_format == 'csv':
            response = HttpResponse(content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="reporte_actividades_{datetime.date.today()}.csv"'
            df.to_csv(response, index=False, encoding='utf-8')
            return response

        elif report_format == 'excel':
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="reporte_actividades_{datetime.date.today()}.xlsx"'
            df.to_excel(response, index=False)
            return response

        else: # JSON
            return Response(df.to_dict(orient='records'))

# ... (Las otras vistas de reporte permanecen igual)
class ExportReportView(APIView):
    # ...
    pass

class DashboardStatsView(APIView):
    # ...
    pass
