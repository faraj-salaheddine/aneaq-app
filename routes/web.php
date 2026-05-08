<?php


use App\Http\Controllers\DEE\AdminDashboardController;
use App\Http\Controllers\DEE\CampagneEtablissementController;
use App\Http\Controllers\DEE\CampagneEvaluationController;
use App\Http\Controllers\DEE\DossierController;
use App\Http\Controllers\DEE\DossierDocumentController;
use App\Http\Controllers\DEE\DossierExpertController;
use App\Http\Controllers\DEE\EtablissementController;
use App\Http\Controllers\DEE\ExpertController;
use App\Http\Controllers\DEE\ExpertInvitationController;
use App\Http\Controllers\DEE\ProfileController;
use App\Http\Controllers\DEE\WorkflowController;
use App\Http\Controllers\SI\SIDashboardController;
use App\Http\Controllers\SI\UtilisateursDEEController;
use App\Http\Controllers\SI\EtablissementController as SIEtablissementController;
use App\Http\Controllers\SI\UniversiteController as SIUniversiteController;
use App\Http\Controllers\SI\ExpertController as SIExpertController;
use App\Http\Controllers\SI\HistoriqueController as SIHistoriqueController;
use App\Http\Controllers\Expert\ExpertDashboardController;
use App\Http\Controllers\Expert\ExpertProfilController;
use App\Http\Controllers\Expert\DossierExpertController as ExpertDossierController;
use App\Http\Controllers\Expert\EvaluationQuantitativeController;
use App\Http\Controllers\Expert\HistoriqueParticipationController;
use App\Http\Controllers\Expert\MatriceRecommandationController;
use App\Http\Controllers\Expert\NotificationExpertController;
use App\Http\Controllers\Expert\ParticipationController;
use App\Http\Controllers\Expert\RapportExpertController;
use App\Http\Controllers\Etablissement\EtablissementDashboardController;
use App\Http\Controllers\Etablissement\EtablissementProfilController;
use App\Http\Controllers\Etablissement\EtablissementDocumentController;
use App\Http\Controllers\Etablissement\AnnexeController;
use App\Http\Controllers\Etablissement\EtablissementNotificationController;
use App\Http\Controllers\Etablissement\EtablissementHistoriqueController;
use App\Models\CampagneEvaluation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Page publique
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

/*
|--------------------------------------------------------------------------
| Changement de langue
|--------------------------------------------------------------------------
*/

Route::post('/language/{locale}', function (string $locale) {
    if (in_array($locale, ['fr', 'ar'], true)) {
        session(['locale' => $locale]);
    }
    return back();
})->name('language.switch');

/*
|--------------------------------------------------------------------------
| Route /dashboard — redirection selon rôle
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->get('/dashboard', function () {
    $user = Auth::user();
    return match($user->role) {
        'admin_dee'     => redirect()->route('dee.dashboard'),
        'si'            => redirect()->route('si.dashboard'),
        'expert'        => redirect()->route('expert.dashboard'),
        'etablissement' => redirect()->route('etablissement.dashboard'),
        default         => abort(403, 'Accès refusé.'),
    };
})->name('dashboard');

/*
|--------------------------------------------------------------------------
| Confirmation expert depuis email (route publique)
|--------------------------------------------------------------------------
*/

Route::get('/experts/invitation/{token}/confirm', [ExpertInvitationController::class, 'confirm'])
    ->name('experts.invitation.confirm');

