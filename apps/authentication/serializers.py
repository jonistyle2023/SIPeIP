from rest_framework import serializers
from .models import Usuario, RegistroAuditoria, Rol
import re

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'descripcion']

class UsuarioSerializer(serializers.ModelSerializer):
    roles = RolSerializer(many=True, read_only=True)
    roles_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Rol.objects.all(), source='roles'
    )
    token = serializers.CharField(source='auth_token.key', read_only=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre_usuario', 'entidad_codigo', 'roles', 'roles_ids',
            'password', 'datos_basicos', 'fecha_creacion', 'ultimo_acceso',
            'is_active', 'token'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    @staticmethod
    def validate_password(value):
        if not re.search(r'[A-Z]', value): raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
        if not re.search(r'[a-z]', value): raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula.")
        if not re.search(r'[0-9]', value): raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        if not re.search(r'[\W_]', value): raise serializers.ValidationError("La contraseña debe contener al menos un símbolo.")
        if len(value) < 8: raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return value

    def create(self, validated_data):
        roles_data = validated_data.pop('roles', None)
        user = Usuario.objects.create_user(**validated_data)
        if roles_data:
            user.roles.set(roles_data)
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        roles_data = validated_data.pop('roles', None)
        instance = super().update(instance, validated_data)
        if roles_data is not None:
            instance.roles.set(roles_data)
        return instance

class RegistroAuditoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAuditoria
        fields = '__all__'


class ValidationError:
    def __init__(self):
        self.detail = None

    pass