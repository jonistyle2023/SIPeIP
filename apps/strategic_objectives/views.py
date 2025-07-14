# OBJETIVO: Definir la lógica de la API para PND y ODS.
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType
from apps.authentication.permissions import IsAdmin, IsEditor, IsAuditor
from .models import (
    PlanNacionalDesarrollo, ObjetivoPND, PoliticaPND, MetaPND, IndicadorPND,
    ObjetivoDesarrolloSostenible, EstrategiaODS, MetaODS,
    PlanInstitucional, ObjetivoEstrategicoInstitucional, PlanSectorial, ObjetivoSectorial, Alineacion,
    PlanInstitucionalVersion
)
from .serializers import (
    PlanNacionalDesarrolloSerializer, ObjetivoPNDSerializer, PoliticaPNDSerializer,
    MetaPNDSerializer, IndicadorPNDSerializer, ObjetivoDesarrolloSostenibleSerializer,
    EstrategiaODSSerializer, MetaODSSerializer, PlanInstitucionalSerializer,
    ObjetivoEstrategicoInstitucionalSerializer, PlanSectorialSerializer, ObjetivoSectorialSerializer,
    AlineacionSerializer,
    PlanInstitucionalVersionSerializer
)


# --- PND ---
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


# --- ODS ---

class ObjetivoDesarrolloSostenibleViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoDesarrolloSostenible.objects.all().prefetch_related('estrategias__metas')
    serializer_class = ObjetivoDesarrolloSostenibleSerializer


class EstrategiaODSViewSet(viewsets.ModelViewSet):
    queryset = EstrategiaODS.objects.all().prefetch_related('metas')
    serializer_class = EstrategiaODSSerializer


class MetaODSViewSet(viewsets.ModelViewSet):
    queryset = MetaODS.objects.all()
    serializer_class = MetaODSSerializer


# --- PLANES Y ALINEACIÓN ---

class PlanInstitucionalViewSet(viewsets.ModelViewSet):
    queryset = PlanInstitucional.objects.all().prefetch_related('objetivos_estrategicos')
    serializer_class = PlanInstitucionalSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        current_data_serializer = self.get_serializer(instance)

        PlanInstitucionalVersion.objects.create(
            plan_institucional=instance,
            numero_version=instance.version_actual,
            usuario_responsable=request.user if request.user.is_authenticated else None,
            datos=current_data_serializer.data
        )

        instance.version_actual += 1
        instance.save(update_fields=['version_actual'])
        return super().update(request, *args, **kwargs)


class PlanInstitucionalVersionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint para consultar el historial de versiones de los Planes Institucionales.
    No se puede crear, editar o borrar desde aquí.
    """
    queryset = PlanInstitucionalVersion.objects.all()
    serializer_class = PlanInstitucionalVersionSerializer
    filterset_fields = ['plan_institucional']


class ObjetivoEstrategicoInstitucionalViewSet(viewsets.ModelViewSet):
    """
    - Los Editores pueden crear y modificar OEI.
    - Los Auditores pueden verlos.
    - Los Admins pueden hacer todo.
    """
    queryset = ObjetivoEstrategicoInstitucional.objects.all()
    serializer_class = ObjetivoEstrategicoInstitucionalSerializer
    # permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]


class PlanSectorialViewSet(viewsets.ModelViewSet):
    queryset = PlanSectorial.objects.all().prefetch_related('objetivos')
    serializer_class = PlanSectorialSerializer
    # permission_classes = [IsAuthenticated, ...]


class AlineacionViewSet(viewsets.ModelViewSet):
    queryset = Alineacion.objects.all().select_related('instrumento_origen_tipo', 'instrumento_destino_tipo')
    serializer_class = AlineacionSerializer


class ObjetivoSectorialViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoSectorial.objects.all()
    serializer_class = ObjetivoSectorialSerializer
    # permission_classes = [IsAuthenticated, ...] # Añadir permisos según sea necesario


# Ayuda a obtener los modelos que se pueden alinear
class AlignableContentTypesListView(APIView):
    """
    Devuelve una lista de todos los modelos (tipos de contenido) que pueden ser
    utilizados en el sistema de alineación.
    """

    @staticmethod
    def get(request):
        # Define aquí los modelos que quieres exponer para alineación
        models = [
            'objetivoestrategicoinstitucional', 'objetivopnd',
            'politicapnd', 'metapnd', 'metaods', 'plansectorial'
        ]
        content_types = ContentType.objects.filter(model__in=models)
        data = [
            {
                'id': ct.id,
                'name': ct.name,  # Nombre legible (ej. "objetivo pnd")
                'model': ct.model  # Nombre técnico (ej. "objetivopnd")
            }
            for ct in content_types
        ]
        return Response(data)
