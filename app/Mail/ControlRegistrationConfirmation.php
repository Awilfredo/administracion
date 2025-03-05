<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ControlRegistrationConfirmation extends Mailable
{
    use Queueable, SerializesModels;
    public $name;
    public $email;  
    public $user;
    public $password;
    public $aplicacion;
    /**
     * Create a new message instance.
     */
    public function __construct($name, $user, $email, $password, $aplicacion)
    {
        $this->name = $name;
        $this->email = $email;
        $this->user = $user;
        $this->password = $password;
        $this->aplicacion = $aplicacion;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Confirmacion de creacion de usuario de " . $this->aplicacion,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.control', 
            with: [
                'user' => $this->user,
                'password' => $this->password,
                'name' => $this->name,
                'email' => $this->email,
                'aplicacion' => $this->aplicacion,
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
        return [];
    }
}
