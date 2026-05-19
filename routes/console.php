<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Vérifier tous les mois si des rappels de recommandations (6 mois) sont dus
Schedule::command('aneaq:check-recommandation-rappels')->monthly();
