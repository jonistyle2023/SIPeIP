from rest_framework import serializers
from .models import Objective, TrackingActivity

class ObjectiveSerializer(serializers.ModelSerializer):
    # Campo de solo lectura para mostrar el código del OEI en las respuestas GET
    strategic_objective_code = serializers.CharField(source='strategic_objective.codigo', read_only=True)

    class Meta:
        model = Objective
        fields = [
            'id', 
            'name', 
            'rule', 
            'status', 
            'strategic_objective',      # Usado para escribir (recibe el ID)
            'strategic_objective_code'  # Usado para leer (muestra el código)
        ]
        read_only_fields = ('status',) # El status se debe manejar internamente, no por el usuario

# Reglas de Negocio
class TrackingActivitySerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.nombre', read_only=True)
    responsible_name = serializers.CharField(source='responsible.get_full_name', read_only=True)

    class Meta:
        model = TrackingActivity
        fields = [
            'id', 'project', 'project_name', 'activity_code', 'objectives', 'name', 'description',
            'responsible', 'responsible_name', 'priority',
            'planned_start_date', 'planned_end_date', 'real_start_date', 'real_end_date',
            'planned_duration_days', 'reported_status', 'is_active',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        ]
        read_only_fields = (
            'activity_code', 'planned_duration_days', 'reported_status', 
            'created_by', 'updated_by', 'is_active'
        )

    # Validaciones (V-01, V-02)
    def validate(self, data):
        # ... (la lógica de validación no cambia)
        planned_start = data.get('planned_start_date', getattr(self.instance, 'planned_start_date', None))
        planned_end = data.get('planned_end_date', getattr(self.instance, 'planned_end_date', None))
        
        if planned_start and planned_end and planned_start > planned_end:
            raise serializers.ValidationError({"planned_end_date": "La fecha de fin planificada no puede ser anterior a la fecha de inicio."})

        is_creating = self.instance is None
        if is_creating:
            if not data.get('project'):
                raise serializers.ValidationError({"project": "Se requiere un proyecto."})
            if not data.get('objectives'):
                raise serializers.ValidationError({"objectives": "Se requiere al menos un objetivo."})
        
        return data
