# Propuesta para la Implementación del Sistema Integral de Planificación e Inversión Pública (SIPeIP 2.0) en la Secretaría Nacional de Planificación

> [!IMPORTANT]
> 
> Esta propuesta presenta el diseño e implementación del Sistema Integral de Planificación e Inversión Pública (SIPeIP 2.0) para optimizar la planificación estratégica en la Secretaría Nacional de Planificación. Mediante un estudio analítico, se identifican mejoras en los procesos de planificación y se propone un sistema de seguimiento para garantizar una gestión eficiente y sostenible, alineada con los objetivos nacionales de desarrollo.
> 
> **_Importante_:** Este proyecto **no pretende ser aprobado o supervisado** por alguna entidad pública del **Ecuador**, solo se realiza para fines académicos.

> [!NOTE]
>
> **Primera Versión del Proyecto**
> - **Nombre del Proyecto:** Nuevo Sistema Integral de Planificación e Inversión Pública - **SIPeIP 2.0**
> - **Versión del Software:** v1 (Finalizado en Julio del 2025).
> - **Tiempo de planificación y desarrollo:** 4 meses.
> - **Desarrollado por:** Jonathan David Panchana Rodríguez.

---

## Información Relevante

### Patron de Diseño de Software Utilizado: MVC (Model-View-Controller)

- **View (Vista):** Representada por el Frontend en React, que maneja la interfaz gráfica de usuario y componentes visuales.
- **Controller (Controlador):** El API Integration con Axios/Fetch en el frontend actúa como intermediario que realiza peticiones al backend.
  - En el Backend Django, las vistas (views) del Django REST Framework hacen de controladores al procesar las peticiones y decidir qué datos enviar.
- **Model (Modelo):** Las aplicaciones Django y sus modelos representan los datos y lógica de negocio, conectados directamente con la base de datos MySQL.

> [!NOTE]
> 
> Aunque React no implementa MVC puro, esta combinación de React + Django REST refleja claramente una separación de responsabilidades alineada con el patrón MVC distribuido.

### Arquitectura de Software: Capas + Cliente-Servidor

1. Arquitectura de Capas (Layered Architecture):
   - Capa de presentación: `React Frontend`
   - Capa de lógica de negocio: `Django Backend` (apps como proyectos, objetivos, auditoría, etc.)
   - Capa de persistencia de datos: `Base de datos MySQL`

2. Arquitectura Cliente-Servidor (Client-Server):
   - Cliente (Frontend): React, consume la API vía HTTP (Axios/Fetch)
   - Servidor (Backend): Django REST Framework que expone endpoints 
   - Base de datos: MySQL, gestionada exclusivamente por el backend

>[!IMPORTANT]
>
> Actualmente, esta estructura no es propia de **microservicios**, ya que todo el backend está en un solo monolito Django con múltiples apps. Sin embargo, la estructura modular de las app tiene las bases deseadas para migrar hacia microservicios en el futuro.

---

## Estructura del Proyecto

### BackEnd

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

### FrontEnd

```
src/
│
├── app/                      # Configuración general de la app (App.jsx, rutas, layouts, etc.)
├── shared/                   # Componentes reutilizables y utilidades comunes
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── api/
│   └── styles/
│
├── features/                 # Módulos funcionales (features) de la app
│
│   ├── auth/                 # Autenticación
│   │   └── LoginPage.jsx
│   ├── dashboard/            # Dashboard principal
│   │   └── DashboardPage.jsx
│   ├── configuration/        # Configuración institucional
│   ├── investment-projects/  # Gestión de proyectos de inversión
│   ├── strategic-objectives/ # Objetivos estratégicos
│   ├── pai-prioritization/   # Priorización PAI
│   │   └── PaiPrioritizationPage.jsx
│   ├── dictamenes/           # Gestión de dictámenes
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md
```

