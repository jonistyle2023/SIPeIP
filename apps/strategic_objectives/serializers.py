from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import (
    PlanNacionalDesarrollo, ObjetivoPND, PoliticaPND, MetaPND, IndicadorPND,
    ObjetivoDesarrolloSostenible, EstrategiaODS, MetaODS,
    PlanInstitucional, ObjetivoEstrategicoInstitucional, PlanSectorial, ObjetivoSectorial, Alineacion,
    PlanInstitucionalVersion, ProgramaInstitucional
)

# --- Plan Nacional de Desarrollo (PND) ---

class IndicadorPNDSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndicadorPND
        fields = [
            'indicador_id', 'meta', 'codigo', 'descripcion', 'unidad_medida', 'activo'
        ]

class MetaPNDSerializer(serializers.ModelSerializer):
    indicadores = IndicadorPNDSerializer(many=True, read_only=True)

    class Meta:
        model = MetaPND
        fields = [
            'meta_id', 'politica', 'codigo', 'descripcion', 'activo', 'indicadores'
        ]

class PoliticaPNDSerializer(serializers.ModelSerializer):
    metas = MetaPNDSerializer(many=True, read_only=True)

    class Meta:
        model = PoliticaPND
        fields = [
            'politica_id', 'objetivo', 'codigo', 'descripcion', 'activo', 'metas'
        ]

class ObjetivoPNDSerializer(serializers.ModelSerializer):
    politicas = PoliticaPNDSerializer(many=True, read_only=True)

    class Meta:
        model = ObjetivoPND
        fields = [
            'objetivo_pnd_id', 'pnd', 'codigo', 'descripcion', 'politicas'
        ]


class PlanNacionalDesarrolloSerializer(serializers.ModelSerializer):
    objetivos = ObjetivoPNDSerializer(many=True, read_only=True)

    class Meta:
        model = PlanNacionalDesarrollo
        fields = [
            'pnd_id', 'nombre', 'periodo', 'fecha_publicacion', 'objetivos'
        ]


# --- Objetivos de Desarrollo Sostenible (ODS) ---

class MetaODSSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetaODS
        fields = [
            'meta_id', 'estrategia', 'codigo', 'descripcion', 'activo'
        ]


class EstrategiaODSSerializer(serializers.ModelSerializer):
    metas = MetaODSSerializer(many=True, read_only=True)

    class Meta:
        model = EstrategiaODS
        fields = [
            'estrategia_id', 'objetivo', 'codigo', 'descripcion', 'activo', 'metas'
        ]


class ObjetivoDesarrolloSostenibleSerializer(serializers.ModelSerializer):
    estrategias = EstrategiaODSSerializer(many=True, read_only=True)

    class Meta:
        model = ObjetivoDesarrolloSostenible
        fields = [
            'ods_id', 'numero', 'nombre', 'descripcion', 'estrategias'
        ]


# --- PLANES INSTITUCIONALES Y ALINEACIÓN

class ObjetivoEstrategicoInstitucionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoEstrategicoInstitucional
        fields = [
            'oei_id', 'plan_institucional', 'codigo', 'descripcion', 'activo'
        ]


class PlanInstitucionalSerializer(serializers.ModelSerializer):
    objetivos_estrategicos = ObjetivoEstrategicoInstitucionalSerializer(many=True, read_only=True)

    class Meta:
        model = PlanInstitucional
        fields = [
            'plan_institucional_id', 'nombre', 'entidad', 'periodo', 'estado',
            'version_actual', 'fecha_creacion', 'fecha_ultima_actualizacion',
            'creador', 'objetivos_estrategicos'
        ]


class PlanSectorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanSectorial
        fields = [
            'plan_sectorial_id', 'nombre', 'sector', 'periodo', 'estado', 'fecha_creacion'
        ]


# Representar un objeto genérico de forma legible
class GenericRelatedObjectSerializer(serializers.Field):
    def to_representation(self, value):
        return {
            'id': value.pk,
            'type': value._meta.model_name,
            'description': str(value)
        }


class AlineacionSerializer(serializers.ModelSerializer):
    instrumento_origen = GenericRelatedObjectSerializer(read_only=True)
    instrumento_destino = GenericRelatedObjectSerializer(read_only=True)
    instrumento_origen_tipo = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(), write_only=True
    )
    instrumento_destino_tipo = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(), write_only=True
    )
    ods_vinculados = ObjetivoDesarrolloSostenibleSerializer(many=True, read_only=True)

    class Meta:
        model = Alineacion
        fields = [
            'alineacion_id',
            'instrumento_origen',
            'instrumento_destino',
            'instrumento_origen_tipo',  # Campo de escritura
            'instrumento_origen_id',  # Campo de escritura
            'instrumento_destino_tipo',  # Campo de escritura
            'instrumento_destino_id',  # Campo de escritura
            'contribucion_porcentaje',
            'fecha_creacion',
            'usuario_creacion',
            'ods_vinculados',
        ]


class PlanInstitucionalVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanInstitucionalVersion
        fields = [
            'version_id', 'plan_institucional', 'numero_version', 'fecha_version', 'usuario_version',
            'cambios_realizados'
        ]


class ObjetivoSectorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoSectorial
        fields = '__all__'


# Actualiza el PlanSectorialSerializer para mostrar sus objetivos anidados
class PlanSectorialSerializer(serializers.ModelSerializer):
    objetivos = ObjetivoSectorialSerializer(many=True, read_only=True)

    class Meta:
        model = PlanSectorial
        fields = [
            'plan_sectorial_id', 'nombre', 'periodo', 'entidad_responsable', 'fecha_publicacion', 'objetivos'
        ]

class ProgramaInstitucionalSerializer(serializers.ModelSerializer):
    entidad_nombre = serializers.CharField(source='entidad.nombre', read_only=True, allow_null=True)
    oei_alineados = ObjetivoEstrategicoInstitucionalSerializer(many=True, read_only=True)
    oei_alineados_ids = serializers.PrimaryKeyRelatedField(
        queryset=ObjetivoEstrategicoInstitucional.objects.all(),
        many=True,
        write_only=True,
        source='oei_alineados'
    )

    class Meta:
        model = ProgramaInstitucional
        fields = [
            'programa_id',
            'nombre',
            'entidad',
            'entidad_nombre',
            'oei_alineados',      # solo lectura (detalles)
            'oei_alineados_ids',  # solo escritura (IDs)
            'creador'
        ]