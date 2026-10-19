<?php

namespace App\Http\Controllers;

use App\Exceptions\PresupuestosApiException;
use App\Mail\ControlRegistrationConfirmation;
use App\Mail\PresupuestosUserCreatedNotification;
use App\Mail\UserRegistrationConfirmation;
use Illuminate\Support\Facades\Validator;
use App\Models\Empleado;
use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAprobadorTemporal;
use App\Models\EmpleadoPresupuesto;
use App\Models\Horario;
use App\Models\Hiring;
use App\Models\UsuarioRedControl;
use App\Services\PresupuestosApiClient;
use DateTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Models\DatosEmpleado;
use Illuminate\Pagination\LengthAwarePaginator;

class EmpleadoController extends Controller {
    private const INDEX_COLUMNS = [
        'anacod', 'ananam', 'anasta', 'anapai',
        'anamai', 'anatel', 'anaimg', 'horario', 'freelance',
    ];

    private function getBaseEmpleados(): \Illuminate\Support\Collection {
        $rows = Empleado::empleados();
        return Empleado::hydrate(array_map(fn($r) => (array) $r, $rows));
    }

    private function filtrarModelos(\Illuminate\Support\Collection $modelos, Request $request): \Illuminate\Support\Collection {
        $fActivos   = $request->has('activos') ? $request->boolean('activos') : true;
        $fInactivos = $request->has('inactivos') ? $request->boolean('inactivos') : false;
        $fSv        = $request->has('sv') ? $request->boolean('sv') : true;
        $fGt        = $request->has('gt') ? $request->boolean('gt') : true;
        $q          = trim((string) $request->query('q', ''));

        if ($fActivos && ! $fInactivos) {
            $modelos = $modelos->where('anasta', 'A');
        } elseif ($fInactivos && ! $fActivos) {
            $modelos = $modelos->where('anasta', 'I');
        } elseif (! $fActivos && ! $fInactivos) {
            $modelos = collect();
        }

        $paises = [];
        if ($fSv) $paises[] = 'SV';
        if ($fGt) $paises[] = 'GT';
        if (! empty($paises)) {
            $modelos = $modelos->whereIn('anapai', $paises);
        } elseif (! $fSv && ! $fGt) {
            $modelos = collect();
        }

        if ($q !== '') {
            $qLower = mb_strtolower($q);
            $modelos = $modelos->filter(function ($e) use ($qLower) {
                return str_contains(mb_strtolower((string) $e->anacod), $qLower)
                    || str_contains(mb_strtolower((string) $e->ananam), $qLower)
                    || str_contains(mb_strtolower((string) $e->anamai), $qLower)
                    || str_contains(mb_strtolower((string) $e->anatel), $qLower);
            });
        }

        return $modelos;
    }

