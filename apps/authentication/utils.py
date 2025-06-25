from apps.authentication.models import RegistroAuditoria

def registrar_evento(usuario, funcionalidad, accion, detalles=None, modulo='Autenticacion', entidad_tipo=None, entidad_id=None):
    RegistroAuditoria.objects.create(
        usuario=usuario,
        funcionalidad=funcionalidad,
        accion=accion,
        detalles=detalles,
        modulo=modulo,
        entidad_afectada_tipo=entidad_tipo,
        entidad_afectada_id=entidad_id
    )