/*
|--------------------------------------------------------------------------
| Routes accessibles à tout utilisateur connecté (profil)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Redirections anciennes URLs admin DEE
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'dee.admin'])->group(function () {
    Route::redirect('/campagnes', '/dee/campagnes');
    Route::redirect('/campagnes/create', '/dee/campagnes/create');
    Route::get('/campagnes/{path}', function (string $path) {
        return redirect('/dee/campagnes/' . $path);
    })->where('path', '.*');

    Route::redirect('/dossiers', '/dee/dossiers');
    Route::get('/dossiers/{path}', function (string $path) {
        return redirect('/dee/dossiers/' . $path);
    })->where('path', '.*');

    Route::redirect('/etablissements', '/dee/etablissements');
    Route::get('/etablissements/{path}', function (string $path) {
        return redirect('/dee/etablissements/' . $path);
    })->where('path', '.*');

    Route::redirect('/experts', '/dee/experts');
    Route::get('/experts/{path}', function (string $path) {
        return redirect('/dee/experts/' . $path);
    })->where('path', '.*');

    Route::redirect('/workflow/visites', '/dee/workflow/visites');
});

/*
|--------------------------------------------------------------------------
| Espace DEE Administrateur
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'dee.admin'])
    ->prefix('dee')
    ->name('dee.')
    ->group(function () {

        // Dashboard DEE
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->name('dashboard');

        // Établissements DEE
        Route::prefix('etablissements')->name('etablissements.')->group(function () {
            Route::get('/', [EtablissementController::class, 'index'])->name('index');
            Route::get('/create', [EtablissementController::class, 'create'])->name('create');
            Route::post('/', [EtablissementController::class, 'store'])->name('store');
            Route::get('/{etablissement}', [EtablissementController::class, 'show'])->name('show');
            Route::get('/{etablissement}/edit', [EtablissementController::class, 'edit'])->name('edit');
            Route::patch('/{etablissement}', [EtablissementController::class, 'update'])->name('update');
            Route::delete('/{etablissement}', [EtablissementController::class, 'destroy'])->name('destroy');
        });

        // Experts DEE
        Route::prefix('experts')->name('experts.')->group(function () {
            Route::get('/', [ExpertController::class, 'index'])->name('index');
            Route::get('/create', [ExpertController::class, 'create'])->name('create');
            Route::post('/', [ExpertController::class, 'store'])->name('store');
            Route::get('/{expert}', [ExpertController::class, 'show'])->name('show');
            Route::get('/{expert}/edit', [ExpertController::class, 'edit'])->name('edit');
            Route::patch('/{expert}', [ExpertController::class, 'update'])->name('update');
            Route::delete('/{expert}', [ExpertController::class, 'destroy'])->name('destroy');
        });

        // Campagnes d'évaluation
        Route::prefix('campagnes')->name('campagnes.')->group(function () {
            Route::get('/', [CampagneEvaluationController::class, 'index'])->name('index');
            Route::get('/create', [CampagneEvaluationController::class, 'create'])->name('create');
            Route::post('/', [CampagneEvaluationController::class, 'store'])->name('store');
            Route::get('/{campagneEvaluation}', [CampagneEvaluationController::class, 'show'])->name('show');
            Route::patch('/{campagneEvaluation}', [CampagneEvaluationController::class, 'update'])->name('update');
            Route::delete('/{campagneEvaluation}', [CampagneEvaluationController::class, 'destroy'])->name('destroy');

            Route::get('/{campagneEvaluation}/etablissements', function (CampagneEvaluation $campagneEvaluation) {
                return redirect()->route('dee.campagnes.show', $campagneEvaluation);
            })->name('etablissements');

            Route::post('/{campagneEvaluation}/etablissements/attach', [CampagneEtablissementController::class, 'attach'])
                ->name('etablissements.attach');
            Route::post('/{campagneEvaluation}/etablissements/{campagneEtablissement}/confirm', [CampagneEtablissementController::class, 'confirm'])
                ->name('etablissements.confirm');
            Route::delete('/{campagneEvaluation}/etablissements/{campagneEtablissement}/refuse', [CampagneEtablissementController::class, 'refuse'])
                ->name('etablissements.refuse');
        });

        // Dossiers DEE
        Route::prefix('dossiers')->name('dossiers.')->group(function () {
            Route::get('/', [DossierController::class, 'index'])->name('index');
            Route::get('/{dossier}', [DossierController::class, 'show'])->name('show');
            Route::patch('/{dossier}', [DossierController::class, 'update'])->name('update');
            Route::delete('/{dossier}', [DossierController::class, 'destroy'])->name('destroy');

            Route::post('/{dossier}/documents', [DossierDocumentController::class, 'store'])
                ->name('documents.store');
            Route::delete('/{dossier}/documents/{document}', [DossierDocumentController::class, 'destroy'])
                ->whereNumber('document')
                ->name('documents.destroy');

            Route::post('/{dossier}/experts', [DossierExpertController::class, 'store'])
                ->name('experts.store');
            Route::post('/{dossier}/experts/{dossierExpert}/confirm', [DossierExpertController::class, 'confirm'])
                ->name('experts.confirm');
            Route::delete('/{dossier}/experts/{dossierExpert}/refuse', [DossierExpertController::class, 'refuse'])
                ->name('experts.refuse');
            Route::delete('/{dossier}/experts/{dossierExpert}', [DossierExpertController::class, 'destroy'])
                ->name('experts.destroy');
        });

        // Workflow DEE
        Route::prefix('workflow')->name('workflow.')->group(function () {
            Route::get('/visites', [WorkflowController::class, 'visites'])->name('visites');
        });
    });

/*
|--------------------------------------------------------------------------
| Espace SI (Système d'Information)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:si'])
    ->prefix('si')
    ->name('si.')
    ->group(function () {

        // Dashboard SI
        Route::get('/dashboard', [SIDashboardController::class, 'index'])
            ->name('dashboard');

        // Utilisateurs DEE (gérés par SI)
        Route::prefix('utilisateurs-dee')->name('utilisateurs-dee.')->group(function () {
            Route::get('/', [UtilisateursDEEController::class, 'index'])->name('index');
            Route::get('/create', [UtilisateursDEEController::class, 'create'])->name('create');
            Route::post('/', [UtilisateursDEEController::class, 'store'])->name('store');
            Route::get('/{utilisateurDee}/edit', [UtilisateursDEEController::class, 'edit'])->name('edit');
            Route::patch('/{utilisateurDee}', [UtilisateursDEEController::class, 'update'])->name('update');
            Route::delete('/{utilisateurDee}', [UtilisateursDEEController::class, 'destroy'])->name('destroy');
        });

        // Experts SI
        Route::prefix('experts')->name('experts.')->group(function () {
            Route::get('/', [SIExpertController::class, 'index'])->name('index');
            Route::get('/create', [SIExpertController::class, 'create'])->name('create');
            Route::post('/', [SIExpertController::class, 'store'])->name('store');
            Route::get('/{expert}', [SIExpertController::class, 'show'])->name('show');
            Route::get('/{expert}/edit', [SIExpertController::class, 'edit'])->name('edit');
            Route::patch('/{expert}', [SIExpertController::class, 'update'])->name('update');
            Route::delete('/{expert}', [SIExpertController::class, 'destroy'])->name('destroy');
        });

        // Établissements SI
        Route::prefix('etablissements')->name('etablissements.')->group(function () {
            Route::get('/', [SIEtablissementController::class, 'index'])->name('index');
            Route::get('/create', [SIEtablissementController::class, 'create'])->name('create');
            Route::post('/', [SIEtablissementController::class, 'store'])->name('store');
            Route::get('/{etablissement}/edit', [SIEtablissementController::class, 'edit'])->name('edit');
            Route::patch('/{etablissement}', [SIEtablissementController::class, 'update'])->name('update');
            Route::delete('/{etablissement}', [SIEtablissementController::class, 'destroy'])->name('destroy');
        });

        // Universités SI
        Route::prefix('universites')->name('universites.')->group(function () {
            Route::get('/', [SIUniversiteController::class, 'index'])->name('index');
        });

        // Historique SI
        Route::get('/historique', [SIHistoriqueController::class, 'index'])->name('historique.index');
    });

/*
|--------------------------------------------------------------------------
| Espace Expert
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:expert'])
    ->prefix('expert')
    ->name('expert.')
    ->group(function () {

        // Dashboard Expert
        Route::get('/dashboard', [ExpertDashboardController::class, 'index'])
            ->name('dashboard');

        // Profil Expert
        Route::get('/profil', [ExpertProfilController::class, 'show'])
            ->name('profil.show');
        Route::get('/profil/modifier', [ExpertProfilController::class, 'edit'])
            ->name('profil.edit');
        Route::patch('/profil', [ExpertProfilController::class, 'update'])
            ->name('profil.update');

        // Dossiers assignés à l'expert
        Route::prefix('dossiers')->name('dossiers.')->group(function () {
            Route::get('/', [ExpertDossierController::class, 'index'])
                ->name('index');
            Route::get('/{dossier}', [ExpertDossierController::class, 'show'])
                ->name('show');
        });

        // Participations
        Route::prefix('participations')->name('participations.')->group(function () {
            Route::get('/', [ParticipationController::class, 'index'])
                ->name('index');
            Route::post('/{dossier}/confirmer', [ParticipationController::class, 'confirmer'])
                ->name('confirmer');
            Route::post('/{dossier}/refuser', [ParticipationController::class, 'refuser'])
                ->name('refuser');
        });

        // Évaluation quantitative
        Route::prefix('evaluations')->name('evaluations.')->group(function () {
            Route::get('/{dossier}', [EvaluationQuantitativeController::class, 'index'])
                ->name('index');
            Route::post('/{dossier}/sauvegarder', [EvaluationQuantitativeController::class, 'sauvegarder'])
                ->name('sauvegarder');
            Route::post('/{dossier}/soumettre', [EvaluationQuantitativeController::class, 'soumettre'])
                ->name('soumettre');
        });

        // Rapports Expert
        Route::prefix('rapports')->name('rapports.')->group(function () {
            Route::get('/', [RapportExpertController::class, 'index'])
                ->name('index');
            Route::get('/{dossier}/deposer', [RapportExpertController::class, 'create'])
                ->name('create');
            Route::post('/{dossier}', [RapportExpertController::class, 'store'])
                ->name('store');
            Route::get('/{rapport}/telecharger', [RapportExpertController::class, 'telecharger'])
                ->name('telecharger');
        });

        // Matrice de recommandations
        Route::prefix('recommandations')->name('recommandations.')->group(function () {
            Route::get('/{dossier}', [MatriceRecommandationController::class, 'index'])
                ->name('index');
            Route::post('/{dossier}/sauvegarder', [MatriceRecommandationController::class, 'sauvegarder'])
                ->name('sauvegarder');
            Route::post('/{dossier}/soumettre', [MatriceRecommandationController::class, 'soumettre'])
                ->name('soumettre');
        });

        // Historique participations
        Route::get('/historique', [HistoriqueParticipationController::class, 'index'])
            ->name('historique.index');

        // Notifications
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [NotificationExpertController::class, 'index'])
                ->name('index');
            Route::patch('/{notification}/lire', [NotificationExpertController::class, 'marquerLu'])
                ->name('lire');
        });
    });

/*
|--------------------------------------------------------------------------
| Espace Établissement
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:etablissement'])
    ->prefix('etablissement')
    ->name('etablissement.')
    ->group(function () {

        Route::get('/dashboard', [EtablissementDashboardController::class, 'index'])
            ->name('dashboard');

        Route::get('/profil', [EtablissementProfilController::class, 'show'])
            ->name('profil.show');
        Route::get('/profil/modifier', [EtablissementProfilController::class, 'edit'])
            ->name('profil.edit');
        Route::patch('/profil', [EtablissementProfilController::class, 'update'])
            ->name('profil.update');

        Route::prefix('documents')->name('documents.')->group(function () {
            Route::get('/', [EtablissementDocumentController::class, 'index'])
                ->name('index');
            Route::post('/', [EtablissementDocumentController::class, 'store'])
                ->name('store');
            Route::get('/{document}/telecharger', [EtablissementDocumentController::class, 'telecharger'])
                ->name('telecharger');
                Route::get('/{document}/voir', [EtablissementDocumentController::class, 'voir'])->name('voir');
        });
        


        Route::get('/annexes', [AnnexeController::class, 'index'])->name('annexes');
Route::post('/annexes', [AnnexeController::class, 'store'])->name('annexes.store');
Route::get('/annexes/{criterePreuve}/download', [AnnexeController::class, 'download'])->name('annexes.download');
Route::post('/annexes/note', [AnnexeController::class, 'saveNote'])->name('annexes.note');


// Document complémentaire
Route::get('/documents-complementaires', [EtablissementDocumentController::class, 'complementaires'])->name('documents.complementaires');
Route::post('/documents-complementaires', [EtablissementDocumentController::class, 'storeComplementaire'])->name('documents.complementaires.store');

// Rapport ANEAQ
Route::get('/rapport-aneaq', [EtablissementDocumentController::class, 'rapportAneaq'])->name('rapport.aneaq');

        Route::get('/notifications',                        [EtablissementNotificationController::class, 'index'])->name('notifications.index');
Route::patch('/notifications/{notification}/lire',  [EtablissementNotificationController::class, 'marquerLu'])->name('notifications.lire');
Route::patch('/notifications/tout-lire',            [EtablissementNotificationController::class, 'toutMarquerLu'])->name('notifications.toutLire');

Route::get('/historique', [EtablissementHistoriqueController::class, 'index'])->name('historique.index');
    });

/*
|--------------------------------------------------------------------------
| Routes Auth Breeze / Laravel
|--------------------------------------------------------------------------
*/

require __DIR__ . '/auth.php';