    public function index(Request $request) {
        $fActivos   = $request->has('activos') ? $request->boolean('activos') : true;
        $fInactivos = $request->has('inactivos') ? $request->boolean('inactivos') : false;
        $fSv        = $request->has('sv') ? $request->boolean('sv') : true;
        $fGt        = $request->has('gt') ? $request->boolean('gt') : true;
        $q          = trim((string) $request->query('q', ''));

        $modelos = $this->filtrarModelos($this->getBaseEmpleados(), $request);

        $page    = max(1, (int) $request->query('page', 1));
        $perPage = (int) $request->query('per_page', 25);
        $perPage = max(10, min(100, $perPage));
        $total   = $modelos->count();

        $items = $modelos->forPage($page, $perPage)->map(function ($e) {
            return [
                'anacod'    => $e->anacod,
                'ananam'    => $e->ananam,
                'anasta'    => $e->anasta,
                'anapai'    => $e->anapai,
                'anamai'    => $e->anamai,
                'anatel'    => $e->anatel,
                'anaimg'    => $e->anaimg,
                'horario'   => $e->horario,
                'freelance' => (bool) ($e->freelance ?? false),
            ];
        })->values();

        $paginator = new LengthAwarePaginator(
            $items, $total, $perPage, $page,
            [
                'path'  => route('empleados.index'),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('Empleados/Index', [
            'empleados' => $paginator,
            'filters' => [
                'activos'   => $fActivos,
                'inactivos' => $fInactivos,
                'sv'        => $fSv,
                'gt'        => $fGt,
            ],
            'q' => $q,
        ]);
    }

    public function export(Request $request) {
        $modelos = $this->filtrarModelos($this->getBaseEmpleados(), $request);
        $anacods = $modelos->pluck('anacod');
        if ($anacods->isNotEmpty()) {
            $datosByAnacod = DatosEmpleado::with('hijos')
                ->whereIn('anacod', $anacods)
                ->get()
                ->keyBy('anacod');
            foreach ($modelos as $m) {
                $m->setRelation('datos', $datosByAnacod->get($m->anacod));
            }
        }

        $data = $modelos->map(function ($e) {
            $d = $e->datos;
            return [
                'anacod'           => $e->anacod,
                'ananam'           => $e->ananam,
                'anapai'           => $e->anapai,
                'anamai'           => $e->anamai,
                'anarea'           => $e->anarea,
                'anajef'           => $e->anajef,
                'anapos'           => $e->anapos,
                'anatel'           => $e->anatel,
                'anasta'           => $e->anasta,
                'fecha_ingreso'    => $e->fecha_ingreso,
                'freelance'        => (bool) ($e->freelance ?? false),
                'fecha_nacimiento' => $d?->fecha_nacimiento,
                'afp'              => $d?->afp,
                'cc'               => $d?->cc,
                'cel_personal'     => $d?->cel_personal,
                'direccion'        => $d?->direccion,
                'dui'              => $d?->dui,
                'genero'           => $d?->genero,
                'hijos'            => $d?->hijos?->count() ?? 0,
                'nombre_hijos'     => $d?->hijos?->map(fn($h) => "{$h->fecha_nacimiento} - {$h->nombre}")->join(', '),
                'imei'             => $d?->imei,
                'isss'             => $d?->isss,
                'nit'              => $d?->nit,
                'padre'            => $d?->padre,
                'madre'            => $d?->madre,
                'simcard'          => $d?->simcard,
                'tel_casa'         => $d?->tel_casa,
                'tipo_afp'         => $d?->tipo_afp,
            ];
        })->values();

        return response()->json(['data' => $data]);
    }

    public function create() {
        $anacods = Empleado::pluck( 'anacod' );
        $horarios = Horario::all();
        $jefes = Empleado::jefes();
        $areas = Empleado::areas();
        $posiciones = Empleado::posiciones();

        list($presupuestosCentrosCosto, $presupuestosCuentas, $presupuestosWarning) = $this->loadPresupuestosCatalogs();

        return Inertia::render( 'Empleados/Create', [
            'anacods' => $anacods,
            'jefes' => $jefes,
            'areas' => $areas,
            'posiciones' => $posiciones,
            'horarios' => $horarios,
            'presupuestosCentrosCosto' => $presupuestosCentrosCosto,
            'presupuestosCuentas' => $presupuestosCuentas,
            'presupuestosWarning' => $presupuestosWarning,
        ] );
    }

    protected function loadPresupuestosCatalogs(): array {
        $centrosCosto = collect();
        $cuentas = collect();
        $warning = null;

        try {
            $client = app( PresupuestosApiClient::class );
            if ( $client->isConfigured() ) {
                $centrosCosto = $client->listCentrosCosto();
                $cuentas = $client->listCuentas();
            } else {
                $warning = 'La integración con Presupuestos no está configurada.';
            }
        } catch ( PresupuestosApiException $e ) {
            $warning = 'No se pudieron cargar los catálogos de Presupuestos: ' . $e->getMessage();
            Log::warning( 'Presupuestos: fallo al cargar catálogos en create()', [ 'error' => $e->getMessage() ] );
        } catch ( \Throwable $e ) {
            $warning = 'No se pudieron cargar los catálogos de Presupuestos.';
            Log::warning( 'Presupuestos: fallo inesperado al cargar catálogos en create()', [ 'error' => $e->getMessage() ] );
        }

        return [ $centrosCosto, $cuentas, $warning ];
    }

    public function show( $anacod ) {
        $empleado = Empleado::where( 'anacod', $anacod )->first();
        $anacods = Empleado::pluck( 'anacod' );
        $horarios = Horario::all();
        $jefes = Empleado::jefes();
        $areas = Empleado::areas();
        $posiciones = Empleado::posiciones();
        $redControl = UsuarioRedControl::where( 'email', $empleado->anamai )->where( 'empresa', 1 )->first();
        $mensajeria = UsuarioRedControl::where( 'email', $empleado->anamai )->where( 'empresa', ( $empleado->anapai === 'SV' ) ? 26 : 32 )->first();
        $presupuesto = EmpleadoPresupuesto::find( $anacod );

        list($presupuestosCentrosCosto, $presupuestosCuentas, $presupuestosWarning) = $this->loadPresupuestosCatalogs();

        $presupuestoRemote = null;
        $presupuestoRemoteError = null;
        $presupuestoRemoteChecked = true;
        $email = $empleado->anamai ?? null;
        if ( $email ) {
            try {
                $presupuestoRemote = app( PresupuestosApiClient::class )->findUserByEmail( (string) $email );
            } catch ( \Throwable $e ) {
                $presupuestoRemoteError = $e->getMessage();
                Log::warning( 'Presupuestos: fallo en by-email (show)', [
                    'anacod' => $anacod,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ] );
            }
        } else {
            $presupuestoRemoteError = 'El empleado no tiene email configurado.';
        }

        return Inertia::render( 'Empleados/Show', [
            'empleado' => $empleado,
            'anacods' => $anacods,
            'jefes' => $jefes,
            'areas' => $areas,
            'posiciones' => $posiciones,
            'horarios' => $horarios,
            'redControl' => $redControl,
            'mensajeria' => $mensajeria,
            'presupuesto' => $presupuesto,
            'presupuestoRemote' => $presupuestoRemote,
            'presupuestoRemoteChecked' => $presupuestoRemoteChecked,
            'presupuestoRemoteError' => $presupuestoRemoteError,
            'presupuestosCentrosCosto' => $presupuestosCentrosCosto,
            'presupuestosCuentas' => $presupuestosCuentas,
            'presupuestosWarning' => $presupuestosWarning,
            'ultimasAcciones' => EmpleadoAccion::with('tipo')
                ->where('anacod', $anacod)
                ->orderByDesc('fecha_inicio')
                ->orderByDesc('id')
                ->limit(3)
                ->get(),
            'aprobadoresTemporales' => EmpleadoAprobadorTemporal::where('anacod_origen', $anacod)
                ->orderByDesc('id')
                ->limit(10)
                ->get()
                ->map(function ($row) {
                    return [
                        'id' => (int) $row->id,
                        'temp_user_id' => (int) $row->temp_user_id,
                        'temp_user_email' => $row->temp_user_email,
                        'fecha_desde' => optional($row->fecha_desde)->toDateString(),
                        'fecha_hasta' => optional($row->fecha_hasta)->toDateString(),
                        'cc_cuentas' => $row->cc_cuentas,
                        'sync_status' => $row->sync_status,
                        'last_error' => $row->last_error,
                        'created_at' => optional($row->created_at)->toIso8601String(),
                    ];
                }),
        ] );
        //return json_encode( $empleado );
    }

    public function baja( Request $request ) {
        $request->validate( [
            'anacod' => 'required|string',
            'fechaBaja' => 'required|date'
        ] );

        $empleado = Empleado::where( 'anacod', $request->anacod )->first();

        if ( !$empleado ) {
            return response()->json( [ 'message' => 'Empleado no encontrado' ], 404 );
        }
        $empleado->anasta = 'I';
        $empleado->fecha_baja = $request->fechaBaja;
        $redControl = UsuarioRedControl::where( 'email', $empleado->anamai )->where( 'empresa', 1 )->first();
        $mensajeria = UsuarioRedControl::where( 'email', $empleado->anamai )->where( 'empresa', ( $empleado->anapai === 'SV' ) ? 26 : 32 )->first();
        $empleado->save();
        if ( $redControl ) {
            $redControl->estado = 1;
            $redControl->save();
        }
        if ( $mensajeria ) {
            $mensajeria->estado = 1;
            $mensajeria->save();
        }

        $this->deactivatePresupuestoUser( $empleado );

        return redirect()->route( 'empleados.index' );
    }

    protected function deactivatePresupuestoUser( Empleado $empleado ): void {
        try {
            $client = app( PresupuestosApiClient::class );
            if ( ! $client->isConfigured() ) {
                Log::warning( 'Presupuestos: cliente no configurado, no se desactivó al usuario en Red', [
                    'anacod' => $empleado->anacod,
                ] );
                return;
            }

            $presupuesto = EmpleadoPresupuesto::find( $empleado->anacod );
            $remoteId = $presupuesto?->presupuestos_user_id;
            $source = $remoteId ? 'local' : null;

            if ( ! $remoteId ) {
                $email = $empleado->anamai ?? null;
                if ( ! $email ) {
                    Log::info( 'Presupuestos: baja local sin email, nada que desactivar en Red', [
                        'anacod' => $empleado->anacod,
                    ] );
                    return;
                }
                $remote = $client->findUserByEmail( $email );
                if ( ! $remote || ! isset( $remote['id'] ) ) {
                    Log::info( 'Presupuestos: baja local sin usuario en Red vinculado', [
                        'anacod' => $empleado->anacod,
                        'email' => $email,
                    ] );
                    return;
                }
                $remoteId = (int) $remote['id'];
                $source = 'by_email';
            }

            $client->deleteUser( $remoteId );

            EmpleadoPresupuesto::updateOrCreate(
                [ 'anacod' => $empleado->anacod ],
                [
                    'presupuestos_user_id' => $remoteId,
                    'sync_status' => 'ok',
                    'last_error' => null,
                    'last_synced_at' => now(),
                ]
            );

            Log::info( 'Presupuestos: usuario desactivado por baja', [
                'anacod' => $empleado->anacod,
                'presupuestos_user_id' => $remoteId,
                'source' => $source,
            ] );
        } catch ( \Throwable $e ) {
            Log::warning( 'Presupuestos: no se pudo desactivar al usuario en Red durante baja', [
                'anacod' => $empleado->anacod,
                'error' => $e->getMessage(),
            ] );
        }
    }

    public function store( Request $request ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string|max:50',
            'ananam' => 'required|string|max:255',
            'anapai' => 'required|string|max:2',
            'anamai' => 'required|email|max:255',
            'anasta' => 'nullable|string|max:1',
            'anatel' => 'nullable|string|max:20',
            'anarea' => 'required|string|max:3',
            'anarad' => 'nullable|string|max:50',
            'anajef' => 'required|string|max:50',
            'folcod' => 'nullable|integer',
            'folcodreal' => 'nullable|integer',
            'anaext' => 'nullable|string|max:10',
            'anapos' => 'required|string|max:50',
            'anames' => 'nullable|integer',
            'anadia' => 'nullable|integer',
            'fecha_ingreso' => 'nullable|date',
            'horario_id' => 'required|integer',
            'isBoss' => 'required|boolean',
            'lider_area' => 'required|string|max:50',
            'anaimg' => 'nullable|string|max:255',
            'crear_en_presupuestos' => 'sometimes|boolean',
            'presupuestos_cc_cuentas' => 'required_if:crear_en_presupuestos,true|array|min:1',
            'presupuestos_cc_cuentas.*.centro_costo_id' => 'required_if:crear_en_presupuestos,true|integer',
            'presupuestos_cc_cuentas.*.cuenta_id' => 'required_if:crear_en_presupuestos,true|integer',
            'presupuestos_cc_cuentas.*.is_aprobador' => 'sometimes|boolean',
            'presupuestos_cc_cuentas.*.aprobador_temporal' => 'sometimes|boolean',
            'presupuestos_cc_cuentas.*.vigente_hasta' => 'nullable|date|after_or_equal:today',
        ] );
        // Crear un nuevo registro
        $crearEnPresupuestos = $request->boolean( 'crear_en_presupuestos' );
        $ccCuentasFromRequest = $validatedData['presupuestos_cc_cuentas'] ?? [];

        //dd($request->all());

        Log::info( 'Presupuestos: store() reached', [
            'anacod' => $validatedData['anacod'] ?? null,
            'crear_en_presupuestos' => $crearEnPresupuestos,
            'cc_cuentas_count' => count( $ccCuentasFromRequest ),
            'cc_cuentas_sample' => array_slice( $ccCuentasFromRequest, 0, 3 ),
        ] );

        $empleado = Empleado::create( collect( $validatedData )->except( [
            'crear_en_presupuestos', 'presupuestos_cc_cuentas',
        ] )->all() );

        Log::info( 'Presupuestos: Empleado creado localmente OK', [
            'anacod' => $empleado->anacod,
        ] );

        if ( $crearEnPresupuestos ) {
            Log::info( 'Presupuestos: invocando syncPresupuestoCreate', [
                'anacod' => $empleado->anacod,
                'cc_cuentas_count' => count( $ccCuentasFromRequest ),
            ] );
            $this->syncPresupuestoCreate( $empleado, $ccCuentasFromRequest );
        } else {
            Log::info( 'Presupuestos: crear_en_presupuestos=false, se omite creación en Presupuestos', [
                'anacod' => $empleado->anacod,
            ] );
        }
        
        try {
            $empleado->asignarRolesSan( $request );
            $empleado->asignarReportes( $request );
            $empleado->asignarSuplementarios( $request );
        } catch ( \Exception $e ) {
            Log::error( 'Error al asignar roles, reportes o suplementarios: ' . $e->getMessage() );
        }

        //Redirect user
        try {
            $recipients = [ 'it-global@red.com.sv', 'aayala@red.com.sv' ];
            Mail::to( $recipients )->send( new UserRegistrationConfirmation( $empleado->ananam, $empleado->anacod, $empleado->anamai, $empleado->anapas ) );
        } catch ( \Exception $e ) {
            Log::error( 'Error al enviar correo de confirmación: ' . $e->getMessage() );
        }


        return Redirect::route( 'empleados.show', [ $empleado->anacod ] );
    }

