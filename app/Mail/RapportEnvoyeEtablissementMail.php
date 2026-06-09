<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class RapportEnvoyeEtablissementMail extends Mailable
{
    public function __construct(
        public string $etablissementNom,
        public string $dossierReference,
        public string $expertNom,
        public string $platformUrl,
    ) {}

    public function build()
    {
        return $this
            ->subject("Rapport expert disponible — {$this->dossierReference}")
            ->view('emails.rapport_envoye_etablissement');
    }
}
