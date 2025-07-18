# OBJETIVO: Convertir los modelos de Proyectos de Inversión a formato JSON.
from django.db.models import Sum
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
        # Se quita 'meta_id' para la creación anidada
        fields = ['linea_base', 'valor_meta', 'periodo_anualizado']

class IndicadorSerializer(serializers.ModelSerializer):
    meta = MetaSerializer()
    content_type_id = serializers.IntegerField(write_only=True, required=False)
    object_id = serializers.IntegerField(write_only=True, required=False)
    tipo_indicador = serializers.CharField(write_only=True, required=False)
    objeto_asociado = GenericRelatedObjectSerializer(read_only=True)
    descripcion_sin_prefijo = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Indicador
        fields = [
            'indicador_id', 'descripcion', 'descripcion_sin_prefijo', 'formula', 'unidad_medida',
            'objeto_asociado', 'meta', 'content_type_id', 'object_id', 'tipo_indicador'
        ]
        read_only_fields = ['indicador_id', 'objeto_asociado', 'descripcion_sin_prefijo']

    def get_descripcion_sin_prefijo(self, obj):
        desc = obj.descripcion or ''
        if desc.lower().startswith('fin:'):
            return desc[5:].strip()
        if desc.lower().startswith('propósito:'):
            return desc[10:].strip()
        return desc

    def create(self, validated_data):
        meta_datos = validated_data.pop('meta')
        content_type_id = validated_data.pop('content_type_id')
        id_del_objeto_padre = validated_data.pop('object_id')
        descripcion_indicador = validated_data.pop('descripcion')
        formula_indicador = validated_data.pop('formula', None)
        unidad_medida_indicador = validated_data.pop('unidad_medida')
        tipo_indicador = validated_data.pop('tipo_indicador', None)

        tipo_de_contenido = ContentType.objects.get(id=content_type_id)

        # Prefijo automático para Fin/Propósito
        if tipo_de_contenido.model == 'marcologico':
            if tipo_indicador == 'Fin' and not descripcion_indicador.lower().startswith('fin:'):
                descripcion_indicador = 'Fin: ' + descripcion_indicador
            elif tipo_indicador == 'Proposito' and not descripcion_indicador.lower().startswith('propósito:'):
                descripcion_indicador = 'Propósito: ' + descripcion_indicador

        nuevo_indicador = Indicador.objects.create(
            content_type=tipo_de_contenido,
            object_id=id_del_objeto_padre,
            descripcion=descripcion_indicador,
            formula=formula_indicador,
            unidad_medida=unidad_medida_indicador
        )

        Meta.objects.create(
            indicador=nuevo_indicador,
            linea_base=meta_datos['linea_base'],
            valor_meta=meta_datos['valor_meta'],
            periodo_anualizado=meta_datos['periodo_anualizado']
        )

        return nuevo_indicador

    def update(self, instance, validated_data):
        meta_datos = validated_data.pop('meta', None)
        content_type_id = validated_data.pop('content_type_id', None)
        object_id = validated_data.pop('object_id', None)
        tipo_indicador = validated_data.pop('tipo_indicador', None)
        descripcion = validated_data.get('descripcion', None)

        # Si no viene tipo_indicador, dedúcelo del valor actual
        if not tipo_indicador:
            if instance.descripcion.lower().startswith('fin:'):
                tipo_indicador = 'Fin'
            elif instance.descripcion.lower().startswith('propósito:'):
                tipo_indicador = 'Proposito'

        # Prefijo automático para Fin/Propósito
        if tipo_indicador and descripcion:
            if tipo_indicador == 'Fin' and not descripcion.lower().startswith('fin:'):
                validated_data['descripcion'] = 'Fin: ' + descripcion
            elif tipo_indicador == 'Proposito' and not descripcion.lower().startswith('propósito:'):
                validated_data['descripcion'] = 'Propósito: ' + descripcion

        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)

        if content_type_id:
            instance.content_type = ContentType.objects.get(id=content_type_id)
        if object_id:
            instance.object_id = object_id

        instance.save()

        if meta_datos:
            meta = instance.meta
            for key, value in meta_datos.items():
                if value is not None:
                    setattr(meta, key, value)
            meta.save()

        return instance

class CronogramaValoradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CronogramaValorado
        fields = '__all__'

class ActividadSerializer(serializers.ModelSerializer):
    cronograma = CronogramaValoradoSerializer(many=True, read_only=True)
    class Meta:
        model = Actividad
        # AÑADIR 'cronograma' a la lista de campos
        fields = ['actividad_id', 'componente', 'descripcion', 'fecha_inicio', 'fecha_fin', 'cronograma']

class ComponenteSerializer(serializers.ModelSerializer):
    actividades = ActividadSerializer(many=True, read_only=True)

    # --- CORRECCIÓN ---
    # En lugar de depender de la relación implícita, usamos un método para
    # buscar y serializar explícitamente los indicadores de este componente.
    indicadores = serializers.SerializerMethodField()

    class Meta:
        model = Componente
        fields = ['componente_id', 'marco_logico', 'nombre', 'descripcion', 'ponderacion', 'actividades', 'indicadores']

    def get_indicadores(self, obj):
        """
        Versión Final y Directa: Filtra los indicadores usando directamente
        el ID del ContentType del componente (que sabemos es 9).
        'obj' es una instancia del modelo Componente.
        """
        # Según tu SQL, el ID para el ContentType de Componente es 9.
        # Filtramos directamente por ese número.
        indicadores_del_componente = Indicador.objects.filter(
            content_type_id=9,
            object_id=obj.pk
        )

        # Serializamos los resultados para la respuesta.
        return IndicadorSerializer(indicadores_del_componente, many=True).data

class MarcoLogicoSerializer(serializers.ModelSerializer):
    componentes = ComponenteSerializer(many=True, read_only=True)
    # MODIFICACIÓN: Incluimos los indicadores de Fin y Propósito.
    indicadores = IndicadorSerializer(many=True, read_only=True)

    class Meta:
        model = MarcoLogico
        fields = ['marco_logico_id', 'proyecto', 'fin', 'proposito', 'componentes', 'indicadores']

# --- Serializer Principal del Proyecto de Inversión ---

class ArrastreInversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArrastreInversion
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
    monto_total_programado = serializers.SerializerMethodField()

# --- CORRECCIÓN CLAVE ---
    # Se añade 'allow_null=True' para evitar el error 500 si un proyecto no tiene programa asignado.
    programa_institucional_nombre = serializers.CharField(
        source='programa_institucional.nombre',
        read_only=True,
        allow_null=True
    )

    marco_logico = MarcoLogicoSerializer(read_only=True)
    arrastres = ArrastreInversionSerializer(many=True, read_only=True)
    dictamenes = DictamenPrioridadSerializer(many=True, read_only=True)

    class Meta:
        model = ProyectoInversion
        fields = [
            'proyecto_id', 'cup', 'nombre', 'entidad_ejecutora',
            'tipo_proyecto', 'tipologia_proyecto', 'sector',
            'tipo_proyecto_nombre', 'tipologia_proyecto_nombre', 'sector_nombre',
            'estado', 'version_actual', 'creador',
            'marco_logico', 'arrastres', 'dictamenes',
            'programa_institucional', 'contribucion_programa', 'programa_institucional_nombre',
            'monto_total_programado'
        ]

    def get_monto_total_programado(self, obj):
        total = obj.marco_logico.componentes.all() \
            .aggregate(total=Sum('actividades__cronograma__valor_programado'))['total']
        return total if total is not None else 0.00