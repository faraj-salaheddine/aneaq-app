<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ExpertRefusDEEMail extends Mailable
{
    public function __construct(
        public string  $expertName,
        public string  $expertEmail,
        public string  $expertRole,
        public string  $dossierReference,
        public string  $motifRefus,
        public string  $dossierUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Expert a refusé — ' . $this->dossierReference . ' · ANEAQ',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.expert_refus_dee',
        );
    }
}
