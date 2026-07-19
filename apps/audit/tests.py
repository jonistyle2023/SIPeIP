from django.test import TestCase, RequestFactory
from rest_framework.test import APITestCase
from rest_framework import status

from apps.authentication.models import Usuario, Rol
from apps.institutional_config.models import Catalogo
from .models import AuditEvent
from .utils import log_event, serialize_instance


class LogEventTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = Usuario.objects.create_user(nombre_usuario='audit_test_user', password='x')
        self.catalogo = Catalogo.objects.create(nombre='Catalogo Audit Test', codigo='CAT_AUDIT_TEST')

    def _request(self):
        request = self.factory.post('/api/v1/some-endpoint/', REMOTE_ADDR='192.168.1.10')
        request.META['HTTP_USER_AGENT'] = 'pytest-agent'
        return request

    def test_log_event_records_expected_fields(self):
        log_event(
            user=self.user, request=self._request(), event_type='CATALOGO_CREATED',
            instance=self.catalogo, details={'fields': {'nombre': self.catalogo.nombre}}
        )
        event = AuditEvent.objects.get(event_type='CATALOGO_CREATED')
        self.assertEqual(event.user, self.user)
        self.assertEqual(event.ip_address, '192.168.1.10')
        self.assertEqual(event.user_agent, 'pytest-agent')
        self.assertEqual(event.request_method, 'POST')
        self.assertTrue(event.success)
        self.assertEqual(event.object_id, self.catalogo.pk)
        self.assertEqual(event.content_type.model, 'catalogo')

    def test_log_event_without_instance_has_no_content_type(self):
        log_event(user=None, request=self._request(), event_type='LOGIN_FAILED', success=False)
        event = AuditEvent.objects.get(event_type='LOGIN_FAILED')
        self.assertIsNone(event.user)
        self.assertIsNone(event.content_type)
        self.assertIsNone(event.object_id)
        self.assertFalse(event.success)

    def test_log_event_details_default_to_empty_dict(self):
        log_event(user=self.user, request=self._request(), event_type='PING')
        event = AuditEvent.objects.get(event_type='PING')
        self.assertEqual(event.details, {})


class SerializeInstanceTests(TestCase):
    def test_password_field_is_excluded(self):
        user = Usuario.objects.create_user(nombre_usuario='serialize_test_user', password='super-secreto')
        data = serialize_instance(user)
        self.assertNotIn('password', data)

    def test_regular_fields_are_stringified(self):
        catalogo = Catalogo.objects.create(nombre='Catalogo Serialize Test', codigo='CAT_SERIALIZE_TEST')
        data = serialize_instance(catalogo)
        self.assertEqual(data['nombre'], 'Catalogo Serialize Test')
        self.assertEqual(data['codigo'], 'CAT_SERIALIZE_TEST')

    def test_extra_exclude_param_is_respected(self):
        catalogo = Catalogo.objects.create(nombre='Catalogo Exclude Test', codigo='CAT_EXCLUDE_TEST')
        data = serialize_instance(catalogo, exclude=('codigo',))
        self.assertNotIn('codigo', data)
        self.assertIn('nombre', data)


class AuditedModelViewSetMixinIntegrationTests(APITestCase):
    """Prueba de integración a través de un ViewSet real (RolViewSet) que usa el mixin."""

    def setUp(self):
        admin_role = Rol.objects.create(nombre='Administrador (Admin)')
        self.admin = Usuario.objects.create_user(nombre_usuario='audit_admin_test', password='x')
        self.admin.roles.add(admin_role)
        self.client.force_authenticate(user=self.admin)

    def test_create_generates_audit_event_with_field_snapshot(self):
        response = self.client.post('/api/v1/auth/roles/', {'nombre': 'Rol Auditado Test'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        event = AuditEvent.objects.filter(event_type='ROL_CREATED').order_by('-id').first()
        self.assertIsNotNone(event)
        self.assertEqual(event.details['fields']['nombre'], 'Rol Auditado Test')

    def test_update_generates_audit_event_with_changed_fields_diff(self):
        rol = Rol.objects.create(nombre='Rol Original Test')
        response = self.client.patch(f'/api/v1/auth/roles/{rol.pk}/', {'nombre': 'Rol Modificado Test'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        event = AuditEvent.objects.filter(event_type='ROL_UPDATED').order_by('-id').first()
        self.assertIsNotNone(event)
        self.assertEqual(
            event.details['changed_fields']['nombre'],
            {'antes': 'Rol Original Test', 'despues': 'Rol Modificado Test'}
        )

    def test_destroy_generates_audit_event(self):
        rol = Rol.objects.create(nombre='Rol A Borrar Test')
        response = self.client.delete(f'/api/v1/auth/roles/{rol.pk}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        event = AuditEvent.objects.filter(event_type='ROL_DELETED').order_by('-id').first()
        self.assertIsNotNone(event)


class AuditEventViewSetPermissionTests(APITestCase):
    """El módulo de auditoría debe ser accesible solo para Administradores."""

    def setUp(self):
        admin_role = Rol.objects.create(nombre='Administrador (Admin)')
        editor_role = Rol.objects.create(nombre='Editor Institucional')

        self.admin = Usuario.objects.create_user(nombre_usuario='perm_admin_test', password='x')
        self.admin.roles.add(admin_role)

        self.non_admin = Usuario.objects.create_user(nombre_usuario='perm_editor_test', password='x')
        self.non_admin.roles.add(editor_role)

    def test_admin_can_list_events(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/audit/events/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_non_admin_is_forbidden(self):
        self.client.force_authenticate(user=self.non_admin)
        response = self.client.get('/api/v1/audit/events/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_is_rejected(self):
        response = self.client.get('/api/v1/audit/events/')
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_export_requires_admin(self):
        self.client.force_authenticate(user=self.non_admin)
        response = self.client.get('/api/v1/audit/events/export/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_export_returns_downloadable_json_for_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/audit/events/export/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/json')
        self.assertIn('attachment', response['Content-Disposition'])
        self.assertIn('Records', response.json())
