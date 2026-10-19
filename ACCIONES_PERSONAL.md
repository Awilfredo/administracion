# Resumen de Acciones de Personal (módulo `empleado_acciones`)

## Arquitectura

| Capa | Stack |
|---|---|
| Persistencia | Laravel 11 + MySQL (4 tablas en conexión `mysql`) |
| Modelos | Eloquent con relaciones |
| Frontend | React + Inertia 2 |
| Patrón | Sincronización automática con tabla externa `pro_eventos_asistencia` (en `san`) y API Red de Presupuestos |

## 1. Migraciones (4)

### `empleado_accion_tipos` (catálogo)
```php
$table->id();
$table->string('codigo', 50)->unique();
$table->string('nombre', 100);
$table->text('descripcion')->nullable();
$table->boolean('requiere_adjunto')->default(false);
$table->boolean('activo')->default(true);
$table->timestamps();
```
Seeder: `vacaciones`, `permiso`, `incapacidad`, `otro`.

### `empleado_acciones`
```php
$table->id();
$table->string('anacod', 50)->index();
$table->foreignId('tipo_id')->constrained('empleado_accion_tipos')->restrictOnDelete();
$table->date('fecha_inicio');
$table->date('fecha_fin')->nullable();
$table->text('motivo');
$table->enum('estado', ['aprobado', 'cancelado'])->default('aprobado');
$table->text('observaciones')->nullable();
$table->unsignedBigInteger('created_by')->nullable();
$table->unsignedBigInteger('updated_by')->nullable();
$table->timestamps();
```

### `empleado_accion_archivos` (adjuntos)
```php
$table->id();
$table->foreignId('empleado_accion_id')->constrained('empleado_acciones')->cascadeOnDelete();
$table->string('path');
$table->string('nombre_original');
$table->string('mime_type', 100)->nullable();
$table->unsignedInteger('tamano')->nullable();
$table->unsignedBigInteger('uploaded_by')->nullable();
$table->timestamps();
```

### `add_horas_drop_dias_to_empleado_acciones_table`
- Agrega `hora_inicio`, `hora_fin` (time, nullable).
- Drop `dias` (cálculo obsoleto).

## 2. Modelos

- **`EmpleadoAccionTipo`**: fillable + cast booleans + relación `acciones()`.
- **`EmpleadoAccion`**: casts `fecha_inicio/fin => date:Y-m-d`, `hora_inicio/fin => string`, relaciones `tipo()` y `archivos()`.
- **`EmpleadoAccionArchivo`**: fillable + cast `tamano => integer` + relación `accion()`.

## 3. Rutas

### Per-empleado
```
GET    /empleados/{anacod}/acciones
GET    /empleados/{anacod}/acciones/create
POST   /empleados/{anacod}/acciones
GET    /empleados/{anacod}/acciones/{id}/edit
PATCH  /empleados/{anacod}/acciones/{id}
DELETE /empleados/{anacod}/acciones/{id}
POST   /empleados/{anacod}/acciones/{id}/cancel
GET    /empleados/{anacod}/acciones/{id}/archivos/{archivo}
DELETE /empleados/{anacod}/acciones/{id}/archivos/{archivo}
```

### Global
```
GET    /acciones
GET    /acciones/create
POST   /acciones
GET    /acciones/{id}/edit
PATCH  /acciones/{id}
DELETE /acciones/{id}
POST   /acciones/{id}/cancel
```

### Admin (tipos)
```
GET/POST/PATCH/DELETE /admin/accion-tipos/...
```

## 4. `EmpleadoAccionController`

### Métodos
- **Per-empleado**: `index`, `create`, `store`, `edit`, `update`, `destroy`, `cancel`
- **Global**: `globalIndex`, `globalCreate`, `globalStore`, `globalEdit`, `globalUpdate`, `globalDestroy`, `globalCancel`
- **Archivos**: `downloadArchivo`, `destroyArchivo`

### Helpers
- **`ensureEmpleadoExists($anacod)`** — consulta `san.pro_anacod` para validar.
- **`empleadosActivos()`** — array `[{anacod, ananam}]` filtrado por `anasta='A' AND anatip='U'`.
- **`validatePayload(Request, bool $requireAnacod)`** — normaliza `H:i:s` → `H:i` antes de validar.
- **`persist(Request, $data, $anacod, ?$existing)`** — crea/actualiza + sube archivos + sincroniza.
- **`applyFilters($query, $filters)`** — filtros para el index.
- **`getTipoNombre(int $tipoId)`** — helper.

