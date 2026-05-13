<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class AffectationConfirmeeMail extends Mailable
{
    public function __construct(
        public string  $expertName,
        public string  $expertRole,
        public string  $dossierReference,
        public string  $campaignReference,
        public string  $dossierUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre affectation est confirmée — ' . $this->dossierReference . ' · ANEAQ',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.affectation_confirmee',
        );
    }
}
