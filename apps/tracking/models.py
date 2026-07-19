from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models, transaction
from django.conf import settings
from django.utils import timezone
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
    
    # save() genera este código automáticamente para toda fila nueva (ver más abajo), así que nunca queda vacío en la práctica.
    activity_code = models.CharField(max_length=20, editable=False, blank=True, default='')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    responsible = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='responsible_activities')
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=3)
    
    planned_start_date = models.DateField()
    planned_end_date = models.DateField()
    real_start_date = models.DateField(null=True, blank=True)
    real_end_date = models.DateField(null=True, blank=True)
    real_progress = models.IntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Porcentaje de avance real reportado (0-100)."
    )

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

    def update_reported_status(self):
        """Recalcula reported_status a partir de las fechas planificadas/reales."""
        today = timezone.now().date()
        if self.real_end_date:
            self.reported_status = 'COMPLETADA'
        elif self.real_start_date:
            if self.planned_end_date and today > self.planned_end_date:
                self.reported_status = 'EN_RIESGO'
            else:
                self.reported_status = 'EN_PROGRESO'
        else:
            if self.planned_start_date and today > self.planned_start_date:
                self.reported_status = 'EN_RIESGO'
            else:
                self.reported_status = 'PLANIFICADA'

    def save(self, *args, **kwargs):
        self.planned_duration_days = (self.planned_end_date - self.planned_start_date).days
        self.update_reported_status()

        if self.activity_code:
            super().save(*args, **kwargs)
            return

        # Generar código de actividad de forma atómica para evitar colisiones
        # cuando se crean varias actividades del mismo proyecto en paralelo.
        with transaction.atomic():
            ProyectoInversion.objects.select_for_update().get(pk=self.project_id)
            existing_codes = TrackingActivity.objects.select_for_update().filter(
                project=self.project, activity_code__isnull=False
            ).values_list('activity_code', flat=True)

            max_code = 0
            for code in existing_codes:
                try:
                    max_code = max(max_code, int(code.replace('ACT', '')))
                except (ValueError, TypeError):
                    continue
            self.activity_code = f'ACT{max_code + 1:03d}'
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.activity_code} - {self.name}"
