from rest_framework import serializers
from .models import AuditEvent

class AuditEventSerializer(serializers.ModelSerializer):
    # Mostramos el username para que sea más legible
    user = serializers.StringRelatedField()
    # Mostramos el nombre del modelo (ej: 'ProyectoInversion')
    content_type = serializers.StringRelatedField()

    class Meta:
        model = AuditEvent
        fields = '__all__'