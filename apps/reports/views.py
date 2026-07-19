from django.db.models import Sum, Count, Q
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import pandas as pd
from weasyprint import HTML
import datetime

from apps.tracking.models import TrackingActivity
from apps.investment_projects.models import ProyectoInversion, CronogramaValorado, ArrastreInversion
from apps.institutional_config.models import Entidad
from apps.strategic_objectives.models import (
    Alineacion, ObjetivoDesarrolloSostenible, PlanNacionalDesarrollo, PlanSectorial
)
from apps.authentication.permissions import IsAdmin, IsEditor, IsAuditor

def _build_export_response(df, report_format, base_filename, titulo):
    """Genera la respuesta HTTP de exportación (PDF/CSV/Excel/JSON) para un
    DataFrame ya armado, siguiendo el mismo patrón usado en toda la app."""
    if report_format == 'pdf':
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{base_filename}_{datetime.date.today()}.pdf"'
        html_string = f"""
        <html>
            <head><style>@page {{ size: A4 landscape; }} body {{ font-family: sans-serif; }} h1 {{ text-align: center; }} table {{ width: 100%; border-collapse: collapse; }} th, td {{ border: 1px solid #ddd; padding: 8px; font-size: 10px; }} th {{ background-color: #f2f2f2; }}</style></head>
            <body><h1>{titulo}</h1><p>Generado el: {datetime.date.today().strftime('%d/%m/%Y')}</p>{df.to_html(index=False)}</body>
        </html>
        """
        HTML(string=html_string).write_pdf(response)
        return response

    if report_format == 'csv':
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="{base_filename}_{datetime.date.today()}.csv"'
        df.to_csv(response, index=False, encoding='utf-8')
        return response

    if report_format == 'excel':
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{base_filename}_{datetime.date.today()}.xlsx"'
        df.to_excel(response, index=False)
        return response

    return Response(df.to_dict(orient='records'))

# Funcionalidad de reportes dentro de la aplicación
class TrackingActivityReportView(APIView):
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

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
            })
        
        df = pd.DataFrame(data)
        return _build_export_response(df, report_format, 'reporte_actividades', 'Reporte de Actividades de Seguimiento')

class ExportReportView(APIView):
    """
    Exporta el reporte de Alineación (vínculos OEI/PND/ODS-Instrumento) en
    PDF, CSV, Excel o JSON, con el mismo mecanismo de TrackingActivityReportView.
    """
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

    def get(self, request, *args, **kwargs):
        report_format = request.query_params.get('format', 'json').lower()
        queryset = Alineacion.objects.select_related(
            'instrumento_origen_tipo', 'instrumento_destino_tipo'
        ).prefetch_related('ods_vinculados', 'usuario_creacion')

        data = []
        for alineacion in queryset:
            ods_desc = ', '.join(
                f'ODS {ods.numero}: {ods.nombre}' for ods in alineacion.ods_vinculados.all()
            ) or 'N/A'
            data.append({
                'Instrumento Origen': str(alineacion.instrumento_origen) if alineacion.instrumento_origen else 'N/A',
                'Instrumento Destino': str(alineacion.instrumento_destino) if alineacion.instrumento_destino else 'N/A',
                'ODS Vinculados': ods_desc,
                'Contribución (%)': alineacion.contribucion_porcentaje,
                # Excel no soporta datetimes con timezone (Alineacion.fecha_creacion es tz-aware); se exporta como texto.
                'Fecha Creación': alineacion.fecha_creacion.strftime('%Y-%m-%d %H:%M') if alineacion.fecha_creacion else 'N/A',
                'Usuario': alineacion.usuario_creacion.nombre_usuario if alineacion.usuario_creacion else 'N/A',
            })

        df = pd.DataFrame(data)
        return _build_export_response(df, report_format, 'reporte_alineaciones', 'Reporte de Alineación de Instrumentos')

