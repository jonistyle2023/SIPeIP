# Sistema integral de Planificación e Inversión Pública (SIPeIP)

>[!note] 
> 
> Esta es una propuesta de código abierto para un sistema integral de planificación e inversión pública, que busca mejorar la transparencia y eficiencia en la gestión de proyectos públicos.

--

## Estructura del Proyecto

```plaintext
sip_prototype_django/
├── venv/                      # Entorno virtual de Python
├── manage.py                  # Utilidad de línea de comandos de Django
├── sip_core_project/          # Directorio principal del proyecto Django
│   ├── __init__.py
│   ├── settings.py            # Configuración principal (conexión a DB, apps, etc.)
│   ├── urls.py                # Rutas URL principales del proyecto
│   └── wsgi.py
├── apps/                      # Directorio para aplicaciones Django personalizadas (módulos)
│   ├── core/                  # App para funcionalidades comunes o transversales (ej. modelos base, utilidades)
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py          # Modelos genéricos o compartidos (ej. Usuario simplificado, Entidad base simplificada, si no es gestionada solo por institutional_config) [1]
│   │   ├── urls.py
│   │   └── views.py
│   ├── authentication/        # Módulo de Autenticación [2-4]
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py          # Modelos de usuario, roles, permisos (alineado con la necesidad de RBAC [5])
│   │   ├── urls.py
│   │   └── views.py           # Lógica para autenticación, gestión de sesiones, reseteo de contraseña [4]
│   ├── institutional_config/  # Módulo de Configuración Institucional (20% del prototipo) [6]
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py          # Modelos para Entidad, Unidad Organizacional (ej. Nombre MacroSector, Nombre Sector, Estado) [1, 6]
│   │   ├── urls.py
│   │   └── views.py           # Lógica para registrar/administrar entidades y unidades organizacionales
│   ├── strategic_objectives/  # Módulo de Gestión de Objetivos Estratégicos (20% del prototipo) [7, 8]
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py          # Modelos para Plan Nacional de Desarrollo (PND), Objetivo PND, Objetivo de Desarrollo Sostenible (ODS), Estrategia ODS, Meta ODS, Objetivo Estratégico Institucional (OEI), y la tabla de Alineación (Objetivo Estratégico ↔ PND ↔ ODS) [1, 7-11]
│   │   ├── urls.py
│   │   └── views.py           # Lógica para CRUD de objetivos, y gestión de alineaciones (ej. UR-32 [12])
│   ├── investment_projects/   # Módulo de Gestión de Proyectos de Inversión (20% del prototipo) [13]
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py          # Modelos para Proyecto de Inversión (incluyendo CUP [14-16]), Programa Institucional, Meta, Indicador, Actividad, y sus vinculaciones (Marco Lógico simplificado) [10, 13, 17]
│   │   ├── urls.py
│   │   └── views.py           # Lógica para ingresar, editar, categorizar, vincular y versionar proyectos (ej. UR-45, UR-48 [12])
│   ├── reports/               # Módulo de Reportes y Visualización (10% del prototipo) [13]
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py          # Podría incluir un modelo `GeneradorReportes` para configuraciones de reportes [1, 18]
│   │   ├── urls.py
│   │   └── views.py           # Lógica para generar informes técnicos automáticos en formatos PDF y Excel [13]
│   ├── audit/                 # Módulo de Auditoría y Trazabilidad [13, 19, 20]
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py          # Modelo para `RegistroAuditoria` (timestamp, usuario, módulo, funcionalidad, acción, entidad afectada, detalles) [1, 21]
│   │   ├── urls.py
│   │   └── views.py           # Lógica para consultar bitácoras y generar reportes de control [13, 19, 22]
│   └── templates/             # Archivos HTML globales para la interfaz de usuario (ej. base.html, includes compartidos)
├── static/                    # Archivos estáticos globales (CSS, JS, imágenes)
├── media/                     # Archivos subidos por usuarios (ej. respaldos, actas)
└── requirements.txt           # Dependencias del proyecto (Django, DRF, librerías para PDF/Excel, etc.)
```