    protected function syncPresupuestoCreate( Empleado $empleado, array $ccCuentas, ?EmpleadoPresupuesto $existing = null ): EmpleadoPresupuesto {
        Log::info( 'Presupuestos: syncPresupuestoCreate start', [
            'anacod' => $empleado->anacod,
            'cc_cuentas_count' => count( $ccCuentas ),
        ] );

        $client = app( PresupuestosApiClient::class );
        $password = Str::random( 12 );

        if ( ! $client->isConfigured() ) {
            Log::warning( 'Presupuestos: cliente no configurado, registrando error', [
                'anacod' => $empleado->anacod,
                'base_url' => config( 'services.presupuestos.base_url' ),
                'has_token' => !empty( config( 'services.presupuestos.token' ) ),
            ] );
            return tap( EmpleadoPresupuesto::updateOrCreate(
                [ 'anacod' => $empleado->anacod ],
                [
                    'presupuestos_user_id' => null,
                    'sync_status' => 'error',
                    'last_error' => 'La API de Presupuestos no está configurada.',
                    'last_password' => null,
                    'cc_cuentas' => $ccCuentas,
                    'last_synced_at' => now(),
                ]
            ), function () {} );
        }

        $payload = [
            'name' => (string) $empleado->ananam,
            'email' => (string) $empleado->anamai,
            'code' => (string) $empleado->anacod,
            'password' => $password,
            'password_confirmation' => $password,
            'is_active' => true,
            'cc_cuentas' => $this->normalizeCcCuentasForApi( array_values( $ccCuentas ) ),
        ];

        Log::info( 'Presupuestos: a punto de llamar createUser', [
            'anacod' => $empleado->anacod,
            'url' => $client->getBaseUrl() . '/api/' . $client->getTenant() . '/users',
            'payload_keys' => array_keys( $payload ),
            'cc_cuentas_count' => count( $payload['cc_cuentas'] ),
        ] );

        try {
            $result = $client->createUser( $payload );
            $remoteId = isset( $result['id'] ) ? (int) $result['id'] : null;

            $wasFirstCreation = ! $existing || ! $existing->presupuestos_user_id;

            $row = EmpleadoPresupuesto::updateOrCreate(
                [ 'anacod' => $empleado->anacod ],
                [
                    'presupuestos_user_id' => $remoteId,
                    'sync_status' => 'ok',
                    'last_error' => null,
                    'last_password' => $password,
                    'cc_cuentas' => $ccCuentas,
                    'last_synced_at' => now(),
                ]
            );

            if ( $wasFirstCreation && $remoteId ) {
                $this->notifyPresupuestoUserCreated( $empleado, $password );
            }

            return $row;
        } catch ( PresupuestosApiException $e ) {
            Log::warning( 'Presupuestos: createUser falló', [
                'anacod' => $empleado->anacod,
                'status' => $e->statusCode,
                'message' => $e->getMessage(),
            ] );
            return EmpleadoPresupuesto::updateOrCreate(
                [ 'anacod' => $empleado->anacod ],
                [
                    'presupuestos_user_id' => null,
                    'sync_status' => 'error',
                    'last_error' => $this->summarizePresupuestoError( $e ),
                    'last_password' => $password,
                    'cc_cuentas' => $ccCuentas,
                    'last_synced_at' => now(),
                ]
            );
        } catch ( \Throwable $e ) {
            Log::error( 'Presupuestos: error inesperado en createUser', [
                'anacod' => $empleado->anacod,
                'error' => $e->getMessage(),
            ] );
            return EmpleadoPresupuesto::updateOrCreate(
                [ 'anacod' => $empleado->anacod ],
                [
                    'presupuestos_user_id' => null,
                    'sync_status' => 'error',
                    'last_error' => $e->getMessage(),
                    'last_password' => $password,
                    'cc_cuentas' => $ccCuentas,
                    'last_synced_at' => now(),
                ]
            );
        }
    }