class DashboardStatsView(APIView):
    """
    Estadísticas agregadas reales (sin datos simulados) usadas tanto por el
    Dashboard principal como por el módulo de Reportes.
    """
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

    def get(self, request, *args, **kwargs):
        # --- Avance físico por proyecto: % de actividades COMPLETADA sobre el total activo ---
        progreso_por_proyecto = {}
        for row in TrackingActivity.objects.filter(is_active=True).values('project').annotate(
            total=Count('id'), completadas=Count('id', filter=Q(reported_status='COMPLETADA'))
        ):
            progreso_por_proyecto[row['project']] = (
                round(row['completadas'] / row['total'] * 100, 2) if row['total'] else 0
            )

        proyectos = list(ProyectoInversion.objects.select_related('sector', 'entidad_ejecutora').all())

        # --- KPIs ---
        avances = list(progreso_por_proyecto.values())
        kpis = {
            'proyectos_activos': len(proyectos),
            'inversion_total': CronogramaValorado.objects.aggregate(total=Sum('valor_programado'))['total'] or 0,
            'avance_promedio': round(sum(avances) / len(avances), 2) if avances else 0,
            'alertas_activas': TrackingActivity.objects.filter(is_active=True, reported_status='EN_RIESGO').count(),
        }

        # --- Indicadores / avance por sector ---
        sector_stats = {}
        for p in proyectos:
            sector_nombre = p.sector.nombre if p.sector else 'Sin Sector'
            entry = sector_stats.setdefault(sector_nombre, {'sector': sector_nombre, 'projects': 0, '_avances': []})
            entry['projects'] += 1
            if p.proyecto_id in progreso_por_proyecto:
                entry['_avances'].append(progreso_por_proyecto[p.proyecto_id])
        indicadores_sector = []
        for entry in sector_stats.values():
            avances_sector = entry.pop('_avances')
            entry['avance'] = round(sum(avances_sector) / len(avances_sector), 2) if avances_sector else 0
            indicadores_sector.append(entry)

        # --- Alertas: actividades activas EN_RIESGO más próximas a vencer ---
        alertas = [
            {'actividad': a.name, 'proyecto': a.project.nombre, 'fecha_limite': a.planned_end_date}
            for a in TrackingActivity.objects.filter(is_active=True, reported_status='EN_RIESGO')
            .select_related('project').order_by('planned_end_date')[:5]
        ]

        # --- Instrumentos de planificación ---
        pnd = PlanNacionalDesarrollo.objects.order_by('-fecha_publicacion').first()
        instrumentos_planificacion = {
            'ods_count': ObjetivoDesarrolloSostenible.objects.count(),
            'pnd_nombre': pnd.nombre if pnd else None,
            'pnd_objetivos': (
                [{'codigo': o.codigo, 'descripcion': o.descripcion} for o in pnd.objetivos.all()] if pnd else []
            ),
            'sectoriales_count': PlanSectorial.objects.count(),
            'entidades_count': Entidad.objects.filter(activo=True).count(),
        }

        # --- Inversión por período (CronogramaValorado.periodo, formato AAAA-MM) ---
        inversion_por_periodo = list(
            CronogramaValorado.objects.values('periodo').annotate(total=Sum('valor_programado')).order_by('periodo')
        )

        # --- Inversión por sector (Reportes) ---
        inversion_sector = [
            {
                'sector': row['actividad__componente__marco_logico__proyecto__sector__nombre'] or 'Sin Sector',
                'total': row['total'] or 0,
            }
            for row in CronogramaValorado.objects.values(
                'actividad__componente__marco_logico__proyecto__sector__nombre'
            ).annotate(total=Sum('valor_programado'))
        ]

        # --- Avance por entidad: físico (actividades) + financiero (arrastres) ---
        entidad_fisico = {}
        for p in proyectos:
            bucket = entidad_fisico.setdefault(p.entidad_ejecutora.nombre, [])
            if p.proyecto_id in progreso_por_proyecto:
                bucket.append(progreso_por_proyecto[p.proyecto_id])

        entidad_financiero = {}
        for row in ArrastreInversion.objects.values('proyecto__entidad_ejecutora__nombre').annotate(
            devengado=Sum('monto_devengado'), por_devengar=Sum('monto_por_devengar')
        ):
            devengado = row['devengado'] or 0
            por_devengar = row['por_devengar'] or 0
            denom = devengado + por_devengar
            entidad_financiero[row['proyecto__entidad_ejecutora__nombre']] = (
                round(float(devengado) / float(denom) * 100, 2) if denom else 0
            )

        avance_entidad = [
            {
                'entidad_responsable': nombre,
                'promedio_fisico': round(sum(avances_ent) / len(avances_ent), 2) if avances_ent else 0,
                'promedio_financiero': entidad_financiero.get(nombre, 0),
            }
            for nombre, avances_ent in entidad_fisico.items()
        ]

        # --- Alineación con ODS (conteo directo de Alineacion.ods_vinculados) ---
        alineacion_ods = list(
            ObjetivoDesarrolloSostenible.objects.annotate(count=Count('alineaciones'))
            .order_by('numero').values('numero', 'nombre', 'count')
        )

        return Response({
            'kpis': kpis,
            'indicadores_sector': indicadores_sector,
            'alertas': alertas,
            'instrumentos_planificacion': instrumentos_planificacion,
            'inversion_por_periodo': inversion_por_periodo,
            'inversion_sector': inversion_sector,
            'avance_entidad': avance_entidad,
            'alineacion_ods': alineacion_ods,
        })
