from django.test import TestCase
from apps.institutional_config.models import Catalogo, ItemCatalogo, Entidad

class EntidadModelTests(TestCase):
    def setUp(self):
        self.catalogo = Catalogo.objects.create(nombre="Niveles de Gobierno", codigo="NIVEL_GOBIERNO")
        self.item = ItemCatalogo.objects.create(catalogo=self.catalogo, nombre="Nacional")
        self.entidad = Entidad.objects.create(
            nombre="Ministerio de Salud",
            codigo_unico="MSALUD",
            nivel_gobierno=self.item
        )

    def test_entidad_creacion(self):
        self.assertEqual(self.entidad.nombre, "Ministerio de Salud")
        self.assertEqual(self.entidad.nivel_gobierno.nombre, "Nacional")