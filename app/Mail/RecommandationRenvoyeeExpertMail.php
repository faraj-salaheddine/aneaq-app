<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class RecommandationRenvoyeeExpertMail extends Mailable
{
    public function __construct(
        public string $expertName,
        public string $dossierReference,
        public string $recommandation,
        public string $commentaireDee,
        public string $platformUrl,
    ) {}

    public function build()
    {
        return $this
            ->subject("Recommandation à réviser — {$this->dossierReference}")
            ->view('emails.recommandation_renvoyee_expert');
    }
}
