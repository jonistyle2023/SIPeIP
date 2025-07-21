from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import request
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
import pandas as pd
from weasyprint import HTML
import datetime

from apps.authentication.permissions import IsAdmin
from apps.strategic_objectives.models import Alineacion, ObjetivoEstrategicoInstitucional, PlanInstitucional

class ExportReportView(APIView):
    # permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        report_format = request.query_params.get('format', 'json').lower()

        # Obtenemos los datos (esto no cambia)
        queryset = Alineacion.objects.select_related(
            'instrumento_origen_tipo',
            'instrumento_destino_tipo'
        ).all()

        data = []
        for item in queryset:
            data.append({
                'ID': item.alineacion_id,
                'Instrumento Origen': str(item.instrumento_origen),
                'Instrumento Destino': str(item.instrumento_destino),
                'Contribucion (%)': item.contribucion_porcentaje,
                'Fecha Creacion': item.fecha_creacion.strftime('%Y-%m-%d'),
            })

        df = pd.DataFrame(data)

        # --- Lógica de exportación actualizada ---

        if report_format == 'pdf':
            # 2. Lógica para generar un PDF real
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="reporte_alineaciones_{datetime.date.today()}.pdf"'

            # Convertimos el DataFrame de pandas a una tabla HTML
            # Añadimos un poco de estilo para que se vea bien
            html_string = f"""
            <html>
                <head>
                    <style>
                        @page {{ size: A4 landscape; margin: 2cm; }}
                        body {{ font-family: sans-serif; }}
                        h1 {{ text-align: center; color: #0056b3; }}
                        table {{ width: 100%; border-collapse: collapse; }}
                        th, td {{ border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 10px; }}
                        th {{ background-color: #f2f2f2; }}
                    </style>
                </head>
                <body>
                    <h1>Reporte de Alineaciones</h1>
                    <p>Generado el: {datetime.date.today().strftime('%d/%m/%Y')}</p>
                    {df.to_html(index=False)}
                </body>
            </html>
            """
            # WeasyPrint convierte el string HTML a un PDF
            html = HTML(string=html_string)
            html.write_pdf(response)

            return response

        elif report_format == 'csv':
            # 3. Lógica para CSV (ya era correcta, pero la confirmamos)
            response = HttpResponse(content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="reporte_alineaciones_{datetime.date.today()}.csv"'
            df.to_csv(response, index=False)
            return response

        elif report_format == 'excel':
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="reporte_alineaciones_{datetime.date.today()}.xlsx"'
            df.to_excel(response, index=False)
            return response

        else: # JSON como default
            response = HttpResponse(content_type='application/json')
            df.to_json(response, orient='records', indent=4)
            return response