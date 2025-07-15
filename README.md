# Nuevo Sistema Integral de Planificación e Inversión Pública (SIPeIP 2.0), de la Secretaría Nacional de Planificación

> [!WARNING]
> 
> Este proyecto es una propuesta como caso de estudio de **Examen complexivo del periodo ABRIl - AGOSTO 2025** para estudiantes de la carrera de 
> **_Tecnologías de la información_** de la **Universidad Técnica Particular de Loja**.
> 
> No pretende ser aprobado o supervisado por alguna entidad pública del pais, solo se realiza para fines académicos.

>[!IMPORTANT] 
> 
> Esta propuesta busca mejorar la transparencia y eficiencia en la gestión de proyectos públicos.

> [!NOTE]
> 
> Información General:
> - **Nombre del Proyecto:** Nuevo Sistema Integral de Planificación e Inversión Pública - **SIPeIP 2.0**
> - **Versión del Software:** v1.
> - **Tiempo de planificación y desarrollo:** 4 meses.
> - **Desarrollado por:** Jonathan David Panchana Rodríguez.

---

## Estructura del Proyecto

```
SIPeIP/
├── venv/                      # Entorno virtual de Python (configurado de manera local)
├── manage.py                  # Línea de comandos de Django
├── config/                    # Directorio principal del proyecto Django
│   ├── __init__.py
│   ├── settings.py            # Configuración principal (conexión a DB, apps, etc.)
│   ├── urls.py                # Rutas URL principales del proyecto
│   └── wsgi.py
├── apps/                      # Directorio para aplicaciones Django personalizadas (módulos)
│   ├── core/                  # App para funcionalidades comunes o transversales (ej. modelos base, utilidades)
│   ├── authentication/        # Módulo de Autenticación de Usuarios
│   ├── institutional_config/  # Módulo de Configuración Institucional (20% del prototipo)
│   ├── strategic_objectives/  # Módulo de Gestión de Objetivos Estratégicos (20% del prototipo)
│   ├── investment_projects/   # Módulo de Gestión de Proyectos de Inversión (20% del prototipo) 
│   ├── reports/               # Módulo de Reportes y Visualización (10% del prototipo) 
│   ├── audit/                 # Módulo de Auditoría y Trazabilidad (Implementaión a futuro)
│── templates/                 # Archivos HTML globales para la interfaz de usuario [NO SE UTILIZA EN ESTE PROYECTO]
├── requirements.txt           # Dependencias del proyecto (Django, DRF, librerías para PDF/Excel, etc.)
├── .env                       # Variables perzonalizadas
└── .gitignore                 # archivos a ignorar por el repositorio

```

