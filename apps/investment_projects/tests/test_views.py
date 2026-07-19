from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from apps.investment_projects.models import ProyectoInversion, Entidad, ItemCatalogo
from apps.institutional_config.models import Catalogo
from apps.authentication.models import Usuario, Rol

class ProyectoInversionViewSetTests(APITestCase):
    def setUp(self):
        self.entidad = Entidad.objects.create(nombre="Entidad Test", codigo_unico="ENT_TEST")
        catalogo = Catalogo.objects.create(nombre="Catalogo Test", codigo="CAT_TEST")
        self.tipo_proyecto = ItemCatalogo.objects.create(nombre="Tipo Test", catalogo=catalogo)
        self.tipologia_proyecto = ItemCatalogo.objects.create(nombre="Tipología Test", catalogo=catalogo)
        self.sector = ItemCatalogo.objects.create(nombre="Sector Test", catalogo=catalogo)

        rol_editor = Rol.objects.create(nombre="Administrador de Entidad")
        self.usuario = Usuario.objects.create_user(
            nombre_usuario="editor_test", password="clave_test", entidad_codigo=self.entidad.codigo_unico
        )
        self.usuario.roles.add(rol_editor)
        self.client.force_authenticate(user=self.usuario)

        self.proyecto = ProyectoInversion.objects.create(
            nombre="Proyecto Test",
            entidad_ejecutora=self.entidad,
            tipo_proyecto=self.tipo_proyecto,
            tipologia_proyecto=self.tipologia_proyecto,
            sector=self.sector
        )

    def test_listar_proyectos(self):
        response = self.client.get("/api/v1/investment-projects/proyectos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_postular_proyecto(self):
        response = self.client.post(f"/api/v1/investment-projects/proyectos/{self.proyecto.proyecto_id}/postular/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)