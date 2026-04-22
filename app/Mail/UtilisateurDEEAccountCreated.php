<?php
namespace App\Mail;

use App\Models\UtilisateurDEE;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UtilisateurDEEAccountCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UtilisateurDEE $utilisateur,
        public string $password,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenue sur la plateforme ANEAQ — Vos accès DEE',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.utilisateur-dee-account-created',
        );
    }
}