### Sincronización con `pro_eventos_asistencia` (SAN)

- **`limpiarEventosEnRango()`** — `UPDATE ... SET accion_personal = NULL` en el rango.
- **`llenarEventosEnRango()`** — `UPDATE ... SET accion_personal = ?` donde `accion_personal IS NULL`.
- **`aplicarFiltroHora()`** — `whereRaw('(EXTRACT(HOUR FROM fecha) * 60 + EXTRACT(MINUTE FROM fecha)) BETWEEN ? AND ?')`.

## 5. `EmpleadoAccionTipoController`

CRUD completo de tipos con soft delete (`activo=false`).

## 6. Sidebar

Entrada "Acciones de personal" en `AuthenticatedLayout.jsx`.

## 7. Nav del empleado

Pestaña "Acciones" en `Nav.jsx`.

## 8. Frontend

| Vista | Función |
|---|---|
| `Eventos/Index.jsx` (per-empleado) | Listado con filtros |
| `Eventos/Create.jsx` (per-empleado) | Form de creación |
| `Eventos/Edit.jsx` (per-empleado) | Form de edición |
| `Eventos/GlobalIndex.jsx` | Listado global con columna empleado |
| `Eventos/GlobalCreate.jsx` | Form global con typeahead |
| `Eventos/GlobalEdit.jsx` | Form global de edición |
| `Acciones/Tipos/Index.jsx` | Listado de tipos |
| `Acciones/Tipos/Create.jsx` | Form de creación de tipo |
| `Acciones/Tipos/Edit.jsx` | Form de edición de tipo |

### Componentes compartidos
- **`AccionForm.jsx`** — formulario con tipo, fechas, horario, motivo, observaciones, archivos.
- **`AccionTable.jsx`** — tabla con `scope` y `showEmpleado`.
- **`EmpleadoDatalist`** (dentro de AccionForm) — `<datalist>` HTML nativo.
- **`AccionesIcons.jsx`** — 7 iconos SVG inline.

## 9. Dashboard

- `AsistenciaController::dashboardAcciones()`:
  - `acciones_hoy` — conteo por tipo.
  - `proximas_acciones` — hasta 5 acciones en los próximos 7 días.
- 4 cards nuevas en "Hoy" + sección "Próximas acciones de personal".

## 10. Eventos de asistencia (Asistencia/Eventos.jsx)

- `MarcasFiltro` con presets + fechas + usuario.
- Estado en URL: `router.reload({ data, only: ['asistencias', 'filters'] })`.
- Columna "Acción" como badge indigo.
- Export a CSV.
- `AsistenciaController::index(Request)` carga data filtrada.

## 11. Comando artisan de sincronización

**`php artisan acciones:sincronizar-asistencia`** — cada 15 min.

## 12. Notificación por email

**`PresupuestosUserCreatedNotification`** + vista `emails.presupuestos_user_created.blade.php`.

## 13. Fixes resueltos

| # | Bug | Fix |
|---|---|---|
| 1 | `H:i:s` no validaba `H:i` | Normalizar antes de `validate()` |
| 2 | Fechas no pre-llenadas | Cast `date:Y-m-d` |
| 3 | `<select>` sin valor | `value` prop en `Select.jsx` |
| 4 | Errores invisibles | Bloque rojo en forms |
| 5 | `Eventos.jsx` con `fetch()` | `usePage().props` + `router.reload` |
| 6 | `getEventos` JSON endpoint | Eliminado, reemplazado por Inertia partial reload |

## 14. Archivos

### Creados
```
database/migrations/2026_10_15_112338_create_empleado_accion_tipos_table.php
database/migrations/2026_10_15_112339_create_empleado_acciones_table.php
database/migrations/2026_10_15_112340_create_empleado_accion_archivos_table.php
database/migrations/2026_10_15_115426_add_horas_drop_dias_to_empleado_acciones_table.php
database/seeders/EmpleadoAccionTipoSeeder.php
app/Models/EmpleadoAccionTipo.php
app/Models/EmpleadoAccion.php
app/Models/EmpleadoAccionArchivo.php
app/Http/Controllers/EmpleadoAccionController.php
app/Http/Controllers/EmpleadoAccionTipoController.php
app/Console/Commands/SincronizarAccionesAsistenciaCommand.php
app/Mail/PresupuestosUserCreatedNotification.php
resources/views/emails/presupuestos_user_created.blade.php
resources/js/Pages/Empleados/Acciones/Components/AccionForm.jsx
resources/js/Pages/Empleados/Acciones/Components/AccionTable.jsx
resources/js/Pages/Empleados/Acciones/Tipos/Index.jsx
resources/js/Pages/Empleados/Acciones/Tipos/Create.jsx
resources/js/Pages/Empleados/Acciones/Tipos/Edit.jsx
resources/js/Components/Icons/AccionesIcons.jsx
```

