<?php

namespace Tests\Unit;

use App\Services\FinalReportAvailabilityService;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

class FinalReportAvailabilityServiceTest extends TestCase
{
    public function test_report_is_not_available_without_visit_date(): void
    {
        $this->assertFalse(FinalReportAvailabilityService::canUpload([
            'date_visite' => null,
        ], CarbonImmutable::parse('2026-06-04')));
    }

    public function test_report_is_available_one_day_after_visit(): void
    {
        $dossier = ['date_visite' => '2026-06-03'];

        $this->assertFalse(FinalReportAvailabilityService::canUpload(
            $dossier,
            CarbonImmutable::parse('2026-06-03 23:59:59')
        ));

        $this->assertTrue(FinalReportAvailabilityService::canUpload(
            $dossier,
            CarbonImmutable::parse('2026-06-04 00:00:00')
        ));
    }
}
