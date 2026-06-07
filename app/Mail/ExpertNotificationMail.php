<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class ExpertNotificationMail extends Mailable
{
    public function __construct(
        public string $expertName,
        public string $titre,
        public string $notificationMessage,
        public string $platformUrl,
        public array $committeeMembers = [],
    ) {}

    public function build()
    {
        return $this
            ->subject("Notification ANEAQ — {$this->titre}")
            ->view('emails.expert_notification');
    }
}
