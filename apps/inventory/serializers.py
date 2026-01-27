from rest_framework import serializers
from .models import Lubricant, SparePart

class LubricantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lubricant
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

class SparePartSerializer(serializers.ModelSerializer):
    class Meta:
        model = SparePart
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')
