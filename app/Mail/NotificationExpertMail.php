<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NotificationExpertMail extends Mailable
{
    public function __construct(
        public string $expertName,
        public string $titre,
        public string $message,
        public string $type     = 'general',
        public ?string $actionUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '[ANEAQ] ' . $this->titre);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.notification-expert');
    }
}
