from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from apps.investment_projects.models import ProyectoInversion, Entidad, ItemCatalogo

class ProyectoInversionViewSetTests(APITestCase):
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

    def test_listar_proyectos(self):
        response = self.client.get("/proyectos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_postular_proyecto(self):
        response = self.client.post(f"/proyectos/{self.proyecto.proyecto_id}/postular/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)