# OBJETIVO: Modelos adaptados para reflejar el script de la base de datos existente.

from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from apps.institutional_config.models import Entidad, PeriodoPlanificacion

# --- Plan Nacional de Desarrollo (PND) ---

class PlanNacionalDesarrollo(models.Model):
    pnd_id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    periodo = models.CharField(max_length=50)
    fecha_publicacion = models.DateField()

    def __str__(self):
        return self.nombre

class ObjetivoPND(models.Model):
    objetivo_pnd_id = models.AutoField(primary_key=True)
    pnd = models.ForeignKey(PlanNacionalDesarrollo, on_delete=models.CASCADE, related_name='objetivos')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return f"{self.codigo} - {self.pnd.nombre}"


class PoliticaPND(models.Model):
    politica_pnd_id = models.AutoField(primary_key=True)
    objetivo_pnd = models.ForeignKey(ObjetivoPND, on_delete=models.CASCADE, related_name='politicas')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return self.codigo


class MetaPND(models.Model):
    meta_pnd_id = models.AutoField(primary_key=True)
    politica_pnd = models.ForeignKey(PoliticaPND, on_delete=models.CASCADE, related_name='metas')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return self.codigo


class IndicadorPND(models.Model):
    indicador_pnd_id = models.AutoField(primary_key=True)
    meta_pnd = models.ForeignKey(MetaPND, on_delete=models.CASCADE, related_name='indicadores')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return self.codigo


# --- Objetivos de Desarrollo Sostenible (ODS) ---

class ObjetivoDesarrolloSostenible(models.Model):
    ods_id = models.AutoField(primary_key=True)
    numero = models.IntegerField()
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()

    def __str__(self):
        return f"ODS {self.numero}: {self.nombre}"


class EstrategiaODS(models.Model):
    estrategia_ods_id = models.AutoField(primary_key=True)
    ods = models.ForeignKey(ObjetivoDesarrolloSostenible, on_delete=models.CASCADE, related_name='estrategias')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return self.codigo


class MetaODS(models.Model):
    meta_ods_id = models.AutoField(primary_key=True)
    estrategia_ods = models.ForeignKey(EstrategiaODS, on_delete=models.CASCADE, related_name='metas')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return self.codigo


# --- Planes Institucionales y Sectoriales ---

class PlanInstitucional(models.Model):
    ESTADO_CHOICES = [('BORRADOR', 'Borrador'), ('VALIDADO', 'Validado'), ('APROBADO', 'Aprobado')]
    plan_institucional_id = models.AutoField(primary_key=True)
    entidad = models.ForeignKey(Entidad, on_delete=models.PROTECT)
    periodo = models.ForeignKey(PeriodoPlanificacion, on_delete=models.PROTECT)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='BORRADOR')
    version_actual = models.PositiveIntegerField(default=1, help_text="La versión actual del plan")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_ultima_actualizacion = models.DateTimeField(auto_now=True)
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
                                related_name='planes_creados')

    def __str__(self):
        return f"Plan de {self.entidad.nombre} ({self.periodo.nombre}) v{self.version_actual}"


# HISTÓRICO DE VERSIONES
class PlanInstitucionalVersion(models.Model):
    version_id = models.AutoField(primary_key=True)
    plan_institucional = models.ForeignKey(PlanInstitucional, on_delete=models.CASCADE, related_name='versiones')
    numero_version = models.PositiveIntegerField()
    fecha_version = models.DateTimeField(auto_now_add=True)
    usuario_responsable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    # Usamos JSONField para guardar una "foto" flexible de los datos del plan.
    datos = models.JSONField(help_text="Snapshot de los datos del plan en esta versión")

    class Meta:
        ordering = ['-fecha_version']

    def __str__(self):
        return f"Versión {self.numero_version} de {self.plan_institucional.plan_institucional_id}"


class ObjetivoEstrategicoInstitucional(models.Model):
    oei_id = models.AutoField(primary_key=True)
    plan_institucional = models.ForeignKey(PlanInstitucional, on_delete=models.CASCADE,
                                           related_name='objetivos_estrategicos')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"OEI {self.codigo} - {self.plan_institucional.entidad.nombre}"


class PlanSectorial(models.Model):
    plan_sectorial_id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    periodo = models.CharField(max_length=50)
    entidad_responsable = models.ForeignKey(Entidad, on_delete=models.PROTECT)
    fecha_publicacion = models.DateField()

    def __str__(self):
        return self.nombre


# --- Modelo de Alineación Genérica ---
# Implementa la tabla 'alineacion' usando ContentType de Django para máxima flexibilidad.
class Alineacion(models.Model):
    alineacion_id = models.AutoField(primary_key=True)

    # --- Instrumento Origen (el que se alinea) ---
    # Guarda el tipo de modelo (ej. 'ObjetivoEstrategicoInstitucional')
    instrumento_origen_tipo = models.ForeignKey(ContentType, on_delete=models.CASCADE,
                                                related_name='alineaciones_origen')
    # Guarda el ID del objeto específico (ej. el OEI con id=5)
    instrumento_origen_id = models.PositiveIntegerField()
    # Combina los dos campos anteriores en un solo campo de relación genérico
    instrumento_origen = GenericForeignKey('instrumento_origen_tipo', 'instrumento_origen_id')

    # --- Instrumento Destino (al que se alinea) ---
    instrumento_destino_tipo = models.ForeignKey(ContentType, on_delete=models.CASCADE,
                                                 related_name='alineaciones_destino')
    instrumento_destino_id = models.PositiveIntegerField()
    instrumento_destino = GenericForeignKey('instrumento_destino_tipo', 'instrumento_destino_id')

    contribucion_porcentaje = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    usuario_creacion = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        # Evita duplicados en la alineación
        unique_together = ('instrumento_origen_tipo', 'instrumento_origen_id', 'instrumento_destino_tipo',
                           'instrumento_destino_id')

    def __str__(self):
        return f"{self.instrumento_origen} -> {self.instrumento_destino}"


class ProgramaInstitucional(models.Model):
    programa_id = models.AutoField(primary_key=True)
    entidad = models.ForeignKey(Entidad, on_delete=models.CASCADE, related_name='programas')
    nombre = models.CharField(max_length=255)
    # Un programa se alinea con uno o varios OEI
    oei_alineados = models.ManyToManyField(
        'ObjetivoEstrategicoInstitucional',
        related_name='programas_alineados',
        blank=True
    )

    version_actual = models.PositiveIntegerField(default=1)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_ultima_actualizacion = models.DateTimeField(auto_now=True)
    creador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Programa Institucional"
        verbose_name_plural = "Programas Institucionales"


class ObjetivoSectorial(models.Model):
    objetivo_sectorial_id = models.AutoField(primary_key=True)
    plan_sectorial = models.ForeignKey(PlanSectorial, on_delete=models.CASCADE, related_name='objetivos')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return f"{self.codigo} - {self.plan_sectorial.nombre}"
