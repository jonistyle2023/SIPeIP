from rest_framework.test import APITestCase
from rest_framework import status
from apps.strategic_objectives.models import PlanInstitucional, ObjetivoEstrategicoInstitucional
from apps.institutional_config.models import Entidad, PeriodoPlanificacion
from apps.authentication.models import Usuario, Rol

class ObjetivoEstrategicoInstitucionalViewSetTests(APITestCase):
    def setUp(self):
        self.entidad = Entidad.objects.create(nombre="Entidad Test", codigo_unico="ENT_TEST")
        self.periodo = PeriodoPlanificacion.objects.create(
            nombre="2023-2027", fecha_inicio="2023-01-01", fecha_fin="2027-12-31"
        )
        self.plan_institucional = PlanInstitucional.objects.create(
            nombre="Plan Institucional Test",
            entidad=self.entidad,
            periodo=self.periodo
        )
        self.objetivo_estrategico = ObjetivoEstrategicoInstitucional.objects.create(
            plan_institucional=self.plan_institucional,
            codigo="OEI-001",
            descripcion="Descripción del objetivo estratégico"
        )

        rol_editor = Rol.objects.create(nombre="Administrador de Entidad")
        self.usuario = Usuario.objects.create_user(
            nombre_usuario="editor_test", password="clave_test", entidad_codigo=self.entidad.codigo_unico
        )
        self.usuario.roles.add(rol_editor)
        self.client.force_authenticate(user=self.usuario)

    def test_listar_objetivos_estrategicos(self):
        response = self.client.get("/api/v1/strategic-planning/oei/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_crear_objetivo_estrategico(self):
        data = {
            "plan_institucional": self.plan_institucional.plan_institucional_id,
            "codigo": "OEI-002",
            "descripcion": "Nuevo objetivo estratégico"
        }
        response = self.client.post("/api/v1/strategic-planning/oei/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["codigo"], "OEI-002")