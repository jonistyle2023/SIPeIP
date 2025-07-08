# OBJETIVO: Definir la lógica de la API para la formulación de proyectos.
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

class ProyectoInversionViewSet(viewsets.ModelViewSet):
    """
    Similar a los OEI, los Editores (formuladores) gestionan los proyectos
    y los Auditores los pueden ver.
    """
    queryset = ProyectoInversion.objects.all().select_related(
        'entidad_ejecutora', 'programa_institucional', 'tipo_proyecto',
        'tipologia_proyecto', 'sector', 'marco_logico'
    ).prefetch_related(
        'marco_logico__componentes__actividades'
    )
    serializer_class = ProyectoInversionSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

    # Lógica de versionamiento
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        ProyectoInversionVersion.objects.create(
            proyecto=instance,
            numero_version=instance.version_actual,
            usuario_responsable=request.user if request.user.is_authenticated else None,
            datos=self.get_serializer(instance).data
        )
        instance.version_actual += 1
        instance.save(update_fields=['version_actual'])
        return super().update(request, *args, **kwargs)

    # Acción personalizada para generar el CUP
    @action(detail=True, methods=['post'], url_path='generar-cup')
    def generar_cup(self, request, pk=None):
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

class MarcoLogicoViewSet(viewsets.ModelViewSet):
    queryset = MarcoLogico.objects.all()
    serializer_class = MarcoLogicoSerializer

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
        # Lógica de Permisos
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