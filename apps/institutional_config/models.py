# Modelo para Catálogos Genéricos
# NOTA: "Gestión de Catálogos y Datos Maestros" (tipos de intervención, sectores, etc.)
# Esto evita tener texto libre y previene la "información basura".

# IMPORTACIONES
from django.db import models

class Catalogo(models.Model):
    nombre = models.CharField(max_length=255, unique=True,
                              help_text="Nombre del catálogo (ej. 'Sectores', 'Tipos de Plan')")
    codigo = models.CharField(max_length=50, unique=True, help_text="Código único para el catálogo")
    descripcion = models.TextField(blank=True, null=True)
    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "Catálogo"
        verbose_name_plural = "Catálogos"
        ordering = ['nombre']

class ItemCatalogo(models.Model):
    catalogo = models.ForeignKey(Catalogo, on_delete=models.CASCADE, related_name='items')
    nombre = models.CharField(max_length=255, help_text="Nombre del item (ej. 'Salud', 'Educación')")
    codigo = models.CharField(max_length=50, blank=True, null=True, help_text="Código opcional para el item")
    activo = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.catalogo.nombre} - {self.nombre}"

    class Meta:
        verbose_name = "Ítem de Catálogo"
        verbose_name_plural = "Ítems de Catálogos"
        unique_together = ('catalogo', 'nombre')  # No pueden existir dos items con el mismo nombre en el mismo catálogo
        ordering = ['catalogo__nombre', 'nombre']

# ENTIDADES
# NOTA: "Gestión de Entidades y Unidades Organizacionales"
class Entidad(models.Model):
    nombre = models.CharField(max_length=255, unique=True)
    codigo_unico = models.CharField(max_length=50, unique=True, help_text="Código único de creación de la entidad")
    nivel_gobierno = models.ForeignKey(
        ItemCatalogo,
        on_delete=models.SET_NULL,
        null=True, blank=False,  # Hacemos que no sea opcional en la BD
        limit_choices_to={'catalogo__codigo': 'NIVEL_GOBIERNO'},
        related_name='entidades_por_nivel',
        help_text="Nivel de gobierno al que pertenece la entidad"
    )
    sector = models.ForeignKey(
        ItemCatalogo,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        limit_choices_to={'catalogo__codigo': 'SECTORES'},
        related_name='entidades_por_sector'
    )
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.nombre
    class Meta:
        verbose_name = "Entidad"
        verbose_name_plural = "Entidades"
        ordering = ['nombre']

# Unidades Organizacionales (Jerarquía dentro de una Entidad)
class UnidadOrganizacional(models.Model):
    nombre = models.CharField(max_length=255)
    entidad = models.ForeignKey(Entidad, on_delete=models.CASCADE, related_name='unidades')

    # Crear Jerarquías
    padre = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='hijos'
    )
    activo = models.BooleanField(default=True)
    def __str__(self):
        if self.padre:
            return f"{self.entidad.nombre} | {self.padre.nombre} -> {self.nombre}"
        return f"{self.entidad.nombre} | {self.nombre}"
    class Meta:
        verbose_name = "Unidad Organizacional"
        verbose_name_plural = "Unidades Organizacionales"
        unique_together = ('entidad', 'nombre')
        ordering = ['entidad__nombre', 'nombre']

# Períodos de Planificación
# NOTA: "Gestión de Períodos"
class PeriodoPlanificacion(models.Model):
    ESTADO_CHOICES = [
        ('ABIERTO', 'Abierto'),
        ('CERRADO', 'Cerrado'),
        ('EN_CIERRE', 'En Cierre'),
    ]

    nombre = models.CharField(max_length=100, help_text="Ej: 'Planificación Estratégica 2025-2029'")
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='ABIERTO')

    # tener solo un período activo para la carga de nueva información
    es_activo_para_carga = models.BooleanField(default=False,
                                               help_text="Indica si en este período se puede ingresar nueva información.")
    def __str__(self):
        return f"{self.nombre} ({self.fecha_inicio.year}-{self.fecha_fin.year})"
    class Meta:
        verbose_name = "Período de Planificación"
        verbose_name_plural = "Períodos de Planificación"
        ordering = ['-fecha_inicio']
