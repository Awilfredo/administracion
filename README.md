<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Acciones de personal — Comandos Artisan

Módulo de acciones de personal (vacaciones, permisos, incapacidades, renuncias, etc.).
La documentación completa del módulo está en [`ACCIONES_PERSONAL.md`](ACCIONES_PERSONAL.md).

### Flujo de datos

```
SharePoint ──sharepoint:sync-acciones──▶ empleado_acciones ──acciones:sincronizar-asistencia──▶ san.pro_eventos_asistencia.accion_personal
```

### `sharepoint:sync-acciones`

Importa las acciones de personal desde **SharePoint** hacia la tabla `empleado_acciones`
(origen `sharepoint`).

```bash
php artisan sharepoint:sync-acciones
```

| Opción | Descripción | Por defecto |
|---|---|---|
| `--from=Y-m-d` | Fecha desde de la consulta a SharePoint | hace 7 días |
| `--to=Y-m-d` | Fecha hasta de la consulta a SharePoint | hoy + 30 días |
| `--limit=N` | Cantidad máxima de items por request | `100` |
| `--dry-run` | Solo loguea, no escribe en la base de datos | — |

```bash
# Simular sin escribir nada
php artisan sharepoint:sync-acciones --dry-run

# Reprocesar un rango específico
php artisan sharepoint:sync-acciones --from=2026-10-01 --to=2026-10-31 --limit=200
```

### `acciones:sincronizar-asistencia`

Marca el campo `accion_personal` en `san.pro_eventos_asistencia` con el tipo de acción
que justifica cada evento de **Ausencia**, **Tarde** o **Salida antes**.
Solo procesa las acciones aprobadas que **cubren la fecha objetivo**
(`COALESCE(fecha_fin, fecha_inicio)` — una acción sin `fecha_fin` dura un solo día).

```bash
php artisan acciones:sincronizar-asistencia
```

| Opción | Descripción | Por defecto |
|---|---|---|
| `--fecha=YYYY-MM-DD` | Fecha objetivo | hoy |
| `--empleado=ANACOD` | Filtra por un empleado concreto | — |
| `--dry-run` | Solo muestra lo que haría, sin escribir | — |

```bash
# Simular sin escribir nada
php artisan acciones:sincronizar-asistencia --dry-run

# Sincronizar una fecha puntual
php artisan acciones:sincronizar-asistencia --fecha=2026-10-23

# Sincronizar solo a un empleado
php artisan acciones:sincronizar-asistencia --empleado=AAYALA
```

### Programación automática (scheduler)

Ambos comandos ya están programados en [`routes/console.php`](routes/console.php) con
`->everyFifteenMinutes()`, `->withoutOverlapping()`, `->runInBackground()` y `->onOneServer()`.

Verificar qué está programado:

```bash
php artisan schedule:list
```

### Ejecutarlos con crontab (cada media hora)

Hay dos alternativas. **Usar solo una**, si no los comandos se ejecutarán dos veces
(una por el scheduler y otra por cron).

#### Opción A — Delegar en el scheduler de Laravel (recomendado)

Una sola línea de cron (cada minuto); el scheduler decide qué corre y con qué frecuencia:

```cron
* * * * * cd /home/wilfredo/progra/administracion && /usr/bin/php artisan schedule:run >> /dev/null 2>&1
```

#### Opción B — Invocar los comandos directamente (cada 30 minutos)

Si se prefiere no depender del scheduler, hay que **comentar los bloques
`Schedule::command(...)` de `routes/console.php`** (para no duplicar la ejecución)
y agregar al crontab del usuario (`crontab -e`):

```cron
# SharePoint → empleado_acciones (minuto 0 y 30 de cada hora)
0,30 * * * * cd /home/wilfredo/progra/administracion && /usr/bin/php artisan sharepoint:sync-acciones >> /dev/null 2>&1

# empleado_acciones → san.pro_eventos_asistencia (minuto 0 y 30 de cada hora)
0,30 * * * * cd /home/wilfredo/progra/administracion && /usr/bin/php artisan acciones:sincronizar-asistencia >> /dev/null 2>&1
```

Notas:
- `cd` hacia la raíz del proyecto es obligatorio para que Laravel encuentre `.env` y `bootstrap/`.
- Usar la ruta absoluta de PHP (`/usr/bin/php`) evita fallos cuando cron no carga el `PATH` del usuario.
- `>> /dev/null 2>&1` evita que cron envíe correo con la salida; para depurar, cambiar a
  `>> /home/wilfredo/progra/administracion/storage/logs/cron.log 2>&1`.
- Conviene separar los minutos para no golpear SharePoint y la BD `san` en el mismo instante:
  `5,35 * * * *` para SharePoint y `0,30 * * * *` para la sincronización de asistencia.

#### Verificar que quedó instalado

```bash
crontab -l                 # listar las tareas
sudo crontab -l -u wilfredo
tail -f storage/logs/laravel.log   # revisar el log de las ejecuciones
```

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
