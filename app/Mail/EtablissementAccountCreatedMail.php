<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EtablissementAccountCreatedMail extends Mailable
{
    use SerializesModels;

    public string $etablissementName;
    public string $loginEmail;
    public string $plainPassword;
    public ?string $dossierReference;
    public ?string $campaignReference;
    public ?string $messageLettre;

    public function __construct(
        string $etablissementName,
        string $loginEmail,
        string $plainPassword,
        ?string $dossierReference = null,
        ?string $campaignReference = null,
        ?string $messageLettre = null
    ) {
        $this->etablissementName = $etablissementName;
        $this->loginEmail = $loginEmail;
        $this->plainPassword = $plainPassword;
        $this->dossierReference = $dossierReference;
        $this->campaignReference = $campaignReference;
        $this->messageLettre = $messageLettre;
    }

    public function build()
    {
        return $this
            ->subject('Accès à la plateforme ANEAQ')
            ->view('emails.etablissement_account_created')
            ->with([
                'etablissementName' => $this->etablissementName,
                'loginEmail' => $this->loginEmail,
                'plainPassword' => $this->plainPassword,
                'dossierReference' => $this->dossierReference,
                'campaignReference' => $this->campaignReference,
                'messageLettre' => $this->messageLettre,
            ]);
    }
}
