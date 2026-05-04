<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class ExpertAccountCreatedMail extends Mailable
{
    public function __construct(
        public string $expertName,
        public string $loginEmail,
        public string $plainPassword,
        public string $dossierReference,
        public string $campaignReference,
        public string $confirmationUrl,
        public string $expertRole = 'Expert',
    ) {}

    public function build()
    {
        return $this
            ->subject('Affectation expert - ANEAQ')
            ->view('emails.expert_account_created');
    }
}