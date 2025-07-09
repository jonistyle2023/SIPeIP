# OBJETIVO: Convertir los modelos de Python a JSON para la API.

from rest_framework import serializers
from .models import Catalogo, ItemCatalogo, Entidad, UnidadOrganizacional, PeriodoPlanificacion

# ItemCatalogo
# Este serializer se usará para el CRUD completo de los ítems.
class ItemCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCatalogo
        fields = ['id', 'catalogo', 'nombre', 'codigo', 'activo']

# Catálogo
# Incluye una vista anidada y de solo lectura de sus ítems para dar más contexto.
class CatalogoSerializer(serializers.ModelSerializer):
    # Usamos el 'related_name' que definimos en el modelo ItemCatalogo ('items')
    # Esto mostrará la lista de ítems cuando se consulte un catálogo específico.
    # Es 'read_only' porque los ítems se gestionarán a través de su propio endpoint.
    items = ItemCatalogoSerializer(many=True, read_only=True)

    class Meta:
        model = Catalogo
        fields = ['id', 'nombre', 'codigo', 'descripcion', 'items']

# Entidad
class EntidadSerializer(serializers.ModelSerializer):
    # Para la LECTURA (GET), mostramos el nombre del ítem del catálogo, no solo su ID.
    # Esto hace la API mucho más legible para el frontend.
    nivel_gobierno_nombre = serializers.CharField(source='nivel_gobierno.nombre', read_only=True)
    sector_nombre = serializers.CharField(source='sector.nombre', read_only=True, allow_null=True)

    class Meta:
        model = Entidad
        # En los campos para ESCRITURA (POST/PUT), usamos los campos de FK directos ('nivel_gobierno', 'sector').
        # En los campos para LECTURA, incluimos los campos de solo lectura que definimos arriba.
        fields = [
            'id', 'nombre', 'codigo_unico',
            'nivel_gobierno', 'nivel_gobierno_nombre',
            'sector', 'sector_nombre',
            'activo', 'fecha_creacion', 'fecha_modificacion'
        ]
        # Hacemos que los campos de FK sean de solo escritura en el contexto principal,
        # ya que su representación de lectura es manejada por los campos _nombre.
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
