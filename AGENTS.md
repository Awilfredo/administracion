# Agente: administracion

Proyecto Laravel 12 con Inertia.js v2 + React 18. Este archivo define las convenciones y reglas que el agente debe seguir al trabajar en este repositorio.

## 1. Stack & entorno

- PHP 8.5.9 (única versión instalada en el sistema)
- Composer 2.9.7
- Laravel 12.69.2 (`laravel/framework: ^12.0`)
- Inertia.js v2.0.26 (`inertiajs/inertia-laravel: ^2.0`) + `@inertiajs/react` 2.3
- MySQL como base de datos principal
- Spatie Laravel Permission 6.21 (`spatie/laravel-permission: ^6.7`)
- Laravel Sanctum 4.2 (`laravel/sanctum: ^4.0`)
- Node 18+ con Vite 5, React 18, Tailwind 3
- Zona horaria: `America/El_Salvador`

## 2. Comandos útiles

- `composer dev` → arranca `php artisan serve` + `npm run dev` en paralelo.
- `php artisan serve` → servidor PHP standalone (puerto 8000 por defecto).
- `php artisan about` → resumen del estado del proyecto.
- `php artisan route:list` → listado de rutas registradas.
- `npm run dev` / `npm run build` → Vite dev server / build de producción.
- `php artisan test` → ⚠️ actualmente roto (`Class "SebastianBergmann\Environment\Console" not found`). Fix pendiente: `composer require --dev sebastian/environment:^6.0`.

> Antes de proponer cualquier comando, confirmar que el usuario lo aprobó explícitamente (ver sección 8).

## 3. Reglas generales (cosas a evitar)

- ❌ NO ejecutar `--ignore-platform-req=php` ni fijar `composer config platform.php` con un valor falso. Mantener la compatibilidad real con PHP 8.5.
- ❌ NO modificar `composer.lock` ni `package-lock.json` a mano. Usar `composer update <paquete>` o `npm update <paquete>`.
- ❌ NO hacer commits sin confirmación explícita del usuario.
- ❌ NO añadir emojis en código, mensajes de commit, ni documentación.
- ❌ NO inventar URLs; usar solo las que el usuario provea o que ya estén en el repositorio.
- ❌ NO añadir comentarios al código salvo que el usuario lo pida explícitamente.
- ❌ NO subir la versión de PHP a una más reciente; mantener compatibilidad con 8.5. Si una dependencia exige PHP < 8.4, informar antes de proceder.
- ✅ Antes de proponer cambios grandes, leer `DOCUMENTACION.md` si existe y respeta su contenido.
- ✅ Mantener los cambios mínimos y reversibles cuando sea posible.

## 4. Estructura clave del proyecto

- `app/Http/Controllers/` → controladores Laravel (sufijo `Controller`).
- `app/Http/Middleware/HandleInertiaRequests.php` → props compartidas por defecto para todas las páginas Inertia.
- `app/Http/Controllers/Auth/` → controladores de autenticación (Breeze).
- `resources/js/app.jsx` → punto de entrada Inertia (`createInertiaApp`).
- `resources/js/Pages/` → páginas React (PascalCase + subcarpeta por módulo).
- `resources/js/Layouts/` → `AuthenticatedLayout`, `GuestLayout`.
- `resources/js/Components/` → componentes reutilizables.
- `resources/js/Helpers/` → utilidades (fechas, exports, etc.).
- `resources/views/app.blade.php` → layout raíz Blade (sólo este; el resto son páginas React).
- `routes/web.php` → todas las rutas web.
- `database/migrations/` → migraciones (ver sección 5 — no tocar).
- `database/seeders/` → seeders.
- `tests/Feature/` y `tests/Unit/` → tests.
- `DOCUMENTACION.md` → documentación interna del proyecto (si existe, leer antes de cambios grandes).

## 5. 🚫 Prohibido: base de datos

Reglas absolutas. El agente **jamás** debe ejecutar, sugerir como automático, ni incluir en scripts:

- ❌ `php artisan migrate`, `migrate:fresh`, `migrate:install`, `migrate:refresh`, `migrate:reset`, `migrate:rollback`, `migrate:status`.
- ❌ `php artisan db:seed`, `db:wipe`, `db:truncate`, `db:show`.
- ❌ `php artisan tinker` con cualquier operación de escritura (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `CREATE`, `ALTER`).
- ❌ Crear, modificar o eliminar archivos en `database/migrations/` sin confirmación explícita.
- ❌ Incluir en código que el agente escriba: `DB::statement()`, `DB::table()->update()`, `->delete()`, `->truncate()`, `Schema::create/drop/table`, `Model::truncate()`, `forceCreate`, `Model::unguard()`, factories de Eloquent que persistan datos.
- ❌ Ejecutar tests que toquen la base de datos real; sólo permitido si el usuario confirma y se usa una DB de tests aislada o SQLite en memoria.
- ❌ Modificar archivos `.env`, `config/database.php` ni credenciales de conexión.

