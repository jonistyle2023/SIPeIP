from rest_framework.test import APITestCase
from rest_framework import status
from apps.strategic_objectives.models import PlanInstitucional, ObjetivoEstrategicoInstitucional
from apps.institutional_config.models import Entidad, PeriodoPlanificacion

class ObjetivoEstrategicoInstitucionalViewSetTests(APITestCase):
    def setUp(self):
        self.entidad = Entidad.objects.create(nombre="Entidad Test", codigo_unico="ENT_TEST")
        self.periodo = PeriodoPlanificacion.objects.create(nombre="2023-2027")
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

    def test_listar_objetivos_estrategicos(self):
        response = self.client.get("/oei/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_crear_objetivo_estrategico(self):
        data = {
            "plan_institucional": self.plan_institucional.plan_institucional_id,
            "codigo": "OEI-002",
            "descripcion": "Nuevo objetivo estratégico"
        }
        response = self.client.post("/oei/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["codigo"], "OEI-002")