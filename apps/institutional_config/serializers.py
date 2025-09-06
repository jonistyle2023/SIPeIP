from rest_framework import serializers
from .models import Catalogo, ItemCatalogo, Entidad, UnidadOrganizacional, PeriodoPlanificacion

class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

# ItemCatalogo
# Este serializer se usará para el CRUD completo de los ítems.
class ItemCatalogoSerializer(serializers.ModelSerializer):
    hijos = RecursiveField(many=True, read_only=True)

    class Meta:
        model = ItemCatalogo
        fields = ['id', 'catalogo', 'nombre', 'codigo', 'activo', 'padre', 'hijos']

# Catálogo
class CatalogoSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Catalogo
        fields = ['id', 'nombre', 'codigo', 'descripcion', 'items']

    def get_items(self, obj):
        """
        Este método se ejecuta para el campo 'items'.
        Filtra y devuelve solo los ítems que no tienen padre (los Macrosectores).
        """
        # Filtramos los items del catálogo para obtener solo los que son raíz
        root_items = obj.items.filter(padre__isnull=True)
        # Serializamos únicamente esos ítems raíz (que ya incluyen a sus hijos)
        serializer = ItemCatalogoSerializer(root_items, many=True, context=self.context)
        return serializer.data

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