✅ Si una tarea requiere cualquiera de las operaciones anteriores, el agente debe **detenerse y pedir confirmación explícita** listando:
   - comando exacto o sentencia exacta,
   - tablas/archivos afectados,
   - efecto esperado (datos que se crean/modifican/eliminan),
   - reversibilidad (cómo deshacer).

No avanzar hasta recibir confirmación del usuario.

## 6. Convenciones Inertia (frontend React)

- **Naming de páginas**: PascalCase, agrupadas por módulo en subcarpeta **plural** con archivos `Index/Create/Show/Edit/...`:
  - `resources/js/Pages/Auth/Login.jsx`
  - `resources/js/Pages/Empleados/Index.jsx`
  - `resources/js/Pages/Empleados/Create.jsx`
  - `resources/js/Pages/Empleados/Show.jsx`
  - `resources/js/Pages/Asistencia/Marcaciones.jsx`
  - `resources/js/Pages/Asistencia/Eventos.jsx`
  - `resources/js/Pages/Asistencia/Resumen.jsx`
  - `resources/js/Pages/Asistencia/Estadisticas.jsx`
  - `resources/js/Pages/Asistencia/RegistrosNFC.jsx`
  - `resources/js/Pages/Asistencia/Formulario.jsx`
  - `resources/js/Pages/Asistencia/MarcasDia.jsx`
  - `resources/js/Pages/Horarios/Index.jsx`
  - `resources/js/Pages/Horarios/Edit.jsx`
  - **Convención del módulo** (plural, análoga al nombre del controlador y al prefijo de la ruta):
    - `EmpleadoController` → carpeta `Empleados/`, archivos `Index`, `Create`, `Show`, `Edit`, etc.
    - `AsistenciaController` → carpeta `Asistencia/`, archivos `Index` (Eventos), `Marcaciones`, `MarcasDia`, `Resumen`, `Estadisticas`, `RegistrosNFC`, `Formulario`.
    - `HorarioController` → carpeta `Horarios/`, archivos `Index`, `Edit`.
    - `Inertia::render('Empleados/Index')` para la lista, `Inertia::render('Empleados/Create')` para crear, `Inertia::render('Empleados/Show')` para detalle.
    - **No** incluir el nombre del módulo redundante en el archivo (ej: `Empleados/ShowEmpleado.jsx`).
    - Subcarpetas permitidas dentro del módulo: `components/`, `Partials/`, `Helpers/`.
  - **Excepciones justificadas** (páginas que viven en `Pages/` raíz por ser "globales" o transversales):
    - `Dashboard.jsx` → ruta `dashboard` post-login, renderizada por `AsistenciaController@dashboard`. No pertenece a un módulo específico, es la home del sistema.
    - `Welcome.jsx` → landing pública, renderizada por una Closure en `routes/web.php:54`.
    - `TempPage.jsx` → página temporal usada por `HiringController`.
  - **Módulo transversal `Nfc/`**: lo renderiza `AsistenciaController@nfcCreate`. Se conserva como carpeta propia `Pages/Nfc/Create.jsx` por ser un sub-dominio funcional diferenciado (NFC), aunque su controlador padre sea Asistencia.
- **Layouts**: importar desde `resources/js/Layouts/`.
  - Páginas autenticadas → `AuthenticatedLayout`
  - Páginas públicas (login, registro, reset) → `GuestLayout`
- **Componentes**: en `resources/js/Components/`, PascalCase, un archivo por componente.
- **Helpers**: en `resources/js/Helpers/`, PascalCase, sufijo por propósito (`ManejoFechas.jsx`, `ExportCSV.jsx`, `ComprimirImagen.jsx`).
- **Imports de Inertia**:
  - `import { Head, Link, router, useForm, usePage } from '@inertiajs/react';`
  - Acceder a props globales vía `const { auth, errors, flash } = usePage().props;`
- **Formularios**: usar `useForm()` para estado + submit. Nunca `fetch`/`axios` directo en submits de formularios Inertia.
- **Navegación**: `<Link href={route('...')}>` o `router.visit()`. Nunca `window.location` salvo redirect duro necesario.
- **Rutas en JS**: usar siempre la helper `route()` (de Ziggy) con el nombre de la ruta, nunca concatenar paths a mano.
- **Iconos**: `react-icons` (Fa*, Hi*, Md*, etc.). Iconos propios en `resources/js/Components/Icons/` (PascalCase). **No emojis**.
- **Imágenes / uploads**: usar `react-dropzone` + `compressorjs` (ya en el proyecto).
- **Estilos**: exclusivamente clases Tailwind. No añadir styled-components, Emotion ni CSS-in-JS nuevos.
- **Props compartidas**: extender en `app/Http/Middleware/HandleInertiaRequests.php::share()` y no duplicar en cada `Inertia::render()`.
- **Errores de validación**: leerlos de `errors` (prop global de Inertia) o del estado de `useForm()`; mostrarlos con el componente `InputError`.
- **SweetAlert**: ya hay `sweetalert2` integrado vía CDN en `app.blade.php`; usar `Swal.fire(...)` para confirmaciones/modales.