    protected function summarizePresupuestoError( PresupuestosApiException $e ): string {
        $msg = $e->getMessage();
        if ( ! empty( $e->apiErrors ) ) {
            $firstField = array_key_first( $e->apiErrors );
            $firstMessages = $e->apiErrors[$firstField] ?? [];
            $firstMessage = is_array( $firstMessages ) ? ( $firstMessages[0] ?? '' ) : (string) $firstMessages;
            if ( $firstMessage !== '' ) {
                $msg .= " [{$firstField}: {$firstMessage}]";
            }
        }
        return $msg;
    }

    protected function normalizeCcCuentasForApi( array $rows ): array {
        return array_map( function ( $row ) {
            $temporal = (bool) ( $row['aprobador_temporal'] ?? false );
            $vigenteHasta = $row['vigente_hasta'] ?? null;
            $vigenteDesde = null;

            if ( $temporal && $vigenteHasta ) {
                try {
                    $vigenteDesde = \Carbon\Carbon::now()->toIso8601String();
                    $vigenteHasta = \Carbon\Carbon::parse( $vigenteHasta )->endOfDay()->toIso8601String();
                } catch ( \Throwable $e ) {
                    $vigenteDesde = null;
                    $vigenteHasta = null;
                }
            } else {
                $vigenteHasta = null;
            }

            return [
                'centro_costo_id' => (int) ( $row['centro_costo_id'] ?? 0 ),
                'cuenta_id'       => (int) ( $row['cuenta_id'] ?? 0 ),
                'is_aprobador'    => (bool) ( $row['is_aprobador'] ?? false ),
                'vigente_desde'   => $vigenteDesde,
                'vigente_hasta'   => $vigenteHasta,
            ];
        }, $rows );
    }