### Modificados
```
app/Http/Controllers/AsistenciaController.php
app/Http/Controllers/EmpleadoController.php
app/Models/EmpleadoAccion.php
routes/web.php
resources/js/Pages/Empleados/Show.jsx
resources/js/Pages/Dashboard.jsx
resources/js/Pages/Asistencia/Eventos.jsx
resources/js/Layouts/AuthenticatedLayout.jsx
resources/js/Pages/Empleados/Partials/Nav.jsx
resources/js/Pages/Empleados/Partials/Select.jsx
```

## 15. Reglas de negocio

1. **Auto-asignación de `accion_personal`** — sin edición manual.
2. **Match por `anacod` + fecha + hora** — la clave es el rango.
3. **Limpieza agresiva en delete/cancel/update** — limpia rango viejo, llena nuevo.
4. **Solo llena nulls en el sync manual**.
5. **Filtro de tiempo** — `EXTRACT(HOUR/MINUTE FROM fecha)`.
6. **Persistencia de filtros en URL**.

## 16. Cómo se usa

1. Sidebar → "Acciones de personal" → listado global.
2. Por empleado → "Acciones" (pestaña).
3. Crear acción → seleccionar tipo + fechas + motivo + horario opcional.
4. Editar → actualiza eventos del rango.
5. Eliminar o cancelar → limpia eventos.
6. Eventos de asistencia → `acciones_personal` se llena automáticamente.

## 17. Verificación

- `php artisan migrate` + `php artisan db:seed --class=EmpleadoAccionTipoSeeder`.
- `npm run build`.
- `php artisan acciones:sincronizar-asistencia --dry-run`.

---

## 18. Aprobador temporal (extensión reciente)

### Motivación
Cuando un empleado se ausenta por una acción de personal prolongada (más de 6h o multi-día) y es aprobador de cc/cuentas en Presupuestos, las solicitudes de aprobación de esas cuentas podrían quedar sin respuesta. El sistema detecta esto y permite asignar un aprobador temporal con una ventana de fechas específica.

### Reglas de detección
- `esAccionProlongada(data)`:
  - Si `fecha_fin > fecha_inicio` → true (multi-día).
  - Si mismo día sin horas → true (día completo).
  - Si mismo día con horas → true si la diferencia es `> 360 minutos` (6h) o `<= 0`.

### Comportamiento
- Al detectar que el usuario es aprobador vigente de N cc/cuentas en Presupuestos, se muestra un modal con:
  - Lista de cc/cuentas donde es aprobador.
  - Selector de aprobador temporal (autocomplete de usuarios del tenant vía API Red).
  - Vigente desde (default: `accion.fecha_inicio`).
  - Vigente hasta (default: `accion.fecha_fin`).
- Tres acciones disponibles en el modal:
  1. **Asignar y guardar**: crea registros de aprobador temporal con la ventana de fechas y luego guarda la acción.
  2. **Guardar sin asignar**: registra `sync_status='skipped'` localmente y luego guarda la acción.
  3. **Cancelar**: cierra el modal, NO se guarda la acción.

### Decisión P1=B: NO pausar al original
El aprobador original permanece activo en su registro. Durante la ausencia, ambos aprueban.

### Decisión P3=A: tabla de auditoría
Tabla `empleado_aprobadores_temporales` con campos:
- `anacod_origen` — empleado que se ausenta.
- `temp_user_id` — id en Red del aprobador temporal.
- `accion_personal_id` — FK opcional a `empleado_acciones`.
- `fecha_desde`, `fecha_hasta` — ventana de vigencia.
- `pausar_original` — boolean (siempre false con P1=B).
- `cc_cuentas` — JSON con `[{cc_id, cuenta_id, remote_cc_cuenta_id}]`.
- `sync_status` — `pending|ok|error|skipped`.
- `last_error` — texto del error si aplica.
- `api_response` — JSON con la respuesta cruda del API.
- `created_by`, `created_at`, `updated_at`.

