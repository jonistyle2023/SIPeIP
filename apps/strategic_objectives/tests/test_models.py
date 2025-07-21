from django.test import TestCase
from apps.strategic_objectives.models import PlanInstitucional, ObjetivoEstrategicoInstitucional
from apps.institutional_config.models import Entidad, PeriodoPlanificacion

class ObjetivoEstrategicoInstitucionalModelTests(TestCase):
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

    def test_objetivo_creacion(self):
        self.assertEqual(self.objetivo_estrategico.codigo, "OEI-001")
        self.assertEqual(self.objetivo_estrategico.plan_institucional.nombre, "Plan Institucional Test")