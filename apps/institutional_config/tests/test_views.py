# Archivo: tests/test_views.py
from rest_framework.test import APITestCase
from rest_framework import status
from apps.institutional_config.models import Catalogo

class CatalogoViewSetTests(APITestCase):
    def setUp(self):
        Catalogo.objects.create(nombre="Sectores", codigo="SECTORES")
        Catalogo.objects.create(nombre="Tipos de Plan", codigo="TIPOS_PLAN")

    def test_listar_catalogos(self):
        response = self.client.get("/catalogos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filtrar_catalogo_por_codigo(self):
        response = self.client.get("/catalogos/?codigo=SECTORES")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["codigo"], "SECTORES")