import decimal

from django.db import transaction
from django.db.models import Prefetch
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView # Importar ListAPIView
from apps.authentication.permissions import IsAdmin, IsEditor, IsAuditor, IsSameEntidadForWrite, EntidadScopedWriteMixin
from apps.audit.mixins import AuditedModelViewSetMixin
from apps.audit.utils import log_event
from apps.institutional_config.models import Entidad
from .models import (
    ProyectoInversion, MarcoLogico, Componente, Actividad, Indicador, Meta,
    ArrastreInversion, CronogramaValorado, DictamenPrioridad, ProyectoInversionVersion, CriterioPriorizacion,
    PuntuacionProyecto
)
from .serializers import (
    ProyectoInversionSerializer, ProyectoInversionListSerializer, # Importar el nuevo serializador
    ArrastreInversionSerializer, CronogramaValoradoSerializer, DictamenPrioridadSerializer, MarcoLogicoSerializer,
    ComponenteSerializer, ActividadSerializer, IndicadorSerializer, MetaSerializer, CriterioPriorizacionSerializer,
    PuntuacionProyectoSerializer
)
def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, decimal.Decimal):
        return float(obj)
    return obj

# NUEVO: Vista simplificada para listar proyectos
class ProyectoInversionListView(ListAPIView):
    queryset = ProyectoInversion.objects.all()
    serializer_class = ProyectoInversionListSerializer
    permission_classes = [IsAuthenticated] # O el permiso que consideres adecuado para listar proyectos

