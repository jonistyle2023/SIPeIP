from django.db import transaction
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.contenttypes.models import ContentType
from apps.authentication.permissions import IsAdmin, IsEditor, IsAuditor, IsSameEntidadForWrite, EntidadScopedWriteMixin
from apps.audit.mixins import AuditedModelViewSetMixin
from apps.audit.utils import log_event, serialize_instance
from apps.institutional_config.models import Entidad
from .models import (
    PlanNacionalDesarrollo, ObjetivoPND, PoliticaPND, MetaPND, IndicadorPND,
    ObjetivoDesarrolloSostenible, MetaODS, IndicadorODS,
    PlanInstitucional, ObjetivoEstrategicoInstitucional, PlanSectorial, ObjetivoSectorial, Alineacion,
    PlanInstitucionalVersion, ProgramaInstitucional
)
from .serializers import (
    PlanNacionalDesarrolloSerializer, ObjetivoPNDSerializer, PoliticaPNDSerializer,
    MetaPNDSerializer, IndicadorPNDSerializer, ObjetivoDesarrolloSostenibleSerializer, MetaODSSerializer,
    IndicadorODSSerializer, PlanInstitucionalSerializer,
    ObjetivoEstrategicoInstitucionalSerializer, PlanSectorialSerializer, ObjetivoSectorialSerializer,
    AlineacionSerializer,
    PlanInstitucionalVersionSerializer, ProgramaInstitucionalSerializer
)

# --- PND ---
class PlanNacionalDesarrolloViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = PlanNacionalDesarrollo.objects.select_related('periodo').prefetch_related(
        'objetivos__politicas__metas__indicadores'
    )
    serializer_class = PlanNacionalDesarrolloSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

class ObjetivoPNDViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ObjetivoPND.objects.all().prefetch_related('politicas__metas__indicadores')
    serializer_class = ObjetivoPNDSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

class PoliticaPNDViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = PoliticaPND.objects.all().prefetch_related('metas__indicadores')
    serializer_class = PoliticaPNDSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

class MetaPNDViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = MetaPND.objects.all().prefetch_related('indicadores')
    serializer_class = MetaPNDSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

class IndicadorPNDViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = IndicadorPND.objects.all()
    serializer_class = IndicadorPNDSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

# --- ODS ---
class ObjetivoDesarrolloSostenibleViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoDesarrolloSostenible.objects.all().prefetch_related('metas__indicadores')
    serializer_class = ObjetivoDesarrolloSostenibleSerializer
    http_method_names = ['get', 'head', 'options']  # Hacerlo de solo lectura

class MetaODSViewSet(viewsets.ModelViewSet):
    queryset = MetaODS.objects.all().prefetch_related('indicadores')
    serializer_class = MetaODSSerializer
    http_method_names = ['get', 'head', 'options']  # Hacerlo de solo lectura

class IndicadorODSViewSet(viewsets.ModelViewSet):
    queryset = IndicadorODS.objects.all()
    serializer_class = IndicadorODSSerializer
    http_method_names = ['get', 'head', 'options']  # Hacerlo de solo lectura

    def get_queryset(self):
        """
        Filtra los indicadores por el ID de la meta ODS si se proporciona
        el parámetro `meta_id` en la URL.
        """
        queryset = super().get_queryset()
        meta_id = self.request.query_params.get('meta_id')
        if meta_id:
            try:
                # El campo en el modelo es meta_ods, por lo que el filtro por ID es meta_ods_id
                meta_id_int = int(meta_id)
                queryset = queryset.filter(meta_ods_id=meta_id_int)
            except (ValueError, TypeError):
                # Si meta_id no es un entero válido, no devolvemos nada.
                return queryset.none()
        return queryset
# --- PLANES Y ALINEACIÓN ---
class PlanInstitucionalViewSet(EntidadScopedWriteMixin, AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = PlanInstitucional.objects.all().prefetch_related('objetivos_estrategicos')
    serializer_class = PlanInstitucionalSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor), IsSameEntidadForWrite]
    entidad_lookup = 'entidad__codigo_unico'
    create_entidad_field = 'entidad'
    create_entidad_model = Entidad

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        current_data_serializer = self.get_serializer(instance)
        snapshot = current_data_serializer.data
        response = super().update(request, *args, **kwargs)

        PlanInstitucionalVersion.objects.create(
            plan_institucional=instance,
            numero_version=instance.version_actual,
            usuario_responsable=request.user if request.user.is_authenticated else None,
            datos=snapshot
        )

        instance.version_actual += 1
        instance.save(update_fields=['version_actual'])
        return response

class PlanInstitucionalVersionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint para consultar el historial de versiones de los Planes Institucionales.
    No se puede crear, editar o borrar desde aquí.
    """
    queryset = PlanInstitucionalVersion.objects.all()
    serializer_class = PlanInstitucionalVersionSerializer
    filterset_fields = ['plan_institucional']

class ObjetivoEstrategicoInstitucionalViewSet(EntidadScopedWriteMixin, AuditedModelViewSetMixin, viewsets.ModelViewSet):
    """
    - Los Editores pueden crear y modificar OEI.
    - Los Auditores pueden verlos.
    - Los Admins pueden hacer todo.
    """
    queryset = ObjetivoEstrategicoInstitucional.objects.all()
    serializer_class = ObjetivoEstrategicoInstitucionalSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor), IsSameEntidadForWrite]
    entidad_lookup = 'plan_institucional__entidad__codigo_unico'
    create_entidad_field = 'plan_institucional'
    create_entidad_model = PlanInstitucional
    create_entidad_lookup = 'entidad__codigo_unico'

class PlanSectorialViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = PlanSectorial.objects.select_related('periodo', 'entidad_responsable').prefetch_related('objetivos')
    serializer_class = PlanSectorialSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

class AlineacionViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = Alineacion.objects.all().select_related('instrumento_origen_tipo', 'instrumento_destino_tipo')
    serializer_class = AlineacionSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

    def perform_create(self, serializer):
        instance = serializer.save()
        ods_ids = self.request.data.get('ods_vinculados', [])
        if ods_ids:
            instance.ods_vinculados.set(ods_ids)
        log_event(
            user=self.request.user, request=self.request, event_type='ALINEACION_CREATED',
            instance=instance, details={'fields': serialize_instance(instance), 'ods_vinculados': ods_ids}
        )

    def perform_update(self, serializer):
        before = serialize_instance(serializer.instance)
        instance = serializer.save()
        ods_ids = self.request.data.get('ods_vinculados', [])
        if ods_ids is not None:
            instance.ods_vinculados.set(ods_ids)
        after = serialize_instance(instance)
        changed_fields = {
            field: {'antes': before.get(field), 'despues': value}
            for field, value in after.items()
            if before.get(field) != value
        }
        log_event(
            user=self.request.user, request=self.request, event_type='ALINEACION_UPDATED',
            instance=instance, details={'changed_fields': changed_fields, 'ods_vinculados': ods_ids}
        )

class ObjetivoSectorialViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    queryset = ObjetivoSectorial.objects.all()
    serializer_class = ObjetivoSectorialSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]

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
            'objetivosectorial',
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

class ProgramaInstitucionalViewSet(AuditedModelViewSetMixin, viewsets.ModelViewSet):
    """
    API endpoint para gestionar los Programas Institucionales.
    """
    queryset = ProgramaInstitucional.objects.select_related('entidad').prefetch_related('oei_alineados')
    serializer_class = ProgramaInstitucionalSerializer
    permission_classes = [IsAuthenticated, (IsAdmin | IsEditor | IsAuditor)]