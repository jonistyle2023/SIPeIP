from django.db import models
from django.conf import settings

class Lubricant(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=100, help_text="Ej: Sintético, Mineral, Semisintético")
    unit_of_measure = models.CharField(max_length=50, default="Litros")
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    location = models.CharField(max_length=255, blank=True, null=True, help_text="Ubicación de almacenamiento")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_lubricants', on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='updated_lubricants', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class SparePart(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    part_number = models.CharField(max_length=100, unique=True, help_text="Número de parte del fabricante")
    manufacturer = models.CharField(max_length=255, blank=True, null=True)
    unit_of_measure = models.CharField(max_length=50, default="Unidades")
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    location = models.CharField(max_length=255, blank=True, null=True, help_text="Ubicación de almacenamiento")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_spare_parts', on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='updated_spare_parts', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.part_number})"

    class Meta:
        unique_together = ('name', 'manufacturer') # Para evitar repuestos con el mismo nombre del mismo fabricante
