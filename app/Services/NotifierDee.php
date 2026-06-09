<?php

namespace App\Services;

use App\Models\Dossier;
use App\Models\NotificationAneaq;
use App\Models\User;

class NotifierDee
{
    public static function pourDossier(
        Dossier $dossier,
        string $type,
        string $titre,
        string $message
    ): void {
        User::where('role', 'admin_dee')
            ->pluck('id')
            ->each(function (int $userId) use ($dossier, $type, $titre, $message) {
                try {
                    NotificationAneaq::envoyer(
                        $userId,
                        $type,
                        $titre,
                        $message,
                        'Dossier',
                        $dossier->id
                    );
                } catch (\Throwable $exception) {
                    report($exception);
                }
            });
    }
}
