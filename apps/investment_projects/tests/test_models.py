# Archivo: tests/test_models.py
from django.test import TestCase
from apps.investment_projects.models import ProyectoInversion, Entidad, ItemCatalogo

class ProyectoInversionModelTests(TestCase):
    def setUp(self):
        self.entidad = Entidad.objects.create(nombre="Entidad Test", codigo_unico="ENT_TEST")
        self.tipo_proyecto = ItemCatalogo.objects.create(nombre="Tipo Test", catalogo_id=1)
        self.tipologia_proyecto = ItemCatalogo.objects.create(nombre="Tipología Test", catalogo_id=2)
        self.sector = ItemCatalogo.objects.create(nombre="Sector Test", catalogo_id=3)

        self.proyecto = ProyectoInversion.objects.create(
            nombre="Proyecto Test",
            entidad_ejecutora=self.entidad,
            tipo_proyecto=self.tipo_proyecto,
            tipologia_proyecto=self.tipologia_proyecto,
            sector=self.sector
        )

    def test_proyecto_creacion(self):
        self.assertEqual(self.proyecto.nombre, "Proyecto Test")
        self.assertEqual(self.proyecto.estado, "EN_FORMULACION")