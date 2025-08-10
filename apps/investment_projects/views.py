import decimal

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.authentication.permissions import IsAdmin, IsEditor, IsAuditor
from .models import (
    ProyectoInversion, MarcoLogico, Componente, Actividad, Indicador, Meta,
    ArrastreInversion, CronogramaValorado, DictamenPrioridad, ProyectoInversionVersion
)
from .serializers import (
    ProyectoInversionSerializer,
    ArrastreInversionSerializer, CronogramaValoradoSerializer, DictamenPrioridadSerializer, MarcoLogicoSerializer,
    ComponenteSerializer, ActividadSerializer, IndicadorSerializer, MetaSerializer
)
from ..institutional_config.models import Catalogo
from ..institutional_config.serializers import CatalogoSerializer

def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, decimal.Decimal):
        return float(obj)
    return obj

class ProyectoInversionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para los Proyectos de Inversión.
    """
    serializer_class = ProyectoInversionSerializer
    # permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]
    queryset = ProyectoInversion.objects.select_related(
        'programa_institucional'
    ).prefetch_related(
        'marco_logico__componentes__actividades__cronograma',
        'arrastres',
        'dictamenes'
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

        serializer = self.get_serializer(proyecto)
        return Response(serializer.data)

    # Lógica de versionamiento
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        data = convert_decimals(data)  # <-- Conversión aquí
        ProyectoInversionVersion.objects.create(
            proyecto=instance,
            numero_version=instance.version_actual,
            usuario_responsable=request.user if request.user.is_authenticated else None,
            datos=data
        )
        instance.version_actual += 1
        instance.save(update_fields=['version_actual'])
        return super().update(request, *args, **kwargs)

    # Acción personalizada para generar el CUP
    @action(detail=True, methods=['post'], url_path='generar-cup')
    def generar_cup(self, request):
        proyecto = self.get_object()
        if proyecto.cup:
            return Response({'error': 'Este proyecto ya tiene un CUP asignado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Aquí iría la lógica de validación:
        if not proyecto.marco_logico or not proyecto.marco_logico.componentes.exists():
             return Response({'error': 'Falta información de Marco Lógico para generar el CUP.'})

        # Lógica de generación de CUP (ejemplo simple)
        nuevo_cup = f"CUP-{proyecto.entidad_ejecutora.codigo_unico}-{proyecto.proyecto_id}"
        proyecto.cup = nuevo_cup
        proyecto.save()

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
        proyecto.save()

        # Lógica futura: enviar una notificación a la entidad formuladora.

        serializer = self.get_serializer(proyecto)
        return Response(serializer.data)

class MarcoLogicoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para el Marco Lógico.
    """
    serializer_class = MarcoLogicoSerializer
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

class ComponenteViewSet(viewsets.ModelViewSet):
    queryset = Componente.objects.all()
    serializer_class = ComponenteSerializer

class ActividadViewSet(viewsets.ModelViewSet):
    queryset = Actividad.objects.all()
    serializer_class = ActividadSerializer

class IndicadorViewSet(viewsets.ModelViewSet):
    queryset = Indicador.objects.all()
    serializer_class = IndicadorSerializer

class MetaViewSet(viewsets.ModelViewSet):
    queryset = Meta.objects.all()
    serializer_class = MetaSerializer

class ArrastreInversionViewSet(viewsets.ModelViewSet):
    queryset = ArrastreInversion.objects.all()
    serializer_class = ArrastreInversionSerializer

class CronogramaValoradoViewSet(viewsets.ModelViewSet):
    queryset = CronogramaValorado.objects.all()
    serializer_class = CronogramaValoradoSerializer

class DictamenPrioridadViewSet(viewsets.ModelViewSet):
    queryset = DictamenPrioridad.objects.all()
    serializer_class = DictamenPrioridadSerializer

    @action(detail=True, methods=['post'], url_path='aprobar')
    def aprobar(self, request, pk=None):
        dictamen = self.get_object()
        dictamen.estado = 'APROBADO'
        dictamen.observaciones = request.data.get('observaciones', dictamen.observaciones)
        dictamen.save()
        return Response({'status': 'Dictamen aprobado'})

    @action(detail=True, methods=['post'], url_path='rechazar')
    def rechazar(self, request, pk=None):
        dictamen = self.get_object()
        dictamen.estado = 'RECHAZADO'
        dictamen.observaciones = request.data.get('observaciones', 'Rechazado sin observaciones.')
        dictamen.save()
        return Response({'status': 'Dictamen rechazado'})

class CatalogoViewSet(viewsets.ModelViewSet):
    queryset = Catalogo.objects.all()
    serializer_class = CatalogoSerializer

    def list(self, request, *args, **kwargs):
        codigo = request.query_params.get('codigo')
        if codigo:
            catalogos = Catalogo.objects.filter(codigo=codigo)
        else:
            catalogos = Catalogo.objects.all()
        serializer = self.get_serializer(catalogos, many=True)
        return Response(serializer.data)