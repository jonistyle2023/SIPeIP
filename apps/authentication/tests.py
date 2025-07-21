from django.test import TestCase
from apps.authentication.models import RegistroAuditoria, Usuario


class AuditoriaTests(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            nombre_usuario="testuser",
            password="testpassword"
        )

    def test_registro_auditoria(self):
        RegistroAuditoria.objects.create(
            usuario=self.usuario,
            funcionalidad="Gestión de Usuarios",
            accion="Crear"
        )
        registro = RegistroAuditoria.objects.first()
        self.assertEqual(registro.usuario, self.usuario)
        self.assertEqual(registro.funcionalidad, "Gestión de Usuarios")
        self.assertEqual(registro.accion, "Crear")