Modelo `EmpleadoAprobadorTemporal` con accesores `is_ok`, `is_error`, `is_skipped`, `is_pending`.

### Endpoints nuevos

#### Backend (5 métodos en `EmpleadoAccionController`)
- `POST /empleados/{anacod}/acciones/check-aprobador` — devuelve `{is_aprobador, user_id, cc_cuentas, warning}`.
- `POST /empleados/{anacod}/acciones/asignar-aprobador-temporal` — upsert en API Red + auditoría.
- `POST /empleados/{anacod}/acciones/skip-aprobador-temporal` — auditoría con `skipped`.
- `GET /acciones/search-users?search=...` — proxy para autocomplete (oculta token).
- `globalCheckAprobador`, `globalAsignarTemporal`, `globalSkipTemporal` — equivalentes para el flujo global (leen `anacod` del body).

#### Métodos del `PresupuestosApiClient` (5 nuevos)
- `listUsers(string $search, string $estado, int $perPage): array` — lista paginada del tenant.
- `getUserCcCuentas(int $userId): Collection` — cc/cuentas con `is_currently_active` (cache 60s).
- `upsertUserCcCuenta(int $userId, int $ccId, int $cuentaId, array $attrs): array` — UPSERT en API Red.
- `updateUserCcCuenta(int $userId, int $ccCuentaId, array $attrs): array` — update por id.
- `mapCcCuentas(array $data): Collection` — mapper interno.

#### Frontend (4 archivos modificados + 3 nuevos)
- **Modificados**: `Create.jsx`, `Edit.jsx`, `GlobalCreate.jsx`, `GlobalEdit.jsx`.
- **Nuevos**:
  - `resources/js/Components/AprobadorTemporalModal.jsx` — modal con autocomplete + lista de cc/cuentas.
  - `resources/js/Helpers/esAccionProlongada.js` — helper de detección.
  - `resources/js/Helpers/apiFetch.js` — wrapper de `fetch` con CSRF.

### Flujo
1. Operador completa el formulario de acción de personal.
2. `useEffect` con debounce 500ms llama a `check-aprobador` cuando la acción es prolongada.
3. Si `is_aprobador=true` → se muestra `AprobadorTemporalModal`.
4. Operador elige entre 3 caminos (asignar / omitir / cancelar).
5. Tras confirmar, se ejecuta el submit normal de la acción de personal.
6. La acción redirige a `empleados.acciones.index` con mensaje de éxito.

### Card de auditoría en `Show.jsx`
Sección "Aprobadores temporales asignados" muestra los últimos 10 registros con:
- ID del aprobador temporal + email.
- Rango de fechas.
- Cantidad de cc/cuentas.
- Badge de status (`ok|error|skipped|pending`).

### Archivos creados/modificados

#### Creados
```
database/migrations/2026_10_16_120000_create_empleado_aprobadores_temporales_table.php
app/Models/EmpleadoAprobadorTemporal.php
resources/js/Components/AprobadorTemporalModal.jsx
resources/js/Helpers/esAccionProlongada.js
resources/js/Helpers/apiFetch.js
```

#### Modificados
```
app/Services/PresupuestosApiClient.php        (+ listUsers, getUserCcCuentas, upsert/update, mapCcCuentas)
app/Http/Controllers/EmpleadoAccionController.php   (+ checkAprobador, asignarAprobadorTemporal, skipAprobadorTemporal, searchUsers, + 3 globales)
app/Http/Controllers/EmpleadoController.php   (+ query aprobadoresTemporales en show)
routes/web.php                                (+ 6 rutas)
resources/js/Pages/Empleados/Acciones/Create.jsx
resources/js/Pages/Empleados/Acciones/Edit.jsx
resources/js/Pages/Empleados/Acciones/GlobalCreate.jsx
resources/js/Pages/Empleados/Acciones/GlobalEdit.jsx
resources/js/Pages/Empleados/Show.jsx         (+ card de auditoría)
```

### Verificación
- `php artisan migrate` ejecuta la nueva tabla.
- `npm run build` compila sin errores.
- Tinker: `$client = app(PresupuestosApiClient::class); $client->listUsers(); $client->getUserCcCuentas(42);`
- Flujo manual: crear acción de 5 días para empleado aprobador → modal aparece → asignar aprobador temporal → verificar en API Red.
