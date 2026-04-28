from django.db import models
from django.conf import settings
from apps.investment_projects.models import ProyectoInversion
from apps.strategic_objectives.models import ObjetivoEstrategicoInstitucional

class Objective(models.Model):
    RULE_CHOICES = (('AND', 'Todos'), ('OR', 'Al menos uno'))
    STATUS_CHOICES = (('NO_INICIADO', 'No Iniciado'), ('EN_PROGRESO', 'En Progreso'), ('CUMPLIDO', 'Cumplido'), ('NO_CUMPLIDO', 'No Cumplido'))

    strategic_objective = models.ForeignKey(
        ObjetivoEstrategicoInstitucional, 
        on_delete=models.CASCADE, 
        related_name='tracking_objectives',
        null=True # TEMPORAL: Para permitir la migración.
    )
    
    name = models.CharField(max_length=255, help_text="Nombre específico para el objetivo de seguimiento")
    rule = models.CharField(max_length=3, choices=RULE_CHOICES, default='AND')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NO_INICIADO')

    def __str__(self):
        return f"{self.name} (Tracking para OEI: {self.strategic_objective.codigo if self.strategic_objective else 'N/A'})"

# Permite Registrar los datos solicitados
class TrackingActivity(models.Model):
    STATUS_CHOICES = (('PLANIFICADA', 'Planificada'), ('EN_PROGRESO', 'En Progreso'), ('COMPLETADA', 'Completada'), ('EN_RIESGO', 'En Riesgo'))
    PRIORITY_CHOICES = [(i, str(i)) for i in range(1, 6)]

    # Asociación con Objetivos estrategicos
    project = models.ForeignKey(ProyectoInversion, on_delete=models.CASCADE, related_name='tracking_activities')

    # Asociación Actividad - objetivo
    objectives = models.ManyToManyField(Objective, related_name='tracking_activities')
    
    activity_code = models.CharField(max_length=20, editable=False, null=True, blank=True) # Permitir null para facilitar la migración
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    responsible = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='responsible_activities')
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3)
    
    planned_start_date = models.DateField()
    planned_end_date = models.DateField()
    real_start_date = models.DateField(null=True, blank=True)
    real_end_date = models.DateField(null=True, blank=True)
    
    planned_duration_days = models.IntegerField(editable=False)
    
    reported_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANIFICADA')

    # Asegura que las eliminaciones sean lógicas.
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_tracking_activities', on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='updated_tracking_activities', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('project', 'activity_code')

    def save(self, *args, **kwargs):
        # Generar código de actividad si no existe
        if not self.activity_code:
            last_activity = TrackingActivity.objects.filter(project=self.project).order_by('id').last()
            if last_activity and last_activity.activity_code:
                try:
                    last_code = int(last_activity.activity_code.replace('ACT', ''))
                    self.activity_code = f'ACT{last_code + 1:03d}'
                except (ValueError, TypeError):
                    self.activity_code = 'ACT001' # Fallback
            else:
                self.activity_code = 'ACT001'
        
        self.planned_duration_days = (self.planned_end_date - self.planned_start_date).days
        self.update_reported_status()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.activity_code} - {self.name}"
