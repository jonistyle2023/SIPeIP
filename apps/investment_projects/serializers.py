# OBJETIVO: Convertir los modelos de Proyectos de Inversión a formato JSON.
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import (
    ProyectoInversion, MarcoLogico, Componente, Actividad,
    Indicador, Meta, ArrastreInversion, CronogramaValorado,
    DictamenPrioridad
)
from apps.strategic_objectives.serializers import GenericRelatedObjectSerializer

# --- Marco Lógico ---

class MetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meta
        fields = ['meta_id', 'linea_base', 'valor_meta', 'periodo_anualizado']

class IndicadorSerializer(serializers.ModelSerializer):
    # Para LECTURA, mostramos una descripción del objeto asociado
    objeto_asociado = GenericRelatedObjectSerializer(read_only=True)
    # Anidamos la meta para verla junto al indicador
    meta = MetaSerializer(read_only=True)

    # Para ESCRITURA, esperamos los IDs
    content_type = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(), write_only=True
    )
    object_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Indicador
        fields = [
            'indicador_id', 'descripcion', 'formula', 'unidad_medida',
            'objeto_asociado', 'meta', 'content_type', 'object_id'
        ]

class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = ['actividad_id', 'componente', 'descripcion', 'fecha_inicio', 'fecha_fin']

class ComponenteSerializer(serializers.ModelSerializer):
    actividades = ActividadSerializer(many=True, read_only=True)

    class Meta:
        model = Componente
        fields = ['componente_id', 'marco_logico', 'nombre', 'descripcion', 'ponderacion', 'actividades']

class MarcoLogicoSerializer(serializers.ModelSerializer):
    componentes = ComponenteSerializer(many=True, read_only=True)

    class Meta:
        model = MarcoLogico
        fields = ['marco_logico_id', 'proyecto', 'fin', 'proposito', 'componentes']

# --- Serializer Principal del Proyecto de Inversión ---

class ArrastreInversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArrastreInversion
        fields = '__all__'

class CronogramaValoradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CronogramaValorado
        fields = '__all__'

class DictamenPrioridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = DictamenPrioridad
        fields = '__all__'
        read_only_fields = ('estado', 'fecha_solicitud') # El estado se maneja con acciones

class ProyectoInversionSerializer(serializers.ModelSerializer):
    tipo_proyecto_nombre = serializers.CharField(source='tipo_proyecto.nombre', read_only=True)
    tipologia_proyecto_nombre = serializers.CharField(source='tipologia_proyecto.nombre', read_only=True)
    sector_nombre = serializers.CharField(source='sector.nombre', read_only=True)
    marco_logico = MarcoLogicoSerializer(read_only=True)
    dictamenes = DictamenPrioridadSerializer(many=True, read_only=True)
    arrastres = ArrastreInversionSerializer(many=True, read_only=True)

    class Meta:
        model = ProyectoInversion
        fields = [
            'proyecto_id', 'cup', 'nombre', 'entidad_ejecutora', 'programa_institucional',
            'tipo_proyecto', 'tipo_proyecto_nombre',
            'tipologia_proyecto', 'tipologia_proyecto_nombre',
            'sector', 'sector_nombre',
            'estado', 'version_actual', 'creador', 'marco_logico',
            'dictamenes', 'arrastres' # <-- AÑADIDOS
        ]
        extra_kwargs = {
            'tipo_proyecto': {'write_only': True},
            'tipologia_proyecto': {'write_only': True},
            'sector': {'write_only': True},
            'cup': {'read_only': True}, # El CUP no se puede editar directamente
        }