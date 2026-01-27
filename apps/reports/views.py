from django.http import HttpResponse
from django.shortcuts import render
from django.db.models import Sum, Count, Avg, F, Q
from rest_framework import request
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
import pandas as pd
from weasyprint import HTML
import datetime

from apps.authentication.permissions import IsAdmin
from apps.investment_projects.models import ProyectoInversion
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

class DashboardStatsView(APIView):
    """
    Vista para entregar datos agregados para los gráficos del Dashboard.
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # 1. Inversión Total por Sector
        # Agrupa por el catálogo 'sector' y suma el cronograma valorado (inversión programada)
        # Asumimos que ItemCatalogo tiene un campo 'descripcion' o 'nombre'. Usaremos 'descripcion'.
        qs_sector = ProyectoInversion.objects.values(
            'sector__descripcion'
        ).annotate(
            total=Sum('marco_logico__componentes__actividades__cronograma__valor_programado'),
            cantidad=Count('proyecto_id', distinct=True)
        ).order_by('-total')

        inversion_sector_data = [
            {
                'sector': item['sector__descripcion'] or 'Sin Sector Asignado',
                'total': item['total'] or 0,
                'cantidad': item['cantidad']
            }
            for item in qs_sector
        ]

        # 2. Avance Físico y Financiero por Entidad
        # Nota: El modelo ProyectoInversion no tiene campos directos de 'avance'.
        # Calculamos el avance financiero basado en Arrastres (Devengado / Total) si existen.
        qs_entidad = ProyectoInversion.objects.values(
            'entidad_ejecutora__nombre'
        ).annotate(
            devengado=Sum('arrastres__monto_devengado'),
            por_devengar=Sum('arrastres__monto_por_devengar'),
            total_proyectos=Count('proyecto_id', distinct=True)
        ).order_by('-devengado')[:5]

        avance_entidad_data = []
        for item in qs_entidad:
            dev = item['devengado'] or 0
            por_dev = item['por_devengar'] or 0
            total_arrastre = dev + por_dev
            financiero = (dev / total_arrastre * 100) if total_arrastre > 0 else 0

            avance_entidad_data.append({
                'entidad_responsable': item['entidad_ejecutora__nombre'],
                'promedio_fisico': 0, # No hay datos de avance físico en el modelo actual
                'promedio_financiero': round(financiero, 2)
            })

        # 3. Alineación (Usando Programa Institucional como proxy de estrategia)
        alineacion_data = ProyectoInversion.objects.values(
            'programa_institucional__nombre'
        ).annotate(
            total_proyectos=Count('proyecto_id')
        ).order_by('-total_proyectos')

        data = {
            'inversion_sector': inversion_sector_data,
            'avance_entidad': avance_entidad_data,
            'alineacion_ods': list(alineacion_data),
        }

        return Response(data)