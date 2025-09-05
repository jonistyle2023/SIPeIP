from rest_framework import serializers
from .models import Catalogo, ItemCatalogo, Entidad, UnidadOrganizacional, PeriodoPlanificacion

class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

# ItemCatalogo
# Este serializer se usará para el CRUD completo de los ítems.
class ItemCatalogoSerializer(serializers.ModelSerializer):
    # El campo 'hijos' usará el serializador recursivo para mostrar los ítems anidados.
    hijos = RecursiveField(many=True, read_only=True)

    class Meta:
        model = ItemCatalogo
        fields = ['id', 'catalogo', 'nombre', 'codigo', 'activo', 'padre', 'hijos']

# Catálogo
class CatalogoSerializer(serializers.ModelSerializer):
    items = ItemCatalogoSerializer(many=True, read_only=True)

    class Meta:
        model = Catalogo
        fields = ['id', 'nombre', 'codigo', 'descripcion', 'items']

# Entidad
class EntidadSerializer(serializers.ModelSerializer):
    nivel_gobierno_nombre = serializers.CharField(source='nivel_gobierno.nombre', read_only=True)
    subsector_nombre = serializers.CharField(source='subsector.nombre', read_only=True, allow_null=True)

    class Meta:
        model = Entidad
        fields = [
            'id', 'nombre', 'codigo_unico',
            'nivel_gobierno', 'nivel_gobierno_nombre',
            'subsector', 'subsector_nombre',
            'activo', 'fecha_creacion', 'fecha_modificacion'
        ]
        extra_kwargs = {
            'nivel_gobierno': {'write_only': True},
            'subsector': {'write_only': True, 'required': False, 'allow_null': True},
        }

# UnidadOrganizacional
class UnidadOrganizacionalSerializer(serializers.ModelSerializer):
    entidad_nombre = serializers.CharField(source='entidad.nombre', read_only=True)
    padre_nombre = serializers.CharField(source='padre.nombre', read_only=True, allow_null=True)
    macrosector_nombre = serializers.CharField(source='macrosector.nombre', read_only=True, allow_null=True)
    sectores_nombres = serializers.SerializerMethodField()

    class Meta:
        model = UnidadOrganizacional
        fields = [
            'id', 'nombre', 'entidad', 'entidad_nombre',
            'padre', 'padre_nombre',
            'macrosector', 'macrosector_nombre',
            'sectores', 'sectores_nombres',
            'activo'
        ]
        extra_kwargs = {
            'entidad': {'write_only': True},
            'padre': {'write_only': True, 'required': False, 'allow_null': True},
            'macrosector': {'write_only': True, 'required': False, 'allow_null': True},
            'sectores': {'write_only': True, 'required': False},
        }

    def get_sectores_nombres(self, obj):
        return [s.nombre for s in obj.sectores.all()]

# PeriodoPlanificacion
class PeriodoPlanificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoPlanificacion
        fields = '__all__'
