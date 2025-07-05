# ==============================================================================
# ARCHIVO: apps/strategic_objectives/views.py
# OBJETIVO: Definir la lógica de la API para PND y ODS.
# ==============================================================================
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from .models import (
    PlanNacionalDesarrollo, ObjetivoPND, PoliticaPND, MetaPND, IndicadorPND,
    ObjetivoDesarrolloSostenible, EstrategiaODS, MetaODS,
    PlanInstitucional, ObjetivoEstrategicoInstitucional, PlanSectorial, Alineacion, PlanInstitucionalVersion
)
from .serializers import (
    PlanNacionalDesarrolloSerializer, ObjetivoPNDSerializer, PoliticaPNDSerializer,
    MetaPNDSerializer, IndicadorPNDSerializer, ObjetivoDesarrolloSostenibleSerializer,
    EstrategiaODSSerializer, MetaODSSerializer, PlanInstitucionalSerializer,
    ObjetivoEstrategicoInstitucionalSerializer, PlanSectorialSerializer, AlineacionSerializer,
    PlanInstitucionalVersionSerializer
)

# --- Vistas para PND ---
# Usamos prefetch_related para optimizar las consultas anidadas y evitar el problema N+1.
class PlanNacionalDesarrolloViewSet(viewsets.ModelViewSet):
    queryset = PlanNacionalDesarrollo.objects.all().prefetch_related('objetivos__politicas__metas__indicadores')
    serializer_class = PlanNacionalDesarrolloSerializer

class ObjetivoPNDViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoPND.objects.all().prefetch_related('politicas__metas__indicadores')
    serializer_class = ObjetivoPNDSerializer

class PoliticaPNDViewSet(viewsets.ModelViewSet):
    queryset = PoliticaPND.objects.all().prefetch_related('metas__indicadores')
    serializer_class = PoliticaPNDSerializer

class MetaPNDViewSet(viewsets.ModelViewSet):
    queryset = MetaPND.objects.all().prefetch_related('indicadores')
    serializer_class = MetaPNDSerializer

class IndicadorPNDViewSet(viewsets.ModelViewSet):
    queryset = IndicadorPND.objects.all()
    serializer_class = IndicadorPNDSerializer

# --- Vistas para ODS ---

class ObjetivoDesarrolloSostenibleViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoDesarrolloSostenible.objects.all().prefetch_related('estrategias__metas')
    serializer_class = ObjetivoDesarrolloSostenibleSerializer

class EstrategiaODSViewSet(viewsets.ModelViewSet):
    queryset = EstrategiaODS.objects.all().prefetch_related('metas')
    serializer_class = EstrategiaODSSerializer

class MetaODSViewSet(viewsets.ModelViewSet):
    queryset = MetaODS.objects.all()
    serializer_class = MetaODSSerializer

# --- VISTAS PARA PLANES Y ALINEACIÓN ---

class PlanInstitucionalViewSet(viewsets.ModelViewSet):
    queryset = PlanInstitucional.objects.all().prefetch_related('objetivos_estrategicos')
    serializer_class = PlanInstitucionalSerializer

    # SOBRESCRIBIMOS EL MÉTODO UPDATE PARA AÑADIR LA LÓGICA DE VERSIONAMIENTO
    def update(self, request, *args, **kwargs):
        # Obtenemos la instancia del plan que se va a actualizar
        instance = self.get_object()

        # 1. Crear el snapshot de la versión actual ANTES de modificarla
        # Serializamos el estado actual para guardarlo como JSON
        current_data_serializer = self.get_serializer(instance)

        PlanInstitucionalVersion.objects.create(
            plan_institucional=instance,
            numero_version=instance.version_actual,
            # El usuario se asignará si la autenticación está configurada
            usuario_responsable=request.user if request.user.is_authenticated else None,
            datos=current_data_serializer.data
        )

        # 2. Incrementar la versión del plan
        instance.version_actual += 1
        instance.save(update_fields=['version_actual'])

        # 3. Proceder con la actualización normal de los datos
        # La llamada a super() se encarga de validar y guardar los nuevos datos
        return super().update(request, *args, **kwargs)

class PlanInstitucionalVersionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint para consultar el historial de versiones de los Planes Institucionales.
    No se puede crear, editar o borrar desde aquí.
    """
    queryset = PlanInstitucionalVersion.objects.all()
    serializer_class = PlanInstitucionalVersionSerializer
    # Opcional: añadir filtro para ver versiones de un plan específico
    filterset_fields = ['plan_institucional']

class ObjetivoEstrategicoInstitucionalViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoEstrategicoInstitucional.objects.all()
    serializer_class = ObjetivoEstrategicoInstitucionalSerializer

class PlanSectorialViewSet(viewsets.ModelViewSet):
    queryset = PlanSectorial.objects.all()
    serializer_class = PlanSectorialSerializer

class AlineacionViewSet(viewsets.ModelViewSet):
    queryset = Alineacion.objects.all().select_related('instrumento_origen_tipo', 'instrumento_destino_tipo')
    serializer_class = AlineacionSerializer

# Vista de ayuda para obtener los modelos que se pueden alinear
class AlignableContentTypesListView(APIView):
    """
    Devuelve una lista de todos los modelos (tipos de contenido) que pueden ser
    utilizados en el sistema de alineación.
    """
    def get(self, request, format=None):
        # Define aquí los modelos que quieres exponer para alineación
        models = [
            'objetivoestrategicoinstitucional', 'objetivopnd',
            'politicapnd', 'metapnd', 'metaods', 'plansectorial'
        ]
        content_types = ContentType.objects.filter(model__in=models)
        data = [
            {
                'id': ct.id,
                'name': ct.name, # Nombre legible (ej. "objetivo pnd")
                'model': ct.model # Nombre técnico (ej. "objetivopnd")
            }
            for ct in content_types
        ]
        return Response(data)