from rest_framework import serializers
from .models import Usuario, RegistroAuditoria
from django.contrib.auth.hashers import make_password

import re

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

    def validate_clave(self, value):
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        if not re.search(r'[\W_]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un símbolo.")
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return value

    def create(self, validated_data):
        validated_data['clave'] = make_password(validated_data['clave'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'clave' in validated_data:
            validated_data['clave'] = make_password(validated_data['clave'])
        return super().update(instance, validated_data)


class RegistroAuditoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAuditoria
        fields = '__all__'