    protected function notifyPresupuestoUserCreated( Empleado $empleado, string $password ): void {
        try {
            $recipients = array_values( array_filter( [ $empleado->anamai, 'it-global@red.com.sv' ] ) );
            if ( empty( $recipients ) ) {
                return;
            }
            Mail::to( $recipients )->send( new PresupuestosUserCreatedNotification(
                (string) $empleado->ananam,
                (string) $empleado->anamai,
                $password,
                (string) $empleado->anacod,
            ) );
            Log::info( 'Presupuestos: email de notificación enviado', [
                'anacod' => $empleado->anacod,
                'recipients' => $recipients,
            ] );
        } catch ( \Throwable $e ) {
            Log::warning( 'Presupuestos: fallo al enviar email de notificación', [
                'anacod' => $empleado->anacod,
                'error' => $e->getMessage(),
            ] );
        }
    }

    protected function syncPresupuestoUpdate( Empleado $empleado, EmpleadoPresupuesto $presupuesto, array $ccCuentas ): void {
        $client = app( PresupuestosApiClient::class );
        if ( ! $client->isConfigured() || ! $presupuesto->presupuesto_user_id ) {
            return;
        }

        $payload = [
            'name' => (string) $empleado->ananam,
            'email' => (string) $empleado->anamai,
            'code' => (string) $empleado->anacod,
            'cc_cuentas' => $this->normalizeCcCuentasForApi( array_values( $ccCuentas ) ),
        ];

        try {
            $client->updateUser( $presupuesto->presupuestos_user_id, $payload );
            $presupuesto->update( [
                'sync_status' => 'ok',
                'last_error' => null,
                'cc_cuentas' => $ccCuentas,
                'last_synced_at' => now(),
            ] );
        } catch ( PresupuestosApiException $e ) {
            $presupuesto->update( [
                'sync_status' => 'error',
                'last_error' => $this->summarizePresupuestoError( $e ),
                'cc_cuentas' => $ccCuentas,
                'last_synced_at' => now(),
            ] );
            Log::warning( 'Presupuestos: updateUser falló', [
                'anacod' => $empleado->anacod,
                'status' => $e->statusCode,
                'message' => $e->getMessage(),
            ] );
        } catch ( \Throwable $e ) {
            $presupuesto->update( [
                'sync_status' => 'error',
                'last_error' => $e->getMessage(),
                'cc_cuentas' => $ccCuentas,
                'last_synced_at' => now(),
            ] );
            Log::error( 'Presupuestos: error inesperado en updateUser', [
                'anacod' => $empleado->anacod,
                'error' => $e->getMessage(),
            ] );
        }
    }

