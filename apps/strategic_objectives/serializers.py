# ==============================================================================
# ARCHIVO: apps/strategic_objectives/serializers.py
# OBJETIVO: Convertir los modelos de PND y ODS a formato JSON.
# ==============================================================================
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import (
    PlanNacionalDesarrollo, ObjetivoPND, PoliticaPND, MetaPND, IndicadorPND,
    ObjetivoDesarrolloSostenible, EstrategiaODS, MetaODS,
    PlanInstitucional, ObjetivoEstrategicoInstitucional, PlanSectorial, Alineacion, PlanInstitucionalVersion
)

# --- Serializers para el Plan Nacional de Desarrollo (PND) ---
class IndicadorPNDSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndicadorPND
        fields = '__all__'

class MetaPNDSerializer(serializers.ModelSerializer):
    indicadores = IndicadorPNDSerializer(many=True, read_only=True)
    class Meta:
        model = MetaPND
        fields = '__all__'

class PoliticaPNDSerializer(serializers.ModelSerializer):
    metas = MetaPNDSerializer(many=True, read_only=True)
    class Meta:
        model = PoliticaPND
        fields = '__all__'

class ObjetivoPNDSerializer(serializers.ModelSerializer):
    politicas = PoliticaPNDSerializer(many=True, read_only=True)
    class Meta:
        model = ObjetivoPND
        fields = '__all__'

class PlanNacionalDesarrolloSerializer(serializers.ModelSerializer):
    objetivos = ObjetivoPNDSerializer(many=True, read_only=True)
    class Meta:
        model = PlanNacionalDesarrollo
        fields = '__all__'

# --- Serializers para los Objetivos de Desarrollo Sostenible (ODS) ---
class MetaODSSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetaODS
        fields = '__all__'

class EstrategiaODSSerializer(serializers.ModelSerializer):
    metas = MetaODSSerializer(many=True, read_only=True)
    class Meta:
        model = EstrategiaODS
        fields = '__all__'

class ObjetivoDesarrolloSostenibleSerializer(serializers.ModelSerializer):
    estrategias = EstrategiaODSSerializer(many=True, read_only=True)
    class Meta:
        model = ObjetivoDesarrolloSostenible
        fields = '__all__'

# --- SERIALIZERS PARA PLANES INSTITUCIONALES Y ALINEACIÓN

class ObjetivoEstrategicoInstitucionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoEstrategicoInstitucional
        fields = ['oei_id', 'plan_institucional', 'codigo', 'descripcion', 'activo']

class PlanInstitucionalSerializer(serializers.ModelSerializer):
    # Anidamos los OEI para verlos al consultar un plan
    objetivos_estrategicos = ObjetivoEstrategicoInstitucionalSerializer(many=True, read_only=True)

    class Meta:
        model = PlanInstitucional
        fields = [
            'plan_institucional_id', 'entidad', 'periodo', 'estado',
            'fecha_creacion', 'fecha_ultima_actualizacion', 'creador',
            'objetivos_estrategicos'
        ]

class PlanSectorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanSectorial
        fields = '__all__'

# Serializer para representar un objeto genérico de forma legible
class GenericRelatedObjectSerializer(serializers.Field):
    def to_representation(self, value):
        return {
            'id': value.pk,
            'type': value._meta.model_name,
            'description': str(value)
        }

class AlineacionSerializer(serializers.ModelSerializer):
    # Para LECTURA, usamos el serializer personalizado para dar una respuesta clara
    instrumento_origen = GenericRelatedObjectSerializer(read_only=True)
    instrumento_destino = GenericRelatedObjectSerializer(read_only=True)

    # Para ESCRITURA, esperamos los IDs de ContentType y los IDs de los objetos
    instrumento_origen_tipo = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(), write_only=True
    )
    instrumento_destino_tipo = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(), write_only=True
    )

    class Meta:
        model = Alineacion
        fields = [
            'alineacion_id',
            'instrumento_origen',
            'instrumento_destino',
            'instrumento_origen_tipo', # Campo de escritura
            'instrumento_origen_id',   # Campo de escritura
            'instrumento_destino_tipo',# Campo de escritura
            'instrumento_destino_id',  # Campo de escritura
            'contribucion_porcentaje',
            'fecha_creacion',
            'usuario_creacion'
        ]

# AÑADIMOS EL CAMPO DE VERSIÓN AL SERIALIZER DEL PLAN
class PlanInstitucionalSerializer(serializers.ModelSerializer):
    objetivos_estrategicos = ObjetivoEstrategicoInstitucionalSerializer(many=True, read_only=True)

    class Meta:
        model = PlanInstitucional
        fields = [
            'plan_institucional_id', 'entidad', 'periodo', 'estado',
            'version_actual', # <-- AÑADIDO
            'fecha_creacion', 'fecha_ultima_actualizacion', 'creador',
            'objetivos_estrategicos'
        ]

# NUEVO SERIALIZER PARA LAS VERSIONES HISTÓRICAS
class PlanInstitucionalVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanInstitucionalVersion
        fields = '__all__'