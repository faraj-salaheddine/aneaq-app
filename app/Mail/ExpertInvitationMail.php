<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ExpertInvitationMail extends Mailable
{
    public function __construct(
        public string  $expertName,
        public string  $loginEmail,
        public string  $plainPassword,
        public string  $dossierReference,
        public string  $campaignReference,
        public string  $expertRole,
        public string  $platformUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invitation — Évaluation ANEAQ · ' . $this->dossierReference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.expert_invitation',
        );
    }
}
