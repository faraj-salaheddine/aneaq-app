<?php
namespace App\Mail;

use App\Models\UtilisateurDEE;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UtilisateurDEEAccountUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UtilisateurDEE $utilisateur,
        public ?string $password,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mise à jour de votre compte ANEAQ',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.utilisateur-dee-account-updated',
        );
    }
}