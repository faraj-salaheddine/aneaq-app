<?php
namespace App\Mail;

use App\Models\Expert;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ExpertAccountCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Expert $expert,
        public string $password,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenue sur la plateforme ANEAQ — Vos accès',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.expert-account-created',
        );
    }
}