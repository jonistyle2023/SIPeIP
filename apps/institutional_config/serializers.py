from rest_framework import serializers
from .models import Catalogo, ItemCatalogo, Entidad, UnidadOrganizacional, PeriodoPlanificacion

# ItemCatalogo
# Este serializer se usará para el CRUD completo de los ítems.
class ItemCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCatalogo
        fields = ['id', 'catalogo', 'nombre', 'codigo', 'activo']

# Catálogo
class CatalogoSerializer(serializers.ModelSerializer):
    items = ItemCatalogoSerializer(many=True, read_only=True)

    class Meta:
        model = Catalogo
        fields = ['id', 'nombre', 'codigo', 'descripcion', 'items']

# Entidad
class EntidadSerializer(serializers.ModelSerializer):
    nivel_gobierno_nombre = serializers.CharField(source='nivel_gobierno.nombre', read_only=True)
    sector_nombre = serializers.CharField(source='sector.nombre', read_only=True, allow_null=True)

    class Meta:
        model = Entidad
        fields = [
            'id', 'nombre', 'codigo_unico',
            'nivel_gobierno', 'nivel_gobierno_nombre',
            'sector', 'sector_nombre',
            'activo', 'fecha_creacion', 'fecha_modificacion'
        ]
        extra_kwargs = {
            'nivel_gobierno': {'write_only': True},
            'sector': {'write_only': True, 'required': False, 'allow_null': True},
        }

# UnidadOrganizacional
class UnidadOrganizacionalSerializer(serializers.ModelSerializer):
    entidad_nombre = serializers.CharField(source='entidad.nombre', read_only=True)
    padre_nombre = serializers.CharField(source='padre.nombre', read_only=True, allow_null=True)

    class Meta:
        model = UnidadOrganizacional
        fields = [
            'id', 'nombre', 'entidad', 'entidad_nombre',
            'padre', 'padre_nombre', 'activo'
        ]
        extra_kwargs = {
            'entidad': {'write_only': True},
            'padre': {'write_only': True, 'required': False, 'allow_null': True},
        }

# PeriodoPlanificacion
class PeriodoPlanificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoPlanificacion
        fields = '__all__'