    public function saveSan( $request, $empleado ) {
        $request->validate( [
            'anacod' => 'required|string|max:255',
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'anamai' => 'required|string|max:255',
            'fecha_nacimiento' => 'required|string|max:255',
            'anapai' => 'required|string|max:255',
            'fecha_ingreso' => 'required|string|max:255',
            'anapos' => 'required|string|max:255',
            'anarea' => 'required|string|max:255',
            'anajef' => 'required|string|max:255',
            'lider_area' => 'required|string|max:255',
            'horario_id' => 'required|string|max:255',
            'freelance' => 'required|boolean',
        ] );
        $empleado->anacod = $request->anacod;
        $empleado->ananam = $request->nombres . ' ' . $request->apellidos;
        $empleado->anamai = $request->anamai;
        $empleado->anasta = 'A';
        $empleado->anapai = $request->anapai;
        $empleado-> anajef = $request->anajef;
        $empleado->lider_area = $request->lider_area;
        $empleado->anarea = $request->anarea;
        $empleado->folcod = $request->folcod ? $request->folcod : null;
        $empleado->anaext = $request->anaext ? $request->anaext : null;
        $empleado->folcodreal = $request->folcodreal ? $request->folcodreal : null;
        $empleado->anatip = 'U';
        $empleado->anapos = $request->anapos;
        $empleado->anasuc = 1;
        $empleado->freelance = isset($request->freelance) ? $request->freelance : false;
        if ( $request->fecha_nacimiento ) {
            $fechaNacimiento = new DateTime( $request->fecha_nacimiento );
            $empleado->anames = $fechaNacimiento->format( 'm' );
            $empleado->anadia = $fechaNacimiento->format( 'd' );
        }
        $empleado->telreg = '503';
        $empleado->teltip = 'ISSABEL';
        $empleado->fecha_ingreso = $request->fecha_ingreso;
        $empleado->horario_id = $request->horario_id;
        $empleado->save();
        return $empleado;
    }

