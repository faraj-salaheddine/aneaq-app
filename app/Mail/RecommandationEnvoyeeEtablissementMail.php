<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class RecommandationEnvoyeeEtablissementMail extends Mailable
{
    public function __construct(
        public string $etablissementNom,
        public string $dossierReference,
        public int    $nombreRecommandations,
        public string $platformUrl,
    ) {}

    public function build()
    {
        return $this
            ->subject("Recommandations DEE — {$this->dossierReference}")
            ->view('emails.recommandation_envoyee_etablissement');
    }
}
