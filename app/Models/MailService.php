<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class MailService extends Model
{
    use HasFactory;

    private $mail;


    public function __construct()
    {
        $this->mail = new PHPMailer(true);
        $this->setupMail();
    }

    private function setupMail()
    {
        $this->mail->isSMTP();
        $this->mail->Host = 'smtp.office365.com';
        $this->mail->SMTPAuth = true;
        $this->mail->Username = "no-reply@red.com.sv";
        $this->mail->Password = "Hur%789234$$5";
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mail->Port = 587;
    }

    public function sendEmail($to, $toName, $subject, $body, $altBody)
    {
        try {
            $this->mail->setFrom("no-reply@red.com.sv", 'HirginBot');
            $this->mail->addAddress($to, $toName);
            $this->mail->isHTML(true);
            $this->mail->Subject = $subject;
            $this->mail->Body = $body;
            $this->mail->AltBody = $altBody;

            $this->mail->send();
            return 'El mensaje ha sido enviado';
        } catch (Exception $e) {
            return "El mensaje no pudo ser enviado. Error de PHPMailer: {$this->mail->ErrorInfo}";
        }
    }

    public function addBase64Attachment($base64Content, $name, $type)
    {
        // Decodificar el contenido de base64
        $decodedContent = base64_decode($base64Content);

        // Usar el método addStringAttachment de PHPMailer
        try {
            $this->mail->addStringAttachment($decodedContent, $name, 'base64', $type);
            return 'Archivo adjunto en base64 añadido correctamente.';
        } catch (Exception $e) {
            return "Error al añadir el archivo base64: {$e->getMessage()}";
        }
    }
}
