<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        // Rappels rapports : lundi et jeudi à 9h00
        $schedule->command('rappels:rapports')->weeklyOn(1, '09:00');
        $schedule->command('rappels:rapports')->weeklyOn(4, '09:00');
        // Rappels évaluations : lundi à 8h30
        $schedule->command('rappels:evaluations')->weeklyOn(1, '08:30');
    })
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'dee.admin' => \App\Http\Middleware\EnsureDeeAdmin::class,
             'role'      => \App\Http\Middleware\CheckRole::class, 
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();