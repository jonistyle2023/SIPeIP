# OBJETIVO: Definir los modelos de datos para la gestión de Proyectos de Inversión

from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# Importamos modelos de otros módulos con los que nos conectaremos
from apps.institutional_config.models import Entidad, ItemCatalogo
from apps.strategic_objectives.models import ProgramaInstitucional

# --- Modelo Principal del Proyecto de Inversión ---

class ProyectoInversion(models.Model):
    # El CUP se genera al final, por lo que no puede ser el PK.
    # Usamos un AutoField como PK y un campo aparte para el CUP.
    proyecto_id = models.AutoField(primary_key=True)
    cup = models.CharField(max_length=50, unique=True, null=True, blank=True,
                           help_text="Código Único de Proyecto, generado al final del proceso")
    nombre = models.CharField(max_length=500)
    entidad_ejecutora = models.ForeignKey(Entidad, on_delete=models.PROTECT, related_name='proyectos_ejecutados')

    # Vinculación con la planificación estratégica
    programa_institucional = models.ForeignKey(ProgramaInstitucional, on_delete=models.SET_NULL, null=True, blank=True,
                                               related_name='proyectos')

    # Categorización (Formulación)
    tipo_proyecto = models.ForeignKey(ItemCatalogo, on_delete=models.PROTECT, related_name='proyectos_por_tipo',
                                      limit_choices_to={'catalogo__codigo': 'TIPO_PROYECTO'})
    tipologia_proyecto = models.ForeignKey(ItemCatalogo, on_delete=models.PROTECT,
                                           related_name='proyectos_por_tipologia',
                                           limit_choices_to={'catalogo__codigo': 'TIPOLOGIA_PROYECTO'})
    sector = models.ForeignKey(ItemCatalogo, on_delete=models.PROTECT, related_name='proyectos_por_sector',
                               limit_choices_to={'catalogo__codigo': 'SECTORES'})

    estado = models.CharField(max_length=50,
                              default='EN_FORMULACION')

    # Versionamiento
    version_actual = models.PositiveIntegerField(default=1)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_ultima_actualizacion = models.DateTimeField(auto_now=True)
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.cup or '[SIN CUP]'} - {self.nombre}"

class ProyectoInversionVersion(models.Model):
    version_id = models.AutoField(primary_key=True)
    proyecto = models.ForeignKey(ProyectoInversion, on_delete=models.CASCADE, related_name='versiones')
    numero_version = models.PositiveIntegerField()
    fecha_version = models.DateTimeField(auto_now_add=True)
    usuario_responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    datos = models.JSONField(help_text="Snapshot de los datos del proyecto en esta versión")

    class Meta:
        ordering = ['-fecha_version']

# --- Componentes del Marco Lógico (Criterio de Aceptación: Formulación) ---

class MarcoLogico(models.Model):
    """Contenedor para la estructura del Marco Lógico de un proyecto."""
    marco_logico_id = models.AutoField(primary_key=True)
    proyecto = models.OneToOneField(ProyectoInversion, on_delete=models.CASCADE, related_name='marco_logico')
    fin = models.TextField(help_text="El objetivo de desarrollo al cual el proyecto contribuye.")
    proposito = models.TextField(help_text="El resultado directo o el efecto esperado al finalizar el proyecto.")

    def __str__(self):
        return f"Marco Lógico para {self.proyecto.nombre}"

class Componente(models.Model):
    """Los productos o servicios (obras, bienes, servicios) que entrega el proyecto."""
    componente_id = models.AutoField(primary_key=True)
    marco_logico = models.ForeignKey(MarcoLogico, on_delete=models.CASCADE, related_name='componentes')
    nombre = models.CharField(max_length=500)
    descripcion = models.TextField(blank=True, null=True)
    ponderacion = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    def __str__(self):
        return self.nombre

class Actividad(models.Model):
    """Las tareas necesarias para producir cada componente."""
    actividad_id = models.AutoField(primary_key=True)
    componente = models.ForeignKey(Componente, on_delete=models.CASCADE, related_name='actividades')
    descripcion = models.TextField()
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    def __str__(self):
        return self.descripcion[:100]

# Modelos genéricos para Indicadores y Metas, adaptados de tu script
class Indicador(models.Model):
    indicador_id = models.AutoField(primary_key=True)
    descripcion = models.TextField()
    formula = models.TextField(blank=True, null=True)
    unidad_medida = models.CharField(max_length=100)

    # Relación genérica para vincularse a cualquier otro modelo
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    objeto_asociado = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.descripcion

class Meta(models.Model):
    meta_id = models.AutoField(primary_key=True)
    indicador = models.OneToOneField(Indicador, on_delete=models.CASCADE, related_name='meta')
    linea_base = models.DecimalField(max_digits=15, decimal_places=2)
    valor_meta = models.DecimalField(max_digits=15, decimal_places=2)
    periodo_anualizado = models.CharField(max_length=50, help_text="Ej: 2025")

    def __str__(self):
        return f"Meta: {self.valor_meta} {self.indicador.unidad_medida}"

# --- Componentes Financieros y Administrativos ---

class CronogramaValorado(models.Model):
    """Registro del cronograma valorado de actividades o componentes."""
    cronograma_id = models.AutoField(primary_key=True)
    actividad = models.ForeignKey(Actividad, on_delete=models.CASCADE, related_name='cronograma')
    periodo = models.CharField(max_length=7, help_text="Formato AAAA-MM")
    valor_programado = models.DecimalField(max_digits=15, decimal_places=2)

    def __str__(self):
        return f"{self.actividad.descripcion[:30]}... ({self.periodo}): {self.valor_programado}"

class ArrastreInversion(models.Model):  # Criterio de Aceptación: Gestión de Arrastres
    arrastre_id = models.AutoField(primary_key=True)
    proyecto = models.ForeignKey(ProyectoInversion, on_delete=models.CASCADE, related_name='arrastres')
    contrato_info = models.CharField(max_length=255, help_text="Información del contrato")
    monto_devengado = models.DecimalField(max_digits=15, decimal_places=2)
    monto_por_devengar = models.DecimalField(max_digits=15, decimal_places=2)

class DictamenPrioridad(models.Model):  # Criterio de Aceptación: Gestión de Dictámenes
    ESTADO_CHOICES = [('SOLICITUD', 'Solicitud'), ('APROBADO', 'Aprobado'), ('RECHAZADO', 'Rechazado')]
    dictamen_id = models.AutoField(primary_key=True)
    proyecto = models.ForeignKey(ProyectoInversion, on_delete=models.CASCADE, related_name='dictamenes')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='SOLICITUD')
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    usuario_responsable_snp = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    observaciones = models.TextField(blank=True, null=True)