    public function update( Request $request, $anacod ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string|max:50',
            'ananam' => 'required|string|max:255',
            'anapai' => 'required|string|max:2',
            'anamai' => 'required|email|max:255',
            'anatel' => 'nullable|string|max:20',
            'anarea' => 'required|string|max:50',
            'anarad' => 'nullable|string|max:50',
            'anajef' => 'required|string|max:50',
            'folcod' => 'nullable|integer',
            'folcodreal' => 'nullable|integer',
            'anaext' => 'nullable|string|max:10',
            'anapos' => 'required|string|max:50',
            'anames' => 'nullable|integer',
            'anadia' => 'nullable|integer',
            'fecha_ingreso' => 'nullable|date',
            'horario_id' => 'required|integer',
            'lider_area' => 'required|string|max:50',
            'presupuestos_cc_cuentas' => 'sometimes|array',
            'presupuestos_cc_cuentas.*.centro_costo_id' => 'required_with:presupuestos_cc_cuentas|integer',
            'presupuestos_cc_cuentas.*.cuenta_id' => 'required_with:presupuestos_cc_cuentas|integer',
            'presupuestos_cc_cuentas.*.is_aprobador' => 'sometimes|boolean',
            'presupuestos_cc_cuentas.*.aprobador_temporal' => 'sometimes|boolean',
            'presupuestos_cc_cuentas.*.vigente_hasta' => 'nullable|date|after_or_equal:today',
        ] );

        $empleado = Empleado::find( $anacod );
        $empleado->anacod = $request->anacod;
        $empleado->ananam = $request->ananam;
        $empleado->anapai = $request->anapai;
        $empleado->anamai = $request->anamai;
        $empleado->anatel = $request->anatel;
        $empleado->anarea = $request->anarea;
        $empleado->anarad = $request->anarad;
        $empleado->anajef = $request->anajef;
        $empleado->folcod = $request->folcod;
        $empleado->folcodreal = $request->folcodreal;
        $empleado->anaext = $request->anaext;
        $empleado->anapos = $request->anapos;
        $empleado->anames = $request->anames;
        $empleado->anadia = $request->anadia;
        $empleado->fecha_ingreso = $request->fecha_ingreso;
        $empleado->horario_id = $request->horario_id;
        $empleado->lider_area = $request->lider_area;
        $empleado->freelance = isset($request->freelance) ? $request->freelance : false;
        $empleado->save();

        $presupuesto = EmpleadoPresupuesto::find( $empleado->anacod );
        if ( $presupuesto && $presupuesto->presupuestos_user_id && $request->has( 'presupuestos_cc_cuentas' ) ) {
            $ccCuentas = $request->input( 'presupuestos_cc_cuentas', [] );
            $this->syncPresupuestoUpdate( $empleado, $presupuesto, $ccCuentas );
        }

        return Redirect::route( 'empleados.show', [ $empleado->anacod ] );
    }

    public function retryPresupuesto( Request $request, $anacod ) {
        $empleado = Empleado::where( 'anacod', $anacod )->first();
        if ( ! $empleado ) {
            abort( 404 );
        }

        $presupuesto = EmpleadoPresupuesto::find( $anacod );

        if ( $presupuesto && $presupuesto->presupuestos_user_id ) {
            return back()->withErrors( [ 'presupuesto' => 'El usuario ya fue creado en Presupuestos (id ' . $presupuesto->presupuestos_user_id . '). Use la edición para actualizar las asignaciones.' ] );
        }

        if ( $presupuesto && $presupuesto->hasEmailConflict() ) {
            return back()->withErrors( [ 'presupuesto' => 'Conflicto de email en Presupuestos (ya existe un usuario con ese email). Contacte al administrador para reasignar.' ] );
        }

        $validated = $request->validate( [
            'presupuestos_cc_cuentas' => 'required|array|min:1',
            'presupuestos_cc_cuentas.*.centro_costo_id' => 'required|integer',
            'presupuestos_cc_cuentas.*.cuenta_id' => 'required|integer',
            'presupuestos_cc_cuentas.*.is_aprobador' => 'sometimes|boolean',
            'presupuestos_cc_cuentas.*.aprobador_temporal' => 'sometimes|boolean',
            'presupuestos_cc_cuentas.*.vigente_hasta' => 'nullable|date|after_or_equal:today',
        ] );

        $this->syncPresupuestoCreate( $empleado, $validated['presupuestos_cc_cuentas'], $presupuesto );

        $msg = $presupuesto ? 'Reintento de creación enviado a Presupuestos.' : 'Usuario creado en Presupuestos.';
        return back()->with( 'success', $msg );
    }

    public function presupuesto( $anacod ) {
        $empleado = Empleado::where( 'anacod', $anacod )->first();
        if ( ! $empleado ) {
            abort( 404 );
        }

        $presupuesto = EmpleadoPresupuesto::find( $anacod );

        list($presupuestosCentrosCosto, $presupuestosCuentas, $presupuestosWarning) = $this->loadPresupuestosCatalogs();

        $presupuestoRemote = null;
        $presupuestoRemoteError = null;
        $presupuestoRemoteChecked = true;
        $email = $empleado->anamai ?? null;
        if ( $email ) {
            try {
                $presupuestoRemote = app( PresupuestosApiClient::class )->findUserByEmail( (string) $email );
            } catch ( \Throwable $e ) {
                $presupuestoRemoteError = $e->getMessage();
                Log::warning( 'Presupuestos: fallo en by-email (presupuesto)', [
                    'anacod' => $anacod,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ] );
            }
        } else {
            $presupuestoRemoteError = 'El empleado no tiene email configurado.';
        }

        return Inertia::render( 'Empleados/Presupuesto', [
            'empleado' => $empleado,
            'presupuesto' => $presupuesto,
            'presupuestoRemote' => $presupuestoRemote,
            'presupuestoRemoteChecked' => $presupuestoRemoteChecked,
            'presupuestoRemoteError' => $presupuestoRemoteError,
            'presupuestosCentrosCosto' => $presupuestosCentrosCosto,
            'presupuestosCuentas' => $presupuestosCuentas,
            'presupuestosWarning' => $presupuestosWarning,
        ] );
    }

    public function linkPresupuesto( Request $request, $anacod ) {
        $empleado = Empleado::where( 'anacod', $anacod )->first();
        if ( ! $empleado ) {
            abort( 404 );
        }

        $presupuesto = EmpleadoPresupuesto::find( $anacod );
        if ( $presupuesto && $presupuesto->presupuestos_user_id ) {
            return back()->withErrors( [ 'presupuesto' => 'Este empleado ya está vinculado a un usuario de Presupuestos (id ' . $presupuesto->presupuestos_user_id . ').' ] );
        }

        $email = $empleado->anamai ?? null;
        if ( ! $email ) {
            return back()->withErrors( [ 'presupuesto' => 'El empleado no tiene email configurado.' ] );
        }

        $client = app( PresupuestosApiClient::class );
        if ( ! $client->isConfigured() ) {
            return back()->withErrors( [ 'presupuesto' => 'La API de Presupuestos no está configurada.' ] );
        }

        try {
            $remote = $client->findUserByEmail( (string) $email );
        } catch ( \Throwable $e ) {
            Log::error( 'Presupuestos: error en linkPresupuesto findUserByEmail', [
                'anacod' => $anacod,
                'email' => $email,
                'error' => $e->getMessage(),
            ] );
            return back()->withErrors( [ 'presupuesto' => 'No se pudo consultar Presupuestos: ' . $e->getMessage() ] );
        }

        if ( ! $remote || ! isset( $remote['id'] ) ) {
            return back()->withErrors( [ 'presupuesto' => 'No existe un usuario en Presupuestos con email=' . $email . '.' ] );
        }

        $ccCuentas = [];
        foreach ( (array) ( $remote['cc_cuentas'] ?? [] ) as $row ) {
            $ccCuentas[] = [
                'centro_costo_id' => (int) ( $row['centro_costo_id'] ?? 0 ),
                'cuenta_id' => (int) ( $row['cuenta_id'] ?? 0 ),
                'is_aprobador' => (bool) ( $row['is_aprobador'] ?? false ),
            ];
        }

        EmpleadoPresupuesto::updateOrCreate(
            [ 'anacod' => $anacod ],
            [
                'presupuestos_user_id' => (int) $remote['id'],
                'sync_status' => 'ok',
                'last_error' => null,
                'last_password' => null,
                'cc_cuentas' => $ccCuentas,
                'last_synced_at' => now(),
            ]
        );

        return back()->with( 'success', 'Empleado vinculado a Presupuestos (id ' . $remote['id'] . ').' );
    }

    public function insertarRegistro( Request $request ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string',
            'ananam' => 'required|string',
            'anasta' => 'nullable|string',
            'anamai' => 'nullable|email',
            'anatel' => 'nullable|string',
            'anarea' => 'nullable|string',
        ] );

        // Insertar datos usando el modelo
        $registro = Empleado::create( $validatedData );

        // Respuesta
        return response()->json( [
            'message' => 'Registro insertado correctamente',
            'data' => $registro
        ], 201 );
    }

    public function updateImage( Request $request ) {
        $validatedData = $request->validate( [
            'anacod' => 'required|string|max:50',
            'foto' => 'required|file|image|max:1024',
        ] );
        $empleado = Empleado::find( $request->anacod );
        //agregar un timestamp al nombre de la omagen imagen
        $imagen_name = mb_strtolower( $empleado->anacod ) . '_' . time() . '.' . $request->foto->getClientOriginalExtension();
        //si existe la imagen la borra
        if (Storage::disk('public')->exists('uploads/' . $empleado->anaimg)) {
            Storage::disk('public')->delete('uploads/' . $empleado->anaimg);
        }
        $request->foto->storeAs( 'uploads', $imagen_name, 'public' );

        $empleado->anaimg = $imagen_name;
        //return json_encode( $empleado );
        return  back()->with('success', 'Imagen actualizada correctamente');
        // $empleado->anaimg = $request->foto->store( 'empleados', 'public' );
    }

    public function updateControl( Request $request ): RedirectResponse {
        $redControl = UsuarioRedControl::find( $request->id );
        $redControl->estado = $request->activar ? 2 : 1;
        $redControl->actualizacion = now();
        $redControl->save();
        return Redirect::route( 'empleados.show', [ $request->anacod ] );
    }

    public function crearMensajeria(Request $request):RedirectResponse
    {
        $usuarioMensajeria = new UsuarioRedControl();
        $empleado = Empleado::find($request->anacod);
        $contrasenia = Str::random(4) . rand(1000, 9999);
        $usuarioMensajeria->codigoInterno= hash( 'sha256', microtime( true ) );
        $usuarioMensajeria->idusuario = $request->aplicacion =='Mensajeria' ? strtolower($empleado->anacod) . '@mensajeria.red.' . strtolower($empleado->anapai) : $empleado->anacod;
        $usuarioMensajeria->cliente = 1;
        $usuarioMensajeria->email = $empleado->anamai;
        $usuarioMensajeria->nombre = $empleado->ananam;
        $usuarioMensajeria->jefeInmediato = $empleado->anajef;
        $usuarioMensajeria->contrasenia = base64_encode($contrasenia);
        $usuarioMensajeria->permisos = 1;
        $usuarioMensajeria->estado = 2;
        $usuarioMensajeria->telefono = $empleado->anatel;
        $usuarioMensajeria->trxdat = now()->toDateString();
        $usuarioMensajeria->empresa =$request->aplicacion =='Mensajeria' ? (( $empleado->anapai === 'SV' ) ? 26 : 32) : 1;
        $usuarioMensajeria->pais = $empleado->anapai;
        $usuarioMensajeria->imei = $empleado->getImei($empleado->folcod)->eqpser;
        $usuarioMensajeria->tracking_key = 1;
        $usuarioMensajeria->actualizacion = now();
        $usuarioMensajeria->anexo = $empleado->folcod;
        $usuarioMensajeria->lat = 0;
        $usuarioMensajeria->lng = 0;
        $usuarioMensajeria->save();
        $recipients = [$empleado->anamai, 'awcruz@red.com.sv'];
        Mail::to( $recipients )->send( new ControlRegistrationConfirmation( $usuarioMensajeria->nombre, $usuarioMensajeria->idusuario, $usuarioMensajeria->email, $contrasenia, $request->aplicacion) );
        return Redirect::route( 'empleados.show', [ $request->anacod ] );
    }

    public function DatosIndex($anacod)
    {
        $empleado = Empleado::where( 'anacod', $anacod )->first();
       return Inertia::render('Empleados/Datos', [ 'empleado' => $empleado ]);
    }

    public function DatosStore(Request $request): RedirectResponse
    {
        $empleado = Empleado::where( 'anacod', $request->anacod )->first();
        $empleado->update($request->all());
        return Redirect::route( 'empleados.show', [ $request->anacod ] );
    }


    public function DatosCreate($anacod)
    {
        $empleado = Empleado::where( 'anacod', $anacod )->first();
        return Inertia::render('Empleados/CreateDatos', [ 'empleado' => $empleado ]);
    }
}
