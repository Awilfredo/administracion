<?php

namespace App\Services;

use App\Exceptions\PresupuestosApiException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class PresupuestosApiClient
{
    public function __construct(
        protected ?string $baseUrl = null,
        protected ?string $token = null,
        protected ?string $tenant = null,
        protected int $timeout = 10,
        protected int $catalogCacheTtl = 300,
    ) {
        $config = config('services.presupuestos');
        $this->baseUrl = rtrim($this->baseUrl ?: ($config['base_url'] ?? ''), '/');
        $this->token = $this->token ?: ($config['token'] ?? '');
        $this->tenant = $this->tenant ?: ($config['tenant'] ?? 'red');
        $this->timeout = (int) ($this->timeout ?: ($config['timeout'] ?? 10));
        $this->catalogCacheTtl = (int) ($this->catalogCacheTtl ?: ($config['catalog_cache_ttl'] ?? 300));
    }

    public function isConfigured(): bool
    {
        return $this->baseUrl !== '' && $this->token !== '';
    }

    public function getBaseUrl(): string
    {
        return (string) $this->baseUrl;
    }

    public function getTenant(): string
    {
        return (string) $this->tenant;
    }

    public function listCentrosCosto(bool $incluirInactivos = false): Collection
    {
        $key = "presupuestos:cc:{$this->tenant}:" . ($incluirInactivos ? 'all' : 'active');

        return Cache::remember($key, $this->catalogCacheTtl, function () use ($incluirInactivos) {
            $query = $incluirInactivos ? ['include_inactive' => 1] : [];
            $payload = $this->request('GET', 'centros-costo', $query);

            return collect($payload['data'] ?? [])
                ->map(fn ($row) => [
                    'id' => (int) ($row['id'] ?? 0),
                    'codigo' => (string) ($row['codigo'] ?? ''),
                    'nombre' => (string) ($row['nombre'] ?? ''),
                    'activo' => (bool) ($row['activo'] ?? true),
                ])
                ->filter(fn ($row) => $row['id'] > 0)
                ->values();
        });
    }

    public function listCuentas(bool $incluirInactivos = false): Collection
    {
        $key = "presupuestos:cuentas:{$this->tenant}:" . ($incluirInactivos ? 'all' : 'active');

        return Cache::remember($key, $this->catalogCacheTtl, function () use ($incluirInactivos) {
            $query = $incluirInactivos ? ['include_inactive' => 1] : [];
            $payload = $this->request('GET', 'cuentas', $query);

            return collect($payload['data'] ?? [])
                ->map(fn ($row) => [
                    'id' => (int) ($row['id'] ?? 0),
                    'codigo' => (string) ($row['codigo'] ?? ''),
                    'nombre' => (string) ($row['nombre'] ?? ''),
                    'activo' => (bool) ($row['activo'] ?? true),
                ])
                ->filter(fn ($row) => $row['id'] > 0)
                ->values();
        });
    }

    public function flushCatalogCache(): void
    {
        Cache::forget("presupuestos:cc:{$this->tenant}:active");
        Cache::forget("presupuestos:cc:{$this->tenant}:all");
        Cache::forget("presupuestos:cuentas:{$this->tenant}:active");
        Cache::forget("presupuestos:cuentas:{$this->tenant}:all");
    }

    public function getUser(int $id): ?array
    {
        try {
            return $this->unwrap($this->request('GET', "users/{$id}"));
        } catch (PresupuestosApiException $e) {
            if ($e->statusCode === 404) {
                return null;
            }
            throw $e;
        }
    }

    public function findUserByEmail(string $email): ?array
    {
        try {
            return $this->unwrap($this->request('GET', 'users/by-email/' . rawurlencode($email)));
        } catch (PresupuestosApiException $e) {
            if ($e->statusCode === 404) {
                return null;
            }
            throw $e;
        }
    }

    public function createUser(array $payload): array
    {
        Log::info('Presupuestos API: createUser -> POST users', [
            'url' => "{$this->baseUrl}/api/{$this->tenant}/users",
            'name' => $payload['name'] ?? null,
            'email' => $payload['email'] ?? null,
            'code' => $payload['code'] ?? null,
            'is_active' => $payload['is_active'] ?? null,
            'cc_cuentas_count' => count($payload['cc_cuentas'] ?? []),
        ]);
        return $this->unwrap($this->request('POST', 'users', [], $payload));
    }

    public function updateUser(int $id, array $payload): array
    {
        return $this->unwrap($this->request('PUT', "users/{$id}", [], $payload));
    }

    public function deleteUser(int $id): array
    {
        Log::info('Presupuestos API: deleteUser -> DELETE users/{id}', [
            'id' => $id,
        ]);
        return $this->unwrap($this->request('DELETE', "users/{$id}"));
    }

    public function listUsers(string $search = '', string $estado = 'activos', int $perPage = 50): array
    {
        $query = array_filter([
            'search' => $search !== '' ? $search : null,
            'estado' => $estado,
            'per_page' => $perPage,
        ], fn ($v) => $v !== null);

        return $this->request('GET', 'users', $query);
    }

    public function getUserCcCuentas(int $userId): Collection
    {
        $key = "presupuestos:user_cc:{$this->tenant}:{$userId}";

        $payload = Cache::remember($key, 60, function () use ($userId) {
            try {
                return $this->request('GET', "users/{$userId}/cc-cuentas");
            } catch (PresupuestosApiException $e) {
                if ($e->statusCode === 404) {
                    return ['data' => []];
                }
                throw $e;
            }
        });

        return $this->mapCcCuentas($payload['data'] ?? []);
    }

    public function upsertUserCcCuenta(int $userId, int $centroCostoId, int $cuentaId, array $attrs): array
    {
        $body = array_merge([
            'centro_costo_id' => $centroCostoId,
            'cuenta_id' => $cuentaId,
        ], $attrs);

        $this->forgetUserCcCache($userId);

        return $this->unwrap($this->request('POST', "users/{$userId}/cc-cuentas", [], $body));
    }

    public function updateUserCcCuenta(int $userId, int $ccCuentaId, array $attrs): array
    {
        $this->forgetUserCcCache($userId);

        return $this->unwrap($this->request('PUT', "users/{$userId}/cc-cuentas/{$ccCuentaId}", [], $attrs));
    }

    protected function mapCcCuentas(array $data): Collection
    {
        return collect($data)->map(fn ($row) => [
            'id' => isset($row['id']) ? (int) $row['id'] : null,
            'user_id' => isset($row['user_id']) ? (int) $row['user_id'] : null,
            'centro_costo_id' => (int) ($row['centro_costo_id'] ?? 0),
            'cuenta_id' => (int) ($row['cuenta_id'] ?? 0),
            'is_aprobador' => (bool) ($row['is_aprobador'] ?? false),
            'vigente_desde' => $row['vigente_desde'] ?? null,
            'vigente_hasta' => $row['vigente_hasta'] ?? null,
            'is_currently_active' => (bool) ($row['is_currently_active'] ?? false),
        ])->values();
    }

    protected function forgetUserCcCache(int $userId): void
    {
        Cache::forget("presupuestos:user_cc:{$this->tenant}:{$userId}");
    }

    protected function unwrap(array $response): array
    {
        if (array_key_exists('data', $response) && is_array($response['data'])) {
            return $response['data'];
        }
        return $response;
    }

    protected function request(string $method, string $path, array $query = [], ?array $body = null): array
    {
        if (! $this->isConfigured()) {
            throw PresupuestosApiException::network('La API de Presupuestos no está configurada (base_url o token faltantes).');
        }

        $url = "{$this->baseUrl}/api/{$this->tenant}/{$path}";

        try {
            $request = Http::withToken($this->token)
                ->acceptJson()
                ->asJson()
                ->timeout($this->timeout);

            if (! empty($query)) {
                $request = $request->withQueryParameters($query);
            }

            $response = $method === 'GET'
                ? $request->get($url)
                : $request->{$this->httpVerb($method)}($url, $body ?? []);
        } catch (Throwable $e) {
            Log::warning('Presupuestos API: fallo de transporte', [
                'method' => $method,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
            throw PresupuestosApiException::network($e->getMessage());
        }

        return $this->handleResponse($response, $method, $path);
    }

    protected function httpVerb(string $method): string
    {
        return match ($method) {
            'POST' => 'post',
            'PUT' => 'put',
            'PATCH' => 'patch',
            'DELETE' => 'delete',
            default => strtolower($method),
        };
    }

    protected function handleResponse($response, string $method, string $path): array
    {
        $status = $response->status();
        $body = $response->json();

        if ($response->successful()) {
            return is_array($body) ? $body : [];
        }

        Log::warning('Presupuestos API: respuesta no exitosa', [
            'method' => $method,
            'path' => $path,
            'status' => $status,
            'body' => $body,
        ]);

        $apiErrors = is_array($body) ? ($body['errors'] ?? []) : [];

        throw match ($status) {
            401 => PresupuestosApiException::unauthorized(),
            403 => PresupuestosApiException::forbidden(),
            404 => PresupuestosApiException::notFound(),
            422 => PresupuestosApiException::validation($apiErrors, $body['message'] ?? 'Validación fallida.'),
            500, 502, 503, 504 => PresupuestosApiException::serverError(is_string($body['message'] ?? null) ? $body['message'] : ''),
            default => new PresupuestosApiException(
                "Error inesperado ({$status}) al llamar a la API de Presupuestos.",
                $status,
                $apiErrors,
            ),
        };
    }
}
