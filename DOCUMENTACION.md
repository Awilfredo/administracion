# Sistema de Administración de Empleados - Red Intelfon

## Índice

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Base de Datos](#5-base-de-datos)
6. [Módulos Principales](#6-módulos-principales)
7. [API y Rutas](#7-api-y-rutas)
8. [Funcionalidades Detalladas](#8-funcionalidades-detalladas)
9. [Flujos de Trabajo](#9-flujos-de-trabajo)
10. [Seguridad y Permisos](#10-seguridad-y-permisos)
11. [Puntos de Mejora](#11-puntos-de-mejora)
12. [Sugerencias de Implementación](#12-sugerencias-de-implementación)
13. [Configuración y Despliegue](#13-configuración-y-despliegue)

---

## 1. Descripción General

### 1.1 Propósito del Sistema

**Administracion** es un sistema integral de gestión de recursos humanos y control de asistencia para **Red Intelfon**, empresa de telecomunicaciones. El sistema actúa como un portal interno de HR que centraliza:

- **Gestión de Empleados**: Altas, bajas, modificaciones y consulta de datos personales y laborales
- **Control de Asistencia**: Seguimiento de llegadas tardías, ausencias, salidas anticipadas y marcaciones NFC
- **Gestión de Horarios**: Administración de horarios de trabajo y asignaciones por empleado
- **Control de Acceso NFC**: Etiquetado y seguimiento de accesos mediante tecnología NFC/RFID
- **Workflow de Contratación**: Proceso completo de onboarding incluyendo provisión de cuentas en múltiples sistemas
- **Gestión de Equipos PTT**: Asignación y seguimiento de equipos de comunicación Push-to-Talk

### 1.2 Usuarios del Sistema

El sistema está diseñado para:
- **Administradores de RRHH**: Gestión completa de empleados y configuraciones
- **Supervisores**: Consulta de asistencia y aprobación de eventos
- **Empleados**: Consulta de su información personal y asistencia

### 1.3 Empresas Soportadas

El sistema maneja operaciones para dos países:
- **SV (El Salvador)** - Código de empresa `1`
- **GT (Guatemala)** - Código de empresa `2`

---

## 2. Arquitectura del Sistema

### 2.1 Patrón Arquitectónico

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│                    React 18 + Tailwind CSS                       │
│                   Inertia.js (SPA-like)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/S
┌────────────────────────────▼────────────────────────────────────┐
│                      SERVIDOR (Laravel 12)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Routes / Controllers                   │   │
│  │                  (Lógica de Negocio)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Models    │  │  Middleware │  │    Service Classes      │  │
│  │  (Eloquent) │  │  (Auth/Gate)│  │  (MailService, etc)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌──────▼──────┐   ┌──────▼──────┐
    │   MySQL   │     │ PostgreSQL  │   │  MariaDB    │
    │ (Local)   │     │   (SAN)     │   │(RedControl) │
    └───────────┘     └─────────────┘   └─────────────┘
```

### 2.2 Arquitectura Multi-Database

El sistema se conecta a **tres bases de datos** simultáneamente:

| Base de Datos | Tipo | Propósito | Host |
|--------------|------|-----------|------|
| `administracion` | MySQL | Datos locales de la aplicación | 127.0.0.1 |
| `san` | PostgreSQL | Datos principales de empleados (SAN) | 172.17.10.30 |
| `redControl` | MariaDB | Sistema de Red Control/Agenda | 172.17.2.68:3306 |

### 2.3 Flujo de Datos Típico

```
[Empleado CRUD]
    ├── Save to MySQL (asistencia, horarios, archivos)
    └── Sync to PostgreSQL SAN (datos principales)

[Asistencia]
    ├── Read from MariaDB (redControl) - marcaciones NFC
    ├── Process in MySQL (eventos, estadísticas)
    └── Display via Inertia

[Contratación]
    ├── Create in MySQL
    ├── Create user in Red Control (MariaDB)
    ├── Assign role in SAN (PostgreSQL)
    └── Send emails (Office 365, SAP)
```

---

## 3. Stack Tecnológico

### 3.1 Backend

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | Laravel | ^12.0 |
| Lenguaje | PHP | ^8.2 |
| ORM | Eloquent | Integrado |
| Autenticación | Laravel Sanctum + Breeze | Integrado |
| Autorización | Spatie Laravel Permission | ^6.7 |
| Plantillas Email | PHPMailer | ^6.9 |
| Email Graph | innoge/laravel-msgraph-mail | ^1.3 |
| Alerts | Wavey/SweetAlert | ^1.2 |

### 3.2 Frontend

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework UI | React | ^18.2.0 |
| Routing SPA | Inertia.js | ^1.0.0 |
| CSS | Tailwind CSS | ^3.2.1 |
| Build Tool | Vite | ^5.0 |
| Gráficos | Recharts | ^2.12.7 |
| Tablas | React Data Table | ^7.6.2 |
| Iconos | React Icons + @react-icons/all-files | ^5.5.0 / ^4.1.0 |
| Alertas | SweetAlert2 | ^11.26.2 |
| Excel/CSV | xlsx | ^0.18.5 |
| Drag & Drop | react-dropzone, react-drag-drop-files | Latest |
| Compresión Imágenes | Compressorjs | ^1.2.1 |
| Fecha/Hora | Moment.js | ^2.30.1 |
| Password Gen | generate-password-browser | ^1.1.0 |

### 3.3 Infraestructura

| Componente | Tecnología |
|------------|------------|
| Base de Datos Local | MySQL 8+ |
| Base de Datos Remota | PostgreSQL (SAN) |
| Base de Datos Remota | MariaDB (Red Control) |
| Servidor Web | Apache/Nginx |
| Cache | Laravel Cache (Redis/File) |
| Queue | Laravel Queue (database) |

---

## 4. Estructura del Proyecto

```
/home/wilfredo/progra/administracion/
├── app/
│   ├── Http/
│   │   ├── Controllers/           # Controladores HTTP
│   │   │   ├── Auth/             # Autenticación (Laravel Breeze)
│   │   │   ├── AsistenciaController.php
│   │   │   ├── DatosEmpleadoController.php
│   │   │   ├── EmpleadoArchivoController.php
│   │   │   ├── EmpleadoController.php
│   │   │   ├── EmpleadoHijoController.php
│   │   │   ├── HiringController.php
│   │   │   ├── HorarioController.php
│   │   │   ├── HorarioDiaController.php
│   │   │   ├── PttEquipoController.php
│   │   │   ├── ProfileController.php
│   │   │   └── TestController.php
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php
│   ├── Mail/                     # Plantillas de correo
│   │   ├── ControlRegistrationConfirmation.php
│   │   └── UserRegistrationConfirmation.php
│   ├── Models/                   # Modelos Eloquent
│   │   ├── Asistencia.php
│   │   ├── DatosEmpleado.php
│   │   ├── Empleado.php
│   │   ├── EmpleadoArchivo.php
│   │   ├── EmpleadoHijo.php
│   │   ├── Hiring.php
│   │   ├── Horario.php
│   │   ├── HorarioDia.php
│   │   ├── HorarioEmpleado.php
│   │   ├── MailService.php
│   │   ├── PttEquipo.php
│   │   ├── UsuarioRedControl.php
│   │   └── User.php
│   └── Providers/
│       └── AppServiceProvider.php
├── bootstrap/                    # Bootstrap Laravel
├── config/                       # Archivos de configuración
│   ├── app.php
│   ├── database.php
│   ├── mail.php
│   ├── permission.php
│   └── ...
├── database/
│   ├── factories/               # Factorías para testing
│   ├── migrations/              # Migraciones de BD
│   └── seeders/                # Seeders de datos
├── public/                      # Assets públicos
│   ├── build/                   # Assets compilados (Vite)
│   └── index.php
├── resources/
│   ├── css/                    # Estilos CSS
│   ├── js/
│   │   ├── app.jsx             # Entry point React
│   │   ├── Components/         # Componentes reutilizables
│   │   ├── Helpers/            # Funciones auxiliares
│   │   ├── Layouts/           # Layouts de página
│   │   └── Pages/             # Páginas Inertia
│   └── views/                  # Plantillas Blade
├── routes/
│   ├── auth.php                # Rutas de autenticación
│   ├── web.php                 # Rutas principales
│   └── console.php
├── storage/                    # Archivos almacenados
├── tests/                      # Tests PHPUnit
├── composer.json               # Dependencias PHP
├── package.json               # Dependencias Node
├── vite.config.js              # Configuración Vite
├── tailwind.config.js         # Configuración Tailwind
└── .env                       # Variables de entorno
```

---

## 5. Base de Datos

### 5.1 Esquema de Relaciones

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     User        │      │    Empleado     │      │  DatosEmpleado  │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id              │◄──┐  │ anacod (PK)     │      │ id              │
│ name            │   │  │ nombre          │──┐   │ empleado_id(FK) │
│ email           │   │  │ appaterno       │  │   │ dui             │
│ password        │   │  │ apmaterno       │  │   │ nit            │
│ role            │   │  │ fechanac         │  │   │ isss           │
│ emp_code        │───┘  │ empresa         │  │   │ afp            │
│ status          │      │ anacod_jefe     │  │   │ fecha_nac      │
│ created_at      │      │ fechaincorp     │  │   │ genero         │
└─────────────────┘      │ fechabaja       │  │   │ telefonofijo   │
       │                 │ estadocivil     │  │   │ telefonomovil │
       │                 │ tipocontrato    │  │   │ direccion      │
       │                 │ foto_url        │  │   │ correo         │
       │                 └─────────────────┘  │   │ nombre padre   │
       │                                    │   │ nombre madre   │
       │                 ┌─────────────────┐│   │ nacionalidad   │
       │                 │  HorarioEmpleado ││   └────────────────┘
       │                 ├─────────────────┤│
       │                 │ id              ││
       └────────────────►│ empleado_id(FK) ││
                         │ horario_id(FK)  ││
                         │ fecha_asign    ││
                         └─────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Asistencia    │      │   Horario       │      │  HorarioDia     │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id              │      │ id              │◄──┐  │ id              │
│ anacod (emp)    │      │ nombre          │   │  │ horario_id(FK)  │
│ fecha           │      │ hora_entrada    │   │  │ dia (1-7)       │
│ tipo_evento     │      │ hora_salida     │   │  │ hora_entrada    │
│ hora_evento     │      │ hora_entrada_2   │   │  │ hora_salida     │
│ observaciones   │      │ hora_salida_2    │   │  │ hora_entrada_2  │
│ estado          │      │ minutos_almuerzo │   │  │ hora_salida_2   │
│ created_at      │      │ dias_libres      │   │  │ minutos_almuerzo│
└─────────────────┘      └─────────────────┘   │  │ descanso        │
       │                                        │  └────────────────┘
       │                 ┌─────────────────┐    │
       │                 │    Hiring       │    │
       │                 ├─────────────────┤    │
       └────────────────►│ id              │    │
                         │ anacod (emp)    │────┘
                         │ estado_hiring   │
                         │ fecha_creacion  │
                         │ enviado_office  │
                         │ enviado_sap     │
                         └─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│  EmpleadoHijo   │      │ EmpleadoArchivo │
├─────────────────┤      ├─────────────────┤
│ id              │      │ id              │
│ empleado_id(FK) │      │ empleado_id(FK) │
│ nombre          │      │ nombre_original │
│ fechanac        │      │ nombre_sistema  │
│ genero          │      │ tipo_archivo    │
│ parentesco      │      │ ruta            │
└─────────────────┘      │ fecha_subida   │
                         └─────────────────┘
```

### 5.2 Tablas Principales

#### `empleados`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| anacod | VARCHAR(10) | Código único de empleado (Primary Key) |
| nombre | VARCHAR(100) | Nombre(s) |
| appaterno | VARCHAR(50) | Apellido paterno |
| apmaterno | VARCHAR(50) | Apellido materno |
| fechanac | DATE | Fecha de nacimiento |
| empresa | TINYINT | 1=El Salvador, 2=Guatemala |
| anacod_jefe | VARCHAR(10) | Código del jefe directo |
| fechaincorp | DATE | Fecha de incorporación |
| fechabaja | DATE | Fecha de baja (NULL si activo) |
| estadocivil | VARCHAR(20) | Estado civil |
| tipocontrato | VARCHAR(50) | Tipo de contrato |
| foto_url | VARCHAR(255) | URL de la foto |
| status | TINYINT | 1=Activo, 0=Inactivo |
| freelance | BOOLEAN | Si es empleado freelance |

#### `datos_empleados`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | Primary Key |
| empleado_id | VARCHAR(10) | FK a empleados |
| dui | VARCHAR(15) | Documento Único de Identidad |
| nit | VARCHAR(20) | Número de Identificación Tributaria |
| isss | VARCHAR(15) | Número ISSS |
| afp | VARCHAR(20) | Número AFP |
| fecha_nac | DATE | Fecha de nacimiento |
| genero | VARCHAR(10) | Género |
| telefonofijo | VARCHAR(15) | Teléfono fijo |
| telefonomovil | VARCHAR(15) | Teléfono móvil |
| direccion | TEXT | Dirección |
| correo | VARCHAR(100) | Correo electrónico |
| nombre_padre | VARCHAR(100) | Nombre del padre |
| nombre_madre | VARCHAR(100) | Nombre de la madre |
| nacionalidad | VARCHAR(50) | Nacionalidad |

#### `asistencias`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | Primary Key |
| anacod | VARCHAR(10) | Código de empleado |
| fecha | DATE | Fecha del evento |
| tipo_evento | VARCHAR(20) | Tarde, Ausencia, Salida antes, Sin nfc |
| hora_evento | TIME | Hora del evento |
| observaciones | TEXT | Notas adicionales |
| estado | VARCHAR(20) | Estado del evento |
| created_at | TIMESTAMP | Fecha de creación |

#### `horarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | Primary Key |
| nombre | VARCHAR(50) | Nombre del horario |
| hora_entrada | TIME | Hora de entrada |
| hora_salida | TIME | Hora de salida |
| hora_entrada_2 | TIME | Hora de entrada (2do turno) |
| hora_salida_2 | TIME | Hora de salida (2do turno) |
| minutos_almuerzo | INT | Minutos de almuerzo |
| dias_libres | JSON | Días libres |
| descanso | BOOLEAN | Si tiene descanso |

#### `nfc_tags`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | Primary Key |
| anacod | VARCHAR(10) | Código de empleado |
| numero_serie | VARCHAR(50) | Número de serie NFC |
| estado | TINYINT | 1=Activo, 0=Inactivo |
| fecha_asignacion | DATE | Fecha de asignación |

#### `ptt_equipos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | Primary Key |
| empleado_id | VARCHAR(10) | FK a empleados |
| licencia | VARCHAR(50) | Número de licencia |
| numero_telefono | VARCHAR(20) | Número telefónico |
| imei | VARCHAR(30) | IMEI del equipo |
| operador | VARCHAR(30) | Operador |
| plan | VARCHAR(50) | Plan telefónica |
| observaciones | TEXT | Notas |

### 5.3 Conexiones Multi-Database

```php
// config/database.php

'mysql' => [
    'driver' => 'mysql',
    'database' => 'administracion',
    // ...
],

'san' => [  // PostgreSQL - Datos de empleados
    'driver' => 'pgsql',
    'host' => '172.17.10.30',
    'database' => 'san',
    // ...
],

'redControl' => [  // MariaDB - Sistema de Red Control
    'driver' => 'mysql',
    'host' => '172.17.2.68',
    'port' => 3306,
    'database' => 'redControl',
    // ...
],
```

---

## 6. Módulos Principales

### 6.1 Módulo de Empleados (`EmpleadoController`)

**Ubicación:** `app/Http/Controllers/EmpleadoController.php`

**Funcionalidades:**
- Listar empleados con filtros (activo/inactivo, empresa SV/GT)
- Crear nuevos empleados
- Editar datos de empleados
- Desactivar empleados (dar de baja)
- Actualizar foto de empleado
- Gestión de cuentas de control (Red Control)

**Métodos Principales:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `index` | GET /empleados | Lista paginada de empleados |
| `create` | GET /empleados/nuevo | Formulario de creación |
| `store` | POST /empleados | Guardar nuevo empleado |
| `show` | GET /empleados/{anacod} | Ver detalle de empleado |
| `edit` | GET /empleados/{anacod}/edit | Formulario de edición |
| `update` | PUT /empleados/{anacod} | Actualizar empleado |
| `destroy` | DELETE /empleados/{anacod} | Eliminar empleado |
| `baja` | PUT /empleados/{anacod}/baja | Dar de baja |
| `updateImage` | POST /empleados/{anacod}/imagen | Actualizar foto |

### 6.2 Módulo de Asistencia (`AsistenciaController`)

**Ubicación:** `app/Http/Controllers/AsistenciaController.php`

**Funcionalidades:**
- Registro de eventos de asistencia (tardes, ausencias, salidas antes)
- Consulta de marcaciones diarias
- Consulta de registros NFC
- Estadísticas de asistencia
- Resumen mensual

**Métodos Principales:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `eventos` | GET /asistencia/eventos | Lista de eventos |
| `store` | POST /asistencia/eventos | Crear evento |
| `marcaciones` | GET /asistencia/marcas | Marcaciones diarias |
| `registrosNFC` | GET /asistencia/nfc | Registros NFC |
| `resumen` | GET /asistencia/resumen | Resumen mensual |
| `estadisticas` | GET /estadisticas | Dashboard estadísticas |

### 6.3 Módulo de Horarios (`HorarioController`)

**Ubicación:** `app/Http/Controllers/HorarioController.php`

**Funcionalidades:**
- CRUD de horarios de trabajo
- Definición de días laborables
- Configuración de almuerzos
- Asignación de horarios a empleados

**Métodos Principales:**

| Método | Ruta | Descripción |
|--------|------|-------------|
| `index` | GET /horarios | Lista de horarios |
| `create` | GET /horarios/create | Crear horario |
| `store` | POST /horarios | Guardar horario |
| `edit` | GET /horarios/{id}/edit | Editar horario |
| `update` | PUT /horarios/{id} | Actualizar horario |
| `destroy` | DELETE /horarios/{id} | Eliminar horario |

### 6.4 Módulo de Hiring (`HiringController`)

**Ubicación:** `app/Http/Controllers/HiringController.php`

**Funcionalidades:**
- Workflow de contratación completo
- Creación de usuarios en sistemas externos
- Envío de correos de bienvenida
- Provisión Office 365
- Provisión SAP

**Flujo de Hiring:**

```
1. Crear empleado en sistema local
       ▼
2. Crear usuario en Red Control (MariaDB)
       ▼
3. Crear usuario en sistema de mensajería
       ▼
4. Asignar rol en SAN (PostgreSQL)
       ▼
5. Asignar reportes a roles
       ▼
6. Enviar email Office 365
       ▼
7. Enviar email SAP
       ▼
8. Completado
```

### 6.5 Módulo de Equipos PTT (`PttEquipoController`)

**Ubicación:** `app/Http/Controllers/PttEquipoController.php`

**Funcionalidades:**
- Registro de equipos Push-to-Talk
- Asignación a empleados
- Gestión de licencias
- Tracking de IMEI y SIM

### 6.6 Módulo de Datos de Empleado (`DatosEmpleadoController`)

**Ubicación:** `app/Http/Controllers/DatosEmpleadoController.php`

**Funcionalidades:**
- CRUD de datos personales extendidos
- Gestión de DUI, NIT, ISSS, AFP
- Información familiar (hijos)
- Documentos y archivos

### 6.7 Módulo de Archivos (`EmpleadoArchivoController`)

**Ubicación:** `app/Http/Controllers/EmpleadoArchivoController.php`

**Funcionalidades:**
- Subida de documentos
- Gestión de archivos por empleado
- Tipos de archivo: foto, DUI, NIT, contrato, etc.

---

## 7. API y Rutas

### 7.1 Rutas Web Principales

```php
// routes/web.php

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified']);

// Empleados
Route::get('/empleados', [EmpleadoController::class, 'index'])
Route::get('/empleados/nuevo', [EmpleadoController::class, 'create'])
Route::post('/empleados', [EmpleadoController::class, 'store'])
Route::get('/empleados/{anacod}', [EmpleadoController::class, 'show'])
Route::get('/empleados/{anacod}/edit', [EmpleadoController::class, 'edit'])
Route::put('/empleados/{anacod}', [EmpleadoController::class, 'update'])
Route::delete('/empleados/{anacod}', [EmpleadoController::class, 'destroy'])
Route::put('/empleados/{anacod}/baja', [EmpleadoController::class, 'baja'])

// Asistencia
Route::get('/asistencia/eventos', [AsistenciaController::class, 'eventos'])
Route::post('/asistencia/eventos', [AsistenciaController::class, 'store'])
Route::get('/asistencia/marcas', [AsistenciaController::class, 'marcaciones'])
Route::get('/asistencia/nfc', [AsistenciaController::class, 'registrosNFC'])
Route::get('/asistencia/resumen', [AsistenciaController::class, 'resumen'])
Route::get('/estadisticas', [AsistenciaController::class, 'estadisticas'])

// Horarios
Route::resource('/horarios', HorarioController::class)

// NFC Tags
Route::get('/asistencia/nfc/tags', [AsistenciaController::class, 'nfcTags'])
Route::post('/asistencia/nfc/tags', [AsistenciaController::class, 'storeNfcTag'])

// Hiring
Route::get('/contratacion', [HiringController::class, 'index'])
Route::post('/contratacion', [HiringController::class, 'store'])

// PTT Equipos
Route::resource('/ptt-equipos', PttEquipoController::class)
```

### 7.2 Rutas de Autenticación

```php
// routes/auth.php

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
    Route::post('login', [AuthenticatedSessionController::class, 'store'])
    Route::get('register', [RegisteredUserController::class, 'create'])
    Route::post('register', [RegisteredUserController::class, 'store'])
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
    Route::post('reset-password/{token}', [NewPasswordController::class, 'store'])
})

Route::middleware('auth')->group(function () {
    Route::get('verify-email', [EmailVerificationPromptController::class, '__invoke'])
    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store'])
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
})
```

---

## 8. Funcionalidades Detalladas

### 8.1 Gestión de Empleados

#### 8.1.1 Creación de Empleado

```php
// Flujo de creación
1. Validar datos de entrada
2. Verificar código único (anacod)
3. Crear registro en MySQL (tabla empleados)
4. Crear registro en PostgreSQL SAN (sistema externo)
5. Generar usuario si es necesario
6. Enviar notificaciones
```

#### 8.1.2 Actualización de Foto

El sistema permite subir fotos de empleados con:
- Compresión automática usando `compressorjs`
- Validación de tipo (JPEG, PNG)
- Límite de tamaño configurable
- Almacenamiento en `storage/app/public/fotos`

### 8.2 Control de Asistencia

#### 8.2.1 Tipos de Eventos

| Tipo | Descripción | Código |
|------|-------------|--------|
| Tarde | Llegada tardía | `tarde` |
| Ausencia | Falta completa | `ausencia` |
| Salida antes | Salida anticipada | `salida_antes` |
| Sin NFC | Marcación no detectada | `sin_nfc` |

#### 8.2.2 Proceso de Marcación NFC

```
1. Empleado presenta NFC tag
       ▼
2. Sistema lee número de serie
       ▼
3. Busca empleado asociado
       ▼
4. Registra timestamp
       ▼
5. Almacena en MariaDB (redControl)
       ▼
6. Sincroniza a MySQL local
```

#### 8.2.3 Estadísticas de Asistencia

El dashboard de estadísticas muestra:
- Total de empleados por estado
- Porcentaje de asistencia
- Llegadas tardes por departamento
- Gráficos de tendencia mensual

### 8.3 Workflow de Contratación

#### 8.3.1 Proceso Completo

```php
HiringController::store()
{
    // 1. Crear empleado en base local
    $this->crearEmpleadoLocal($datos);

    // 2. Crear usuario en Red Control
    $this->crearUsuarioRedControl($datos);

    // 3. Crear usuario en sistema de mensajería
    $this->crearUsuarioMensajeria($datos);

    // 4. Asignar rol en SAN
    $this->asignarRolSan($datos);

    // 5. Asignar reportes a roles
    $this->asignarReportes($datos);

    // 6. Enviar email Office 365
    $this->enviarEmailOffice365($datos);

    // 7. Enviar email SAP
    $this->enviarEmailSAP($datos);

    // 8. Marcar como completado
    $this->marcarCompletado($ hiring);
}
```

#### 8.3.2 Plantillas de Email

**UserRegistrationConfirmation**: Email de bienvenida con credenciales
**ControlRegistrationConfirmation**: Confirmación de registro en Red Control

### 8.4 Gestión de Horarios

#### 8.4.1 Estructura de Horario

Un horario define:
- Hora de entrada/salida del turno 1
- Hora de entrada/salida del turno 2 (opcional)
- Minutos de almuerzo
- Días libres (JSON array)

#### 8.4.2 Asignación a Empleados

```php
// Tabla: horario_empleado
- empleado_id: FK a empleados
- horario_id: FK a horarios
- fecha_asignacion: DATE
```

### 8.5 Exportación de Datos

El sistema soporta exportación a:
- **CSV**: Para datos de empleados
- **Excel**: Para reportes y estadísticas

Librería utilizada: `xlsx` (SheetJS)

---

## 9. Flujos de Trabajo

### 9.1 Flujo: Alta de Nuevo Empleado

```
┌─────────────────────────────────────────────────────────────────┐
│                     ALTA DE NUEVO EMPLEADO                       │
└─────────────────────────────────────────────────────────────────┘

  [RRHH]                           [Sistema]                    [Externo]
    │                                  │                            │
    │  1. Llena formulario             │                            │
    │───────────►                      │                            │
    │                                  │                            │
    │                    2. Validar datos                           │
    │                    ◄─────────────                             │
    │                                  │                            │
    │  3. Confirmar                   │                            │
    │◄───────────                      │                            │
    │                                  │                            │
    │                                  │  4. Crear en MySQL          │
    │                                  │────────────►                │
    │                                  │                            │
    │                                  │  5. Crear en PostgreSQL SAN │
    │                                  │────────────►                │
    │                                  │                            │
    │                                  │  6. Crear en Red Control   │
    │                                  │────────────►                │
    │                                  │                            │
    │                    7. Email de bienvenida                    │
    │                    ◄────────────────────────────              │
    │                                  │                            │
    │  8. Éxito                       │                            │
    │◄───────────                      │                            │
```

### 9.2 Flujo: Registro de Asistencia

```
┌─────────────────────────────────────────────────────────────────┐
│                   REGISTRO DE ASISTENCIA                        │
└─────────────────────────────────────────────────────────────────┘

  [NFC Reader]              [Sistema]                 [Base de Datos]
       │                        │                           │
       │  1. Leer tag NFC       │                           │
       │────────►               │                           │
       │                        │                           │
       │         2. Buscar empleado                       │
       │         ◄────────────────────────────────        │
       │                        │                           │
       │                        │  3. Registrar timestamp    │
       │                        │────────►                  │
       │                        │                           │
       │         4. Verificar horario                     │
       │         ◄────────────────────────────────        │
       │                        │                           │
       │                        │  5. Crear evento si aplica│
       │                        │────────►                  │
       │                        │                           │
       │         6. Respuesta (OK/Tarde)                   │
       │◄────────                │                           │
```

### 9.3 Flujo: Solicitud de Equipo PTT

```
┌─────────────────────────────────────────────────────────────────┐
│                   SOLICITUD DE EQUIPO PTT                       │
└─────────────────────────────────────────────────────────────────┘

  [Solicitante]              [Aprobador]               [Sistema]
       │                          │                        │
       │  1. Solicitar equipo      │                        │
       │──────────►                │                        │
       │                          │                        │
       │                          │  2. Aprobar/Rechazar    │
       │                          │────────►                │
       │                          │                        │
       │                          │  3. Asignar equipo      │
       │                          │────────►                │
       │                          │                        │
       │  4. Notificación         │                        │
       │◄─────────                 │                        │
```

---

## 10. Seguridad y Permisos

### 10.1 Sistema de Permisos (Spatie)

```php
// Roles definidos
- admin        // Administrador total
- supervisor   // Supervisor de área
- rh           // Recursos Humanos
- empleado     // Empleado básico

// Permisos
- empleado.create
- empleado.read
- empleado.update
- empleado.delete
- asistencia.create
- asistencia.read
- asistencia.update
- asistencia.delete
- horario.create
- horario.read
- horario.update
- horario.delete
- ptt.create
- ptt.read
- ptt.update
- ptt.delete
- reporte.read
```

### 10.2 Autenticación

- **Laravel Sanctum** para API tokens
- **Laravel Breeze** para autenticación web
- Contraseñas hasheadas con bcrypt
- Sesiones persistentes

### 10.3 Middleware

```php
// HandleInertiaRequests.php
- Comparte datos de usuario autenticado
- Comparte permisos y roles
- Comparte configuración de aplicación
```

---

## 11. Puntos de Mejora

### 11.1 Arquitectura y Código

| # | Área | Problema | Impacto |
|---|------|----------|---------|
| 1 | **Sin Tests** | No hay tests unitarios ni de integración | Alto - Riesgo de regresiones |
| 2 | **Services dispersos** | Lógica de negocio en Controllers | Medio - Dificultad de mantenimiento |
| 3 | **Sin API REST** | Solo rendering server-side con Inertia | Medio - Limitaciones de integración |
| 4 | **Validación manual** | Validaciones en métodos en lugar de Form Requests | Bajo - Inconsistencias potenciales |
| 5 | **Queries N+1** | Posibles problemas de rendimiento en listados | Alto - Degradación de performance |
| 6 | **Sin Cache** | Consultas frecuentes sin caché | Medio - Slow queries repetitivas |
| 7 | **Jobs no usados** | Colas de Laravel sin implementar | Medio - Operaciones síncronas lentas |
| 8 | **Sin Logging estructurado** | Logueo básico con Log::info | Bajo - Dificultad de debugging |

### 11.2 Base de Datos

| # | Área | Problema | Impacto |
|---|------|----------|---------|
| 1 | **Sin índices** | Posibles full table scans | Alto |
| 2 | **Foreign keys** | Restricciones no definidas | Medio - Datos huérfanos |
| 3 | **Soft deletes** | No se usan en todas las tablas | Medio - Recuperación difícil |
| 4 | **Migrations** | Sin versionamiento de schema | Alto |
| 5 | **Sin seeds** | Datos de prueba manuales | Bajo |

### 11.3 Frontend

| # | Área | Problema | Impacto |
|---|------|----------|---------|
| 1 | **Sin State Management** | Estado local en componentes | Medio |
| 2 | **Sin Loading States** | UI sin feedback de carga | Medio |
| 3 | **Sin Error Boundaries** | Errores pueden crashear app | Medio |
| 4 | **Sin Lazy Loading** | Todo carga al inicio | Medio |
| 5 | **CSS inline** | Posible en componentes | Bajo |
| 6 | **Sin i18n** | Hardcoded strings | Medio |

### 11.4 Seguridad

| # | Área | Problema | Impacto |
|---|------|----------|---------|
| 1 | **Sin Rate Limiting** | Vulnerable a ataques de fuerza bruta | Alto |
| 2 | **Sin CSRF en API** | Endpoints API sin protección | Alto |
| 3 | **Passwords en logs** | Posible exposición en logs | Alto |
| 4 | **Sin Audit Log** | No hay tracking de cambios | Medio |
| 5 | **Sesiones largas** | TTL de sesión no configurado | Medio |

### 11.5 Operaciones

| # | Área | Problema | Impacto |
|---|------|----------|---------|
| 1 | **Sin CI/CD** | Despliegue manual | Alto |
| 2 | **Sin Monitoreo** | Sin APM o logging centralizado | Alto |
| 3 | **Sin Backup automatizado** | Respaldo manual | Alto |
| 4 | **Documentación** | Solo README genérico Laravel | Medio |

---

## 12. Sugerencias de Implementación

### 12.1 Corto Plazo (1-3 meses)

#### 12.1.1 Implementar Tests

```bash
# Estructura de tests
tests/
├── Feature/
│   ├── EmployeeTest.php
│   ├── AttendanceTest.php
│   └── HiringWorkflowTest.php
└── Unit/
    ├── Models/
    └── Services/
```

**Pasos:**
1. Instalar PHPUnit y Pest
2. Crear factories para modelos principales
3. Escribir tests para CRUD de empleados
4. Escribir tests para workflow de asistencia
5. Implementar CI con GitHub Actions

#### 12.1.2 Form Requests para Validación

```php
// Crear StoreEmpleadoRequest.php
class StoreEmpleadoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'anacod' => 'required|unique:empleados|size:8',
            'nombre' => 'required|string|max:100',
            'appaterno' => 'required|string|max:50',
            // ...
        ];
    }
}

// Usar en controlador
public function store(StoreEmpleadoRequest $request)
{
    // $request->validated() ya viene validado
}
```

#### 12.1.3 Optimizar Queries con Eager Loading

```php
// ANTES (N+1)
$empleados = Empleado::all();
foreach ($empleados as $emp) {
    echo $emp->datosEmpleado->dui;  // Query por cada uno
}

// DESPUÉS (Eager Loading)
$empleados = Empleado::with(['datosEmpleado', 'horario'])
    ->where('status', 1)
    ->get();
```

#### 12.1.4 Agregar Índices a Base de Datos

```php
// migration_add_indexes.php
Schema::table('empleados', function (Blueprint $table) {
    $table->index('status');
    $table->index('empresa');
    $table->index('anacod_jefe');
    $table->index(['status', 'empresa']);
});

Schema::table('asistencias', function (Blueprint $table) {
    $table->index('anacod');
    $table->index('fecha');
    $table->index(['anacod', 'fecha']);
});

Schema::table('datos_empleados', function (Blueprint $table) {
    $table->index('dui');
    $table->index('nit');
});
```

### 12.2 Mediano Plazo (3-6 meses)

#### 12.2.1 Extraer Servicios

```php
// app/Services/EmployeeService.php
class EmployeeService
{
    public function __construct(
        private MailService $mailService,
        private RedControlService $redControl
    ) {}

    public function create(array $data): Empleado
    {
        // Transacción completa
        DB::transaction(function () use ($data) {
            $empleado = $this->createLocal($data);
            $this->syncToSan($empleado);
            $this->createRedControlUser($empleado);
            $this->sendWelcomeEmail($empleado);
        });

        return $empleado;
    }
}
```

#### 12.2.2 Implementar Cache

```php
// config/cache.php - configurar Redis
// app/Providers/AppServiceProvider.php

public function boot(): void
{
    // Cache de horarios (válido 1 hora)
    Route::get('/horarios', function () {
        return Cache::remember('horarios_activos', 3600, function () {
            return Horario::where('status', 1)->get();
        });
    });

    // Cache de estadísticas (válido 5 minutos)
    Cache::remember('estadisticas_mes', 300, function () {
        return $this->calcularEstadisticas();
    });
}
```

#### 12.2.3 Jobs para Procesos Lentos

```php
// app/Jobs/ProvisionOffice365Job.php
class ProvisionOffice365Job implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public int $tries = 3;
    public int $timeout = 120;

    public function handle(): void
    {
        // Provisión de usuario en Office 365
        // Enviar email de confirmación
    }
}

// En HiringController
ProvisionOffice365Job::dispatch($hiring);
```

#### 12.2.4 API REST

```php
// routes/api.php
Route::prefix('api/v1')->group(function () {
    Route::apiResource('empleados', ApiEmpleadoController::class);
    Route::apiResource('asistencias', ApiAsistenciaController::class);
    Route::get('/empleados/{anacod}/asistencia', [ApiEmpleadoController::class, 'attendance']);
});

// app/Http/Controllers/Api/

class ApiEmpleadoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $empleados = Empleado::with(['datosEmpleado'])
            ->filter($request->only(['status', 'empresa']))
            ->paginate(20);

        return response()->json($empleados);
    }
}
```

#### 12.2.5 Rate Limiting

```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('auth', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });
}

// routes/api.php
Route::middleware(['api', 'throttle:api'])->group(function () {
    // ...
});
```

### 12.3 Largo Plazo (6-12 meses)

#### 12.3.1 Auditoría Completa

```php
// app/Observers/EmpleadoObserver.php
class EmpleadoObserver
{
    public function created(Empleado $empleado): void
    {
        Audit::create([
            'user_id' => auth()->id(),
            'model' => 'Empleado',
            'model_id' => $empleado->anacod,
            'action' => 'create',
            'old_values' => null,
            'new_values' => $empleado->toArray(),
            'ip' => request()->ip(),
        ]);
    }
}

// bootstrap/app.php
Event::observe(EmpleadoObserver::class);
```

#### 12.3.2 Monitoreo con Laravel Telescope

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

```php
// config/telescope.php
'enabled' => env('TELESCOPE_ENABLED', true),

// Solo en desarrollo local o cuando está habilitado explícitamente
'middleware' => ['web', AuthorizeRequests::class],
```

#### 12.3.3 Dashboard en Tiempo Real

```javascript
// resources/js/Components/RealTimeDashboard.jsx
import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';

export default function RealTimeDashboard() {
    const [stats, setStats] = useState({});

    useEffect(() => {
        const echo = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
        });

        echo.channel('attendance')
            .listen('AttendanceUpdated', (e) => {
                setStats(e.stats);
            });

        return () => echo.leaveChannel('attendance');
    }, []);

    return <Dashboard stats={stats} />;
}
```

#### 12.3.4 Internacionalización

```bash
# Instalar
npm install vue-i18n
```

```javascript
// resources/js/i18n/index.js
import { createI18n } from 'vue-i18n';
import es from './locales/es.json';
import en from './locales/en.json';

export default createI18n({
    locale: 'es',
    messages: { es, en },
});
```

```php
// Traducciones de backend
// resources/lang/es/empleados.php
return [
    'create' => 'Crear empleado',
    'edit' => 'Editar empleado',
    'delete' => 'Eliminar empleado',
];
```

#### 12.3.5 PWA para Marcación Móvil

```json
// public/manifest.json
{
    "name": "Administracion Red Intelfon",
    "short_name": "Admin",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#3b82f6",
    "icons": [
        {
            "src": "/icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

```javascript
// resources/js/service-worker.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}
```

### 12.4 Mejoras de UX/UI

#### 12.4.1 Estados de Carga

```jsx
// Componente reutilizable
function LoadingButton({ children, loading, ...props }) {
    return (
        <button disabled={loading} {...props}>
            {loading ? (
                <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Cargando...
                </span>
            ) : children}
        </button>
    );
}
```

#### 12.4.2 Empty States

```jsx
function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="text-center py-12">
            <Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
}
```

#### 12.4.3 Notificaciones Toast

```jsx
// resources/js/Components/Toast.jsx
import { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
    };

    return (
        <Transition
            show={true}
            enter="transform transition duration-300"
            enterFrom="translate-y-2 opacity-0"
            enterTo="translate-y-0 opacity-100"
            className={`${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg`}
        >
            {message}
        </Transition>
    );
}
```

---

## 13. Configuración y Despliegue

### 13.1 Variables de Entorno

```env
# .env.example

# App
APP_NAME="Administracion"
APP_ENV=local|production
APP_KEY=base64:xxxxx
APP_DEBUG=true|false
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=administracion
DB_USERNAME=root
DB_PASSWORD=

# PostgreSQL SAN
DB_CONNECTION_SAN=pgsql
SAN_DB_HOST=172.17.10.30
SAN_DB_PORT=5432
SAN_DB_DATABASE=san
SAN_DB_USERNAME=
SAN_DB_PASSWORD=

# MariaDB Red Control
DB_CONNECTION_RED_CONTROL=mysql
RED_CONTROL_DB_HOST=172.17.2.68
RED_CONTROL_DB_PORT=3306
RED_CONTROL_DB_DATABASE=redControl
RED_CONTROL_DB_USERNAME=
RED_CONTROL_DB_PASSWORD=

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USERNAME= noreply@intelfon.com
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@intelfon.com
MAIL_FROM_NAME="${APP_NAME}"

# Graph Mail (Office 365)
GRAPH_MAIL_TENANT_ID=
GRAPH_MAIL_CLIENT_ID=
GRAPH_MAIL_CLIENT_SECRET=

# Session
SESSION_DRIVER=database|redis
SESSION_LIFETIME=120

# Cache
CACHE_DRIVER=file|redis

# Queue
QUEUE_CONNECTION=database|redis
```

### 13.2 Requisitos del Servidor

```yaml
# requisitos-servidor.md
---
PHP:
  versión: "^8.2"
  extensiones:
    - pdo_mysql
    - pdo_pgsql
    - pdo_odbc
    - mbstring
    - xml
    - zip
    - gd
    - imap
    - bcmath

Base de Datos:
  MySQL: "^8.0"
  PostgreSQL: "^14" (para SAN)
  MariaDB: "^10.6" (para Red Control)

Node.js:
  versión: "^18.0"

Web Server:
  Apache: "2.4+"
  Nginx: "1.20+"

Recursos Recomendados:
  CPU: 4 cores
  RAM: 8 GB
  Disco: 50 GB SSD
```

### 13.3 Comandos de Despliegue

```bash
#!/bin/bash
# deploy.sh

# 1. Pull cambios
git pull origin main

# 2. Instalar dependencias PHP
composer install --no-dev --optimize-autoloader

# 3. Instalar dependencias Node
npm install
npm run build

# 4. Ejecutar migraciones
php artisan migrate --force

# 5. Limpiar caché
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Permisos
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data /var/www/html

# 7. Reiniciar workers
php artisan queue:restart
```

### 13.4 Checklist de Seguridad

- [ ] Cambiar APP_KEY en producción
- [ ] Desactivar APP_DEBUG en producción
- [ ] Configurar SSL/TLS
- [ ] Implementar rate limiting
- [ ] Configurar firewall
- [ ] Habilitar logging de errores
- [ ] Revisar permisos de archivos
- [ ] Configurar backup automático
- [ ] Usar variables de entorno para secrets
- [ ] Desactivar listing de directorios

---

## Anexo A: Glosario

| Término | Descripción |
|---------|-------------|
| **anacod** | Código único de empleado en el sistema |
| **SAN** | Sistema de Gestión de Empleados (PostgreSQL) |
| **Red Control** | Sistema de control de acceso y agenda |
| **NFC** | Near Field Communication - tecnología de tags |
| **PTT** | Push-to-Talk - comunicación por radio |
| **PWA** | Progressive Web App |
| **Inertia** | Librería para SPA con Laravel |
| **Horarios** | Define horas de entrada/salida de trabajo |

## Anexo B: Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/empleados | Listar empleados |
| POST | /api/v1/empleados | Crear empleado |
| GET | /api/v1/empleados/{anacod} | Ver empleado |
| PUT | /api/v1/empleados/{anacod} | Actualizar empleado |
| DELETE | /api/v1/empleados/{anacod} | Eliminar empleado |
| GET | /api/v1/asistencias | Listar assistencias |
| POST | /api/v1/asistencias | Registrar asistencia |
| GET | /api/v1/horarios | Listar horarios |

---

*Documento generado el: August 21, 2026*
*Versión del sistema: Laravel 12 + React 18*
