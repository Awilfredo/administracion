<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PresupuestosUserCreatedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public string $nombre;
    public string $email;
    public string $password;
    public string $anacod;

    public function __construct(string $nombre, string $email, string $password, string $anacod)
    {
        $this->nombre = $nombre;
        $this->email = $email;
        $this->password = $password;
        $this->anacod = $anacod;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu usuario de Presupuestos ha sido creado',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.presupuestos_user_created',
            with: [
                'nombre' => $this->nombre,
                'email' => $this->email,
                'password' => $this->password,
                'anacod' => $this->anacod,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
