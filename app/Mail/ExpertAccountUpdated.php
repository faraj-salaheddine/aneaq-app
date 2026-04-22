<?php
namespace App\Mail;

use App\Models\Expert;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ExpertAccountUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Expert $expert,
        public ?string $password,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mise à jour de votre compte expert ANEAQ',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.expert-account-updated',
        );
    }
}