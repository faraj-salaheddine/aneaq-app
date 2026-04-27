<?php

use App\Http\Controllers\SI\SIDashboardController;
use App\Http\Controllers\SI\UtilisateursDEEController;
use App\Http\Controllers\SI\ExpertController;
use App\Http\Controllers\SI\EtablissementController;
use App\Http\Controllers\SI\UniversiteController;
use App\Http\Controllers\Expert\ExpertDashboardController;
use App\Http\Controllers\Expert\ParticipationController;
use App\Http\Controllers\Expert\DossierExpertController;
use App\Http\Controllers\Expert\EvaluationQuantitativeController;
use App\Http\Controllers\Expert\RapportExpertController;
use App\Http\Controllers\Expert\MatriceRecommandationController;
use App\Http\Controllers\Expert\NotificationExpertController;
use App\Http\Controllers\Expert\HistoriqueParticipationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ──────────────────────────────────────────────────────────────
// Page d'accueil
// ──────────────────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// ──────────────────────────────────────────────────────────────
// Redirection /dashboard selon le rôle
// ──────────────────────────────────────────────────────────────
Route::get('/dashboard', function () {
    $user = Auth::user();

    if ($user && $user->role === 'expert') {
        return redirect()->route('expert.dashboard');
    }

    return redirect()->route('si.dashboard');

})->middleware(['auth'])->name('dashboard');

// ──────────────────────────────────────────────────────────────
// Routes SI
// ──────────────────────────────────────────────────────────────
Route::middleware(['auth'])->prefix('si')->name('si.')->group(function () {

    Route::get('/dashboard', [SIDashboardController::class, 'index'])->name('dashboard');

    // Utilisateurs DEE
    Route::get('/utilisateurs-dee',                       [UtilisateursDEEController::class, 'index'])->name('utilisateurs-dee.index');
    Route::get('/utilisateurs-dee/create',                [UtilisateursDEEController::class, 'create'])->name('utilisateurs-dee.create');
    Route::post('/utilisateurs-dee',                      [UtilisateursDEEController::class, 'store'])->name('utilisateurs-dee.store');
    Route::get('/utilisateurs-dee/{utilisateurDee}/edit', [UtilisateursDEEController::class, 'edit'])->name('utilisateurs-dee.edit');
    Route::put('/utilisateurs-dee/{utilisateurDee}',      [UtilisateursDEEController::class, 'update'])->name('utilisateurs-dee.update');
    Route::delete('/utilisateurs-dee/{utilisateurDee}',   [UtilisateursDEEController::class, 'destroy'])->name('utilisateurs-dee.destroy');

    // Experts
    Route::get('/experts',                                        [ExpertController::class, 'index'])->name('experts.index');
    Route::get('/experts/create',                                 [ExpertController::class, 'create'])->name('experts.create');
    Route::get('/experts/export',                                 [ExpertController::class, 'export'])->name('experts.export');
    Route::post('/experts',                                       [ExpertController::class, 'store'])->name('experts.store');
    Route::get('/experts/{expert}',                               [ExpertController::class, 'show'])->name('experts.show');
    Route::get('/experts/{expert}/edit',                          [ExpertController::class, 'edit'])->name('experts.edit');
    Route::put('/experts/{expert}',                               [ExpertController::class, 'update'])->name('experts.update');
    Route::delete('/experts/{expert}',                            [ExpertController::class, 'destroy'])->name('experts.destroy');
    Route::get('/experts/{expert}/documents/{document}/preview',  [ExpertController::class, 'previewDocument'])->name('experts.documents.preview');
    Route::get('/experts/{expert}/documents/{document}/download', [ExpertController::class, 'downloadDocument'])->name('experts.documents.download');

    // Établissements
    Route::get('/etablissements',        [EtablissementController::class, 'index'])->name('etablissements.index');
    Route::get('/etablissements/create', [EtablissementController::class, 'create'])->name('etablissements.create');
    Route::post('/etablissements',       [EtablissementController::class, 'store'])->name('etablissements.store');

    // Universités
    Route::get('/universites', [UniversiteController::class, 'index'])->name('universites.index');
});

// ──────────────────────────────────────────────────────────────
// Routes Expert
// ──────────────────────────────────────────────────────────────
Route::middleware(['auth'])->prefix('expert')->name('expert.')->group(function () {

    // Dashboard
    Route::get('/dashboard', [ExpertDashboardController::class, 'index'])->name('dashboard');

    // Participations
    Route::get('/participations',                         [ParticipationController::class, 'index'])->name('participations.index');
    Route::post('/participations/{dossier}/confirmer',    [ParticipationController::class, 'confirmer'])->name('participations.confirmer');
    Route::post('/participations/{dossier}/refuser',      [ParticipationController::class, 'refuser'])->name('participations.refuser');

    // Dossiers
    Route::get('/dossiers',           [DossierExpertController::class, 'index'])->name('dossiers.index');
    Route::get('/dossiers/{dossier}', [DossierExpertController::class, 'show'])->name('dossiers.show');

    // Évaluation quantitative
    Route::get('/dossiers/{dossier}/evaluation',              [EvaluationQuantitativeController::class, 'index'])->name('evaluation.index');
    Route::post('/dossiers/{dossier}/evaluation/sauvegarder', [EvaluationQuantitativeController::class, 'sauvegarder'])->name('evaluation.sauvegarder');
    Route::post('/dossiers/{dossier}/evaluation/soumettre',   [EvaluationQuantitativeController::class, 'soumettre'])->name('evaluation.soumettre');

    // Rapports
    Route::get('/rapports',                       [RapportExpertController::class, 'index'])->name('rapports.index');
    Route::get('/rapports/{dossier}/deposer',     [RapportExpertController::class, 'create'])->name('rapports.create');
    Route::post('/rapports/{dossier}/deposer',    [RapportExpertController::class, 'store'])->name('rapports.store');
    Route::get('/rapports/{rapport}/telecharger', [RapportExpertController::class, 'telecharger'])->name('rapports.telecharger');

    // Matrice
    Route::get('/dossiers/{dossier}/matrice',              [MatriceRecommandationController::class, 'index'])->name('matrice.index');
    Route::post('/dossiers/{dossier}/matrice/sauvegarder', [MatriceRecommandationController::class, 'sauvegarder'])->name('matrice.sauvegarder');
    Route::post('/dossiers/{dossier}/matrice/soumettre',   [MatriceRecommandationController::class, 'soumettre'])->name('matrice.soumettre');

    // Notifications (tout-lire AVANT {notification} pour éviter conflit de routing)
    Route::patch('/notifications/tout-lire',              [NotificationExpertController::class, 'toutMarquerLu'])->name('notifications.toutLire');
    Route::get('/notifications',                          [NotificationExpertController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{notification}/lire',    [NotificationExpertController::class, 'marquerLu'])->name('notifications.lire');

    // Historique
    Route::get('/historique', [HistoriqueParticipationController::class, 'index'])->name('historique.index');

    // Profil expert
    Route::get('/profil',       [ExpertDashboardController::class, 'profil'])->name('profil.show');
    Route::get('/profil/edit',  [ExpertDashboardController::class, 'editProfil'])->name('profil.edit');
    Route::put('/profil',       [ExpertDashboardController::class, 'updateProfil'])->name('profil.update');
});

require __DIR__.'/auth.php';