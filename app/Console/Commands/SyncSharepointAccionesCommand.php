<?php

namespace App\Console\Commands;

use App\Models\EmpleadoAccion;
use App\Models\EmpleadoAccionTipo;
use App\Services\AccionPersonalSync;
use App\Services\SharepointAccionHomologador;
use App\Services\SharepointApiClient;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncSharepointAccionesCommand extends Command
{
    protected $signature = 'sharepoint:sync-acciones
                            {--from= : Fecha desde (Y-m-d). Default: hace 7 días}
                            {--to= : Fecha hasta (Y-m-d). Default: hoy + 30 días}
                            {--limit=100 : Cantidad máxima de items por request}
                            {--dry-run : Solo loguear, no escribir en DB}';

    protected $description = 'Sincroniza acciones de personal desde SharePoint a empleado_acciones';

    public function handle(SharepointApiClient $client): int
    {
        $from = $this->option('from') ?? now()->subDays(7)->toDateString();
        $to = $this->option('to') ?? now()->addDays(30)->toDateString();
        $limit = (int) $this->option('limit');
        $dryRun = (bool) $this->option('dry-run');

        $this->info("SharePoint sync: {$from} → {$to} (limit={$limit})" . ($dryRun ? ' [DRY-RUN]' : ''));

        if (! $client->isConfigured()) {
            $this->error('SharePoint API no está configurada. Revisa SHAREPOINT_API_BASE_URL y SHAREPOINT_API_KEY en .env');
            Log::error('SharePoint sync: cliente no configurado');
            return self::FAILURE;
        }

        try {
            $allItems = $this->fetchItemsByDateRange($client, $from, $to, $limit);
        } catch (\Throwable $e) {
            $this->error('Error al llamar a SharePoint: ' . $e->getMessage());
            Log::error('SharePoint sync: fallo de transporte', ['error' => $e->getMessage()]);
            return self::FAILURE;
        }

        $count = count($allItems);
        $this->info("Recibidos {$count} items desde SharePoint");

        $homologador = app(SharepointAccionHomologador::class);
        $stats = ['imported' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => 0];

        foreach ($allItems as $sp) {
            try {
                $result = $homologador->homologar($sp, $dryRun);
                $accionKey = $result['accion'];
                if (! isset($stats[$accionKey])) {
                    $stats[$accionKey] = 0;
                }
                $stats[$accionKey]++;

                $this->line(sprintf(
                    '  [%s] SharePoint ID %s: %s',
                    str_pad($accionKey, 12),
                    $result['sharepoint_id'] ?? '?',
                    $result['motivo']
                ));

                if (! $dryRun && in_array($accionKey, ['imported', 'updated'], true)) {
                    $this->dispararSyncAsistencia($result['sharepoint_id']);
                }
            } catch (\Throwable $e) {
                $stats['errors']++;
                $this->error(sprintf(
                    '  [error] SharePoint ID %s: %s',
                    $sp['Id'] ?? '?',
                    $e->getMessage()
                ));
                Log::error('SharePoint sync: item falló', [
                    'sp_id' => $sp['Id'] ?? null,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info('Resumen:');
        $rows = [];
        foreach ($stats as $accion => $cantidad) {
            $rows[] = [$accion, $cantidad];
        }
        $this->table(['Acción', 'Cantidad'], $rows);

        Log::info('SharePoint sync: completed', [
            'from' => $from,
            'to' => $to,
            'limit' => $limit,
            'dry_run' => $dryRun,
            'stats' => $stats,
        ]);

        return self::SUCCESS;
    }

    protected function dispararSyncAsistencia(int $sharepointId): void
    {
        try {
            $accion = EmpleadoAccion::with('tipo')->where('sharepoint_id', $sharepointId)->first();
            if (! $accion) {
                return;
            }

            if (! AccionPersonalSync::debeSincronizar($accion)) {
                Log::info('SharePoint sync: tipo no afecta asistencia, skip', [
                    'sharepoint_id' => $sharepointId,
                    'tipo' => $accion->tipo?->nombre,
                ]);
                return;
            }

            AccionPersonalSync::llenar($accion);

            Log::info('SharePoint sync: asistencia sincronizada', [
                'sharepoint_id' => $sharepointId,
                'anacod' => $accion->anacod,
            ]);
        } catch (\Throwable $e) {
            Log::warning('SharePoint sync: no se pudo sincronizar asistencia', [
                'sharepoint_id' => $sharepointId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function fetchItemsByDateRange(SharepointApiClient $client, string $from, string $to, int $limit): array
    {
        $start = \Carbon\Carbon::parse($from)->startOfDay();
        $end = \Carbon\Carbon::parse($to)->startOfDay();

        $allItems = [];
        $seenIds = [];

        $current = $start->copy();
        while ($current->lte($end)) {
            $date = $current->toDateString();
            try {
                $response = $client->fetchByDate($date, $limit);
            } catch (\Throwable $e) {
                Log::warning('SharePoint sync: fallo al iterar día', [
                    'date' => $date,
                    'error' => $e->getMessage(),
                ]);
                $current->addDay();
                continue;
            }

            foreach ($response['data'] ?? [] as $item) {
                $spId = $item['Id'] ?? null;
                if (! $spId || isset($seenIds[$spId])) {
                    continue;
                }
                $seenIds[$spId] = true;
                $allItems[] = $item;
            }

            $current->addDay();
        }

        return $allItems;
    }
}