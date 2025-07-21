from rest_framework.test import APITestCase
from rest_framework import status
from apps.institutional_config.models import Catalogo, ItemCatalogo, Entidad

class EntidadViewSetTests(APITestCase):
    def setUp(self):
        self.catalogo = Catalogo.objects.create(nombre="Niveles de Gobierno", codigo="NIVEL_GOBIERNO")
        self.item = ItemCatalogo.objects.create(catalogo=self.catalogo, nombre="Nacional")
        self.entidad = Entidad.objects.create(
            nombre="Ministerio de Salud",
            codigo_unico="MSALUD",
            nivel_gobierno=self.item
        )

    def test_listar_entidades(self):
        response = self.client.get("/entidades/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_crear_entidad(self):
        data = {
            "nombre": "Ministerio de Educación",
            "codigo_unico": "MEDUCACION",
            "nivel_gobierno": self.item.id
        }
        response = self.client.post("/entidades/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["nombre"], "Ministerio de Educación")