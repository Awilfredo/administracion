<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SharepointApiClient
{
    public function __construct(
        protected ?string $baseUrl = null,
        protected ?string $apiKey = null,
        protected ?string $siteUrl = null,
        protected ?string $list = null,
        protected int $timeout = 30,
    ) {
        $config = config('services.sharepoint');
        $this->baseUrl = rtrim($this->baseUrl ?: ($config['base_url'] ?? ''), '/');
        $this->apiKey = $this->apiKey ?: ($config['api_key'] ?? '');
        $this->siteUrl = $this->siteUrl ?: ($config['site_url'] ?? '');
        $this->list = $this->list ?: ($config['list'] ?? 'Acciones de Personal');
        $this->timeout = (int) ($this->timeout ?: ($config['timeout'] ?? 30));
    }

    public function isConfigured(): bool
    {
        return $this->baseUrl !== '' && $this->apiKey !== '';
    }

    public function getSiteUrl(): string
    {
        return (string) $this->siteUrl;
    }

    public function getList(): string
    {
        return (string) $this->list;
    }

    public function fetchItems(array $payload): array
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('SharePoint API no está configurada (base_url o api_key faltantes).');
        }

        $payload = array_merge([
            'siteUrl' => $this->siteUrl,
            'list' => $this->list,
        ], $payload);

        $url = $this->baseUrl . '/items';

        Log::info('SharePoint API: fetchItems -> POST items', [
            'url' => $url,
            'siteUrl' => $payload['siteUrl'],
            'list' => $payload['list'],
            'orderBy' => $payload['orderBy'] ?? null,
            'order' => $payload['order'] ?? null,
            'limit' => $payload['limit'] ?? null,
            'has_filter' => isset($payload['filter']),
        ]);

        try {
            $response = Http::withHeaders([
                'x-api-key' => $this->apiKey,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])
                ->timeout($this->timeout)
                ->post($url, $payload);
        } catch (Throwable $e) {
            Log::warning('SharePoint API: fallo de transporte', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            throw new \RuntimeException('Error de transporte con SharePoint: ' . $e->getMessage(), 0, $e);
        }

        if (! $response->successful()) {
            $status = $response->status();
            $body = $response->json();
            Log::warning('SharePoint API: respuesta no exitosa', [
                'status' => $status,
                'body' => $body,
            ]);
            throw new \RuntimeException("SharePoint respondió {$status}: " . json_encode($body));
        }

        return $response->json() ?? [];
    }

    public function fetchByDate(string $date, int $limit = 100): array
    {
        return $this->fetchItems([
            'orderBy' => 'ID',
            'order' => 'desc',
            'limit' => $limit,
            'filter' => [
                'fecha_efectiva' => $date,
            ],
        ]);
    }
}