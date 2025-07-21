from django.test import TestCase
from apps.institutional_config.models import Catalogo

class CatalogoModelTests(TestCase):
    def setUp(self):
        self.catalogo = Catalogo.objects.create(
            nombre="Sectores",
            codigo="SECTORES",
            descripcion="Catálogo de sectores"
        )

    def test_catalogo_creacion(self):
        self.assertEqual(self.catalogo.nombre, "Sectores")
        self.assertEqual(self.catalogo.codigo, "SECTORES")

    def test_catalogo_unicidad(self):
        with self.assertRaises(Exception):
            Catalogo.objects.create(
                nombre="Sectores",
                codigo="SECTORES"
            )