class ProyectoInversionViewSet(EntidadScopedWriteMixin, AuditedModelViewSetMixin, viewsets.ModelViewSet):
    """
    ViewSet para los Proyectos de Inversión.
    """
    serializer_class = ProyectoInversionSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor), IsSameEntidadForWrite]
    entidad_lookup = 'entidad_ejecutora__codigo_unico'
    create_entidad_field = 'entidad_ejecutora'
    create_entidad_model = Entidad
    queryset = ProyectoInversion.objects.select_related(
        'programa_institucional'
    ).prefetch_related(
        'marco_logico__componentes__actividades__cronograma',
        'arrastres',
        'dictamenes',
        Prefetch(
            'puntuaciones',
            queryset=PuntuacionProyecto.objects.filter(criterio__activo=True).select_related('criterio'),
        ),
    )

    def get_queryset(self):
        """
        Filtra el queryset base. Si se proporciona un 'estado' en la URL,
        filtra los proyectos para que coincidan con ese estado.
        """
        queryset = super().get_queryset()
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado)
        return queryset

    @action(detail=True, methods=['post'])
    def postular(self, request, pk=None):
        """
        Acción para cambiar el estado de un proyecto a 'POSTULADO'.
        Verifica que el proyecto tenga un dictamen aprobado.
        """
        proyecto = self.get_object()

        if not proyecto.dictamenes.filter(estado='APROBADO').exists():
            return Response(
                {'error': 'El proyecto debe tener un dictamen de prioridad APROBADO para ser postulado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if proyecto.estado == 'POSTULADO':
            return Response(
                {'error': 'Este proyecto ya ha sido postulado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        proyecto.estado = 'POSTULADO'
        proyecto.save()
        log_event(
            user=request.user, request=request, event_type='PROYECTOINVERSION_POSTULADO',
            instance=proyecto, details={'estado': proyecto.estado}
        )

        serializer = self.get_serializer(proyecto)
        return Response(serializer.data)

    # Lógica de versionamiento
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        data = convert_decimals(data)  # <-- Conversión aquí
        response = super().update(request, *args, **kwargs)
        ProyectoInversionVersion.objects.create(
            proyecto=instance,
            numero_version=instance.version_actual,
            usuario_responsable=request.user if request.user.is_authenticated else None,
            datos=data
        )
        instance.version_actual += 1
        instance.save(update_fields=['version_actual'])
        return response

    # Acción personalizada para generar el CUP
    @action(detail=True, methods=['post'], url_path='generar-cup')
    def generar_cup(self, request, pk=None):
        proyecto = self.get_object()
        if proyecto.cup:
            return Response({'error': 'Este proyecto ya tiene un CUP asignado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Aquí iría la lógica de validación:
        if not hasattr(proyecto, 'marco_logico') or not proyecto.marco_logico.componentes.exists():
             return Response({'error': 'Falta información de Marco Lógico para generar el CUP.'}, status=status.HTTP_400_BAD_REQUEST)

        # Lógica de generación de CUP (ejemplo simple)
        nuevo_cup = f"CUP-{proyecto.entidad_ejecutora.codigo_unico}-{proyecto.proyecto_id}"
        proyecto.cup = nuevo_cup
        proyecto.save()
        log_event(
            user=request.user, request=request, event_type='PROYECTOINVERSION_CUP_GENERADO',
            instance=proyecto, details={'cup': nuevo_cup}
        )

        return Response({'status': 'CUP generado exitosamente', 'cup': nuevo_cup})

    @action(detail=True, methods=['post'], url_path='priorizar')
    def priorizar(self, request, pk=None):
        """
        Acción para cambiar el estado de un proyecto a 'PRIORIZADO'.
        """
        proyecto = self.get_object()
        if proyecto.estado != 'POSTULADO':
            return Response(
                {'error': 'Solo se pueden priorizar proyectos que han sido postulados.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        proyecto.estado = 'PRIORIZADO'
        proyecto.save()
        log_event(
            user=request.user, request=request, event_type='PROYECTOINVERSION_PRIORIZADO',
            instance=proyecto, details={'estado': proyecto.estado}
        )
        serializer = self.get_serializer(proyecto)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='devolver')
    def devolver(self, request, pk=None):
        """
        Acción para devolver un proyecto a 'EN_FORMULACION' con observaciones.
        """
        proyecto = self.get_object()
        observaciones = request.data.get('observaciones')

        if not observaciones:
            return Response(
                {'error': 'Se requieren observaciones para devolver un proyecto.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        proyecto.estado = 'EN_FORMULACION'
        # Aquí a futuro se guardan las observaciones en un campo o modelo de historial si lo tuvieras.
        # Por ahora, simplemente cambiamos el estado.
        proyecto.ultimas_observaciones = observaciones # Asumiendo que tienes un campo para observaciones
        proyecto.save()
        log_event(
            user=request.user, request=request, event_type='PROYECTOINVERSION_DEVUELTO',
            instance=proyecto, details={'estado': proyecto.estado, 'observaciones': observaciones}
        )

        # Lógica futura: enviar una notificación a la entidad formuladora.

        serializer = self.get_serializer(proyecto)
        return Response(serializer.data)

class MarcoLogicoViewSet(EntidadScopedWriteMixin, AuditedModelViewSetMixin, viewsets.ModelViewSet):
    """
    ViewSet para el Marco Lógico.
    """
    serializer_class = MarcoLogicoSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor), IsSameEntidadForWrite]
    entidad_lookup = 'proyecto__entidad_ejecutora__codigo_unico'
    create_entidad_field = 'proyecto'
    create_entidad_model = ProyectoInversion
    create_entidad_lookup = 'entidad_ejecutora__codigo_unico'
    queryset = MarcoLogico.objects.all().prefetch_related(
        'componentes__actividades',
        'componentes__indicadores__meta',
        'indicadores__meta'
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        proyecto_id = self.request.query_params.get('proyecto')

        if proyecto_id:
            queryset = queryset.filter(proyecto_id=proyecto_id)

        return queryset

class ComponenteViewSet(EntidadScopedWriteMixin, AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Componente.objects.all()
    serializer_class = ComponenteSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor), IsSameEntidadForWrite]
    entidad_lookup = 'marco_logico__proyecto__entidad_ejecutora__codigo_unico'
    create_entidad_field = 'marco_logico'
    create_entidad_model = MarcoLogico
    create_entidad_lookup = 'proyecto__entidad_ejecutora__codigo_unico'

class ActividadViewSet(EntidadScopedWriteMixin, AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor), IsSameEntidadForWrite]
    entidad_lookup = 'componente__marco_logico__proyecto__entidad_ejecutora__codigo_unico'
    create_entidad_field = 'componente'
    create_entidad_model = Componente
    create_entidad_lookup = 'marco_logico__proyecto__entidad_ejecutora__codigo_unico'

class IndicadorViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Indicador.objects.all()
    serializer_class = IndicadorSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

class MetaViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Meta.objects.all()
    serializer_class = MetaSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

class ArrastreInversionViewSet(EntidadScopedWriteMixin, AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ArrastreInversion.objects.all()
    serializer_class = ArrastreInversionSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor), IsSameEntidadForWrite]
    entidad_lookup = 'proyecto__entidad_ejecutora__codigo_unico'
    create_entidad_field = 'proyecto'
    create_entidad_model = ProyectoInversion
    create_entidad_lookup = 'entidad_ejecutora__codigo_unico'

class CronogramaValoradoViewSet(EntidadScopedWriteMixin, AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = CronogramaValorado.objects.all()
    serializer_class = CronogramaValoradoSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor), IsSameEntidadForWrite]
    entidad_lookup = 'actividad__componente__marco_logico__proyecto__entidad_ejecutora__codigo_unico'
    create_entidad_field = 'actividad'
    create_entidad_model = Actividad
    create_entidad_lookup = 'componente__marco_logico__proyecto__entidad_ejecutora__codigo_unico'

class DictamenPrioridadViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = DictamenPrioridad.objects.all()
    serializer_class = DictamenPrioridadSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

    @action(detail=True, methods=['post'], url_path='aprobar')
    def aprobar(self, request, pk=None):
        dictamen = self.get_object()
        dictamen.estado = 'APROBADO'
        dictamen.observaciones = request.data.get('observaciones', dictamen.observaciones)
        dictamen.save()
        log_event(
            user=request.user, request=request, event_type='DICTAMENPRIORIDAD_APROBADO',
            instance=dictamen, details={'estado': dictamen.estado, 'observaciones': dictamen.observaciones}
        )
        return Response({'status': 'Dictamen aprobado'})

    @action(detail=True, methods=['post'], url_path='rechazar')
    def rechazar(self, request, pk=None):
        dictamen = self.get_object()
        dictamen.estado = 'RECHAZADO'
        dictamen.observaciones = request.data.get('observaciones', 'Rechazado sin observaciones.')
        dictamen.save()
        log_event(
            user=request.user, request=request, event_type='DICTAMENPRIORIDAD_RECHAZADO',
            instance=dictamen, details={'estado': dictamen.estado, 'observaciones': dictamen.observaciones}
        )
        return Response({'status': 'Dictamen rechazado'})

class CriterioPriorizacionViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = CriterioPriorizacion.objects.all()
    serializer_class = CriterioPriorizacionSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

class PuntuacionProyectoViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = PuntuacionProyecto.objects.all()
    serializer_class = PuntuacionProyectoSerializer
    filterset_fields = ['proyecto', 'criterio']
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]