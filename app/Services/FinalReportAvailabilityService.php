<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class FinalReportAvailabilityService
{
    public static function availableAt($dossier): ?CarbonImmutable
    {
        $dateVisite = self::dateVisite($dossier);

        if (!$dateVisite) {
            return null;
        }

        try {
            $date = $dateVisite instanceof CarbonInterface
                ? CarbonImmutable::instance($dateVisite)
                : CarbonImmutable::parse($dateVisite);
        } catch (\Throwable) {
            return null;
        }

        return $date->addDay()->startOfDay();
    }

    public static function canUpload($dossier, ?CarbonInterface $now = null): bool
    {
        $availableAt = self::availableAt($dossier);

        if (!$availableAt) {
            return false;
        }

        return ($now ?? CarbonImmutable::now())->greaterThanOrEqualTo($availableAt);
    }

    public static function message($dossier): string
    {
        $availableAt = self::availableAt($dossier);

        if (!$availableAt) {
            return "Le rapport final sera disponible après la planification de la date de visite.";
        }

        return "Le rapport final peut être déposé à partir du {$availableAt->format('d/m/Y')} (minimum 1 jour après la visite).";
    }

    private static function dateVisite($dossier)
    {
        if (is_array($dossier)) {
            return $dossier['date_visite'] ?? null;
        }

        return $dossier->date_visite ?? null;
    }
}
