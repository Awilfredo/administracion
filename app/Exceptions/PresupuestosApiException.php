<?php

namespace App\Exceptions;

use Exception;
use Throwable;

class PresupuestosApiException extends Exception
{
    public int $statusCode;

    public array $apiErrors;

    public function __construct(
        string $message,
        int $statusCode = 0,
        array $apiErrors = [],
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
        $this->statusCode = $statusCode;
        $this->apiErrors = $apiErrors;
    }

    public static function unauthorized(): self
    {
        return new self('Token de Presupuestos ausente, inválido, revocado o expirado.', 401);
    }

    public static function forbidden(): self
    {
        return new self('El token no tiene permisos para esta operación o no pertenece al tenant.', 403);
    }

    public static function validation(array $errors, string $message = 'Validación fallida en la API de Presupuestos.'): self
    {
        return new self($message, 422, $errors);
    }

    public static function notFound(): self
    {
        return new self('El recurso no existe en Presupuestos o no pertenece al tenant.', 404);
    }

    public static function serverError(string $detail = ''): self
    {
        return new self('Error interno en la API de Presupuestos.' . ($detail ? " Detalle: {$detail}" : ''), 500);
    }

    public static function network(string $detail = ''): self
    {
        return new self('No se pudo conectar con la API de Presupuestos.' . ($detail ? " Detalle: {$detail}" : ''), 0);
    }

    public function fieldErrors(): array
    {
        $prefixed = [];
        foreach ($this->apiErrors as $field => $messages) {
            $messages = is_array($messages) ? $messages : [$messages];
            $prefixed['presupuestos.' . $field] = $messages;
        }

        return $prefixed;
    }
}
