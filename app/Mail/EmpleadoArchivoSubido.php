<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmpleadoArchivoSubido extends Mailable
{
    use Queueable, SerializesModels;

    public string $empleadoNombre;

    public string $empleadoAnacod;

    public string $nombreArchivo;

    public string $nombreOriginal;

    public string $rutaArchivo;

    public ?string $area;

    public ?string $puesto;

    public ?string $usuarioSubidor;

    public string $fechaSubida;

    /**
     * Create a new message instance.
     */
    public function __construct(
        string $empleadoNombre,
        string $empleadoAnacod,
        string $nombreArchivo,
        string $nombreOriginal,
        string $rutaArchivo,
        ?string $area = null,
        ?string $puesto = null,
        ?string $usuarioSubidor = null
    ) {
        $this->empleadoNombre = $empleadoNombre;
        $this->empleadoAnacod = $empleadoAnacod;
        $this->nombreArchivo = $nombreArchivo;
        $this->nombreOriginal = $nombreOriginal;
        $this->rutaArchivo = $rutaArchivo;
        $this->area = $area;
        $this->puesto = $puesto;
        $this->usuarioSubidor = $usuarioSubidor;
        $this->fechaSubida = now()->format('d/m/Y H:i');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Archivo cargado por empleado: {$this->empleadoAnacod} - {$this->empleadoNombre}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.empleado_archivo_subido',
            with: [
                'empleadoNombre' => $this->empleadoNombre,
                'empleadoAnacod' => $this->empleadoAnacod,
                'nombreArchivo' => $this->nombreArchivo,
                'nombreOriginal' => $this->nombreOriginal,
                'area' => $this->area,
                'puesto' => $this->puesto,
                'usuarioSubidor' => $this->usuarioSubidor,
                'fechaSubida' => $this->fechaSubida,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk('public', $this->rutaArchivo)
                ->as($this->nombreOriginal),
        ];
    }
}
