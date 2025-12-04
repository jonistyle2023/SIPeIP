from rest_framework import serializers
from .models import AuditEvent

class AuditEventSerializer(serializers.ModelSerializer):
    # username
    user = serializers.StringRelatedField()
    # modelo
    content_type = serializers.StringRelatedField()

    class Meta:
        model = AuditEvent
        fields = '__all__'