## 7. Convenciones backend (Laravel 12 + PHP 8.5)

### Idioma
- **Rutas** → español (`/empleados`, `/horarios`, `/aplicaciones/formulario`, `/asistencia/resumen`).
- **Controladores** → español + sufijo `Controller` (`EmpleadoController`, `AsistenciaController`, `HorarioController`).
- **Nombres de archivo de página** (en `resources/js/Pages/`) → PascalCase, español o inglés consistente con el nombre del componente Inertia.
- **Modelos** → español si el proyecto lo ha hecho así (`Empleado`, `Horario`, `EmpleadoHijo`); inglés para los generados por Breeze (`User`).
- **Mensajes al usuario** → español (validación, errores, notificaciones).
- **Mensajes de excepción / logs** → español para los que verá el usuario; inglés para los internos es aceptable.

### Controladores
- Un controlador por recurso principal.
- Métodos RESTful en inglés (`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`); métodos específicos en español cuando aplique (`dashboard`, `marcasCompletasDia`).
- Respuesta típica Inertia:
  ```php
  return Inertia::render('Modulo/Pagina', [
      'datos' => $datos,
      'usuarios' => $usuarios,
  ]);
  ```
- Props en **camelCase**.
- Fechas: pasar como instancias de `Carbon` (Inertia las serializa a ISO 8601) o strings ISO; nunca timestamps UNIX crudos.
- Paginación: `->paginate()` con `Inertia::render` + prop `datos` (Laravel detecta Inertia y usa el formato correcto).

### Validación
- Preferir `Form Request` (`php artisan make:request StoreXRequest`).
- Mensajes de validación en español (`__('messages....')` o atributo `messages()`).
- Para casos simples, `validate()` inline en el controlador es aceptable.

### Permisos
- Usar `spatie/laravel-permission`. Definir permisos en español (`'ver empleados'`, `'crear empleado'`, etc.).
- En rutas: `->middleware('permission:ver empleados')`.
- En controladores: `abort_unless($request->user()->can('ver empleados'), 403)` o `$this->authorize('ver empleados')`.
- **NO** reinventar checks con columnas boolean en `users` ni con tablas propias.

### Queries
- Eloquent siempre que sea posible.
- Eager loading con `with()` para evitar N+1.
- Evitar `DB::raw()` salvo necesidad justificada (si se usa, comentar por qué en el código del usuario — pero el agente NO añade comentarios, así que pedirlo al usuario).
- Selects explícitos (`->select(...)`) cuando la tabla tenga muchas columnas y solo se usen algunas.

### Errores
- `abort(403, 'No tiene permisos para realizar esta acción.')` o `back()->withErrors(['error' => '...'])`.
- Para validaciones, redirigir con `back()->withErrors($validator)->withInput()` o usar Form Request.
- Excepciones: dejar que Laravel las maneje con `Handler`; no capturar genéricamente.

### PHP 8.5
- Usar tipos estrictos en firmas: `string`, `?array`, `Carbon`, etc.
- Usar `readonly` para propiedades inmutables, `enum` para estados fijos, `match` para comparaciones múltiples.
- Return types siempre que aplique.
- Null-safety: `?->` chains en cadenas opcionales.

### Estilo
- **No añadir comentarios** (regla global).
- Indentación: 4 espacios (PHP), 4 espacios (JSX/React).
- Strings: comillas simples por defecto; dobles sólo si interpolación.
- Importaciones: ordenadas alfabéticamente dentro de cada grupo.

## 8. Flujo de confirmación obligatoria

Antes de cualquier acción con efecto persistente, el agente debe:

1. **Listar exactamente** lo que va a hacer (comandos, archivos tocados, datos afectados).
2. **Pedir confirmación explícita** con una frase clara: "¿Procedo?" o similar.
3. **Esperar respuesta positiva** del usuario (`sí`, `procede`, `dale`, `ok`, etc.).
4. Sólo entonces ejecutar.

Acciones que SIEMPRE requieren confirmación (no exhaustivo):
- Cualquier comando de `composer` o `npm` que modifique dependencias (`install`, `update`, `require`, `remove`, `add`).
- Modificar archivos de configuración: `.env`, `config/*.php`, `composer.json`, `package.json`.
- Eliminar o renombrar archivos del proyecto.
- `git commit`, `git push`, `git reset`, `git rebase`, `git stash drop`.
- Crear/editar migraciones o seeders.
- Lo enumerado en la sección 5 (todo lo de base de datos).

Acciones que NO requieren confirmación:
- Leer archivos.
- Buscar en el código (grep, glob).
- Sugerir cambios en texto (sin aplicar).
- Responder preguntas sobre el código.
