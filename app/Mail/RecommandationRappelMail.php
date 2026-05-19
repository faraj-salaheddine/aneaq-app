<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class RecommandationRappelMail extends Mailable
{
    public function __construct(
        public string  $etablissementNom,
        public string  $dossierReference,
        public string  $type,
        public ?string $messagePersonnalise,
        public int     $nombreEnCours,
        public string  $platformUrl,
    ) {}

    public function build()
    {
        return $this
            ->subject("Rappel recommandations — {$this->dossierReference}")
            ->view('emails.recommandation_rappel');
    }
}
