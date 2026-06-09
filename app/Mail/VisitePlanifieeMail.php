<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class VisitePlanifieeMail extends Mailable
{
    public function __construct(
        public string $destinataireNom,
        public string $dossierReference,
        public string $dateVisite,
        public string $platformUrl,
        public string $role = 'etablissement', // 'etablissement' | 'expert'
    ) {}

    public function build()
    {
        return $this
            ->subject("Date de visite planifiée — {$this->dossierReference}")
            ->view('emails.visite_planifiee');
    }
}
