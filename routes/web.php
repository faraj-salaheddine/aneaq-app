<?php

use App\Http\Controllers\SI\SIDashboardController;
use App\Http\Controllers\SI\UtilisateursDEEController;
use App\Http\Controllers\SI\ExpertController;
use App\Http\Controllers\SI\EtablissementController;
use App\Http\Controllers\SI\UniversiteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Welcome page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return redirect()->route('si.dashboard');
})->middleware(['auth'])->name('dashboard');

// SI routes
Route::middleware(['auth'])->prefix('si')->name('si.')->group(function () {

    // Vue d'ensemble
    Route::get('/dashboard', [SIDashboardController::class, 'index'])->name('dashboard');

Route::get('/utilisateurs-dee',                    [UtilisateursDEEController::class, 'index'])->name('utilisateurs-dee.index');
Route::get('/utilisateurs-dee/create',             [UtilisateursDEEController::class, 'create'])->name('utilisateurs-dee.create');
Route::post('/utilisateurs-dee',                   [UtilisateursDEEController::class, 'store'])->name('utilisateurs-dee.store');
Route::get('/utilisateurs-dee/{utilisateurDee}/edit',  [UtilisateursDEEController::class, 'edit'])->name('utilisateurs-dee.edit');
Route::put('/utilisateurs-dee/{utilisateurDee}',       [UtilisateursDEEController::class, 'update'])->name('utilisateurs-dee.update');
Route::delete('/utilisateurs-dee/{utilisateurDee}',    [UtilisateursDEEController::class, 'destroy'])->name('utilisateurs-dee.destroy');

    // Experts
    Route::get('/experts',                                          [ExpertController::class, 'index'])->name('experts.index');
    Route::get('/experts/create',                                   [ExpertController::class, 'create'])->name('experts.create');
    Route::get('/experts/export', [ExpertController::class, 'export'])->name('experts.export');
    Route::post('/experts',                                         [ExpertController::class, 'store'])->name('experts.store');
    Route::get('/experts/{expert}', [ExpertController::class, 'show'])->name('experts.show');
    Route::get('/experts/{expert}/edit',                            [ExpertController::class, 'edit'])->name('experts.edit');
    Route::put('/experts/{expert}',                                 [ExpertController::class, 'update'])->name('experts.update');
    Route::delete('/experts/{expert}',                              [ExpertController::class, 'destroy'])->name('experts.destroy');
    Route::get('/experts/{expert}/documents/{document}/preview', [ExpertController::class, 'previewDocument'])->name('experts.documents.preview');
    Route::get('/experts/{expert}/documents/{document}/download',   [ExpertController::class, 'downloadDocument'])->name('experts.documents.download');
    Route::delete('/experts/{expert}/documents/{document}', [ExpertController::class, 'deleteDocument'])->name('experts.documents.destroy');

// Établissements
Route::get('/etablissements',        [EtablissementController::class, 'index'])->name('etablissements.index');
Route::get('/etablissements/create', [EtablissementController::class, 'create'])->name('etablissements.create');
Route::post('/etablissements',       [EtablissementController::class, 'store'])->name('etablissements.store');

    // Universités (read-only)
    Route::get('/universites', [UniversiteController::class, 'index'])->name('universites.index');
});

require __DIR__.'/auth.php';