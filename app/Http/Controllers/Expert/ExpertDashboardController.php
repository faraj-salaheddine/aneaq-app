<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Mail\ExpertAcceptationDEEMail;
use App\Mail\ExpertRefusDEEMail;
use App\Models\DossierExpert;
use App\Models\NotificationAneaq;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ExpertDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $expert = $this->findExpertForUser($user);

        if (!$expert) {
            return Inertia::render('Expert/Dashboard', [
                'expert' => [
                    'id' => null,
                    'name' => $user->name ?? 'Expert',
                    'email' => $user->email ?? '—',
                ],
                'stats' => [
                    'dossiers_actifs' => 0,
                    'evaluations_en_cours' => 0,
                    'invitations_en_attente' => 0,
                    'rapports_a_deposer' => 0,
                ],
                'affectations' => [],
                'notifications' => [],
                'notificationsNonLues' => 0,
            ]);
        }

        $affectations = $this->getAffectationsForExpert($expert);

        $notifications = NotificationAneaq::where('user_id', Auth::id())
            ->latest()
            ->take(5)
            ->get();

        $notificationsNonLues = NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)
            ->count();

        return Inertia::render('Expert/Dashboard', [
            'expert' => [
                'id' => $expert->id,
                'name' => $this->expertFullName($expert),
                'email' => $expert->email ?? $user->email ?? '—',
            ],
            'stats' => [
                'dossiers_actifs' => $affectations->whereIn('status', ['confirme_par_expert', 'accepte_par_expert'])->count(),
                'evaluations_en_cours' => $affectations->whereIn('status', ['confirme_par_expert', 'accepte_par_expert'])->count(),
                'invitations_en_attente' => $affectations->whereIn('status', [
                    'en_attente_confirmation_expert',
                    'acces_envoye',
                ])->count(),
                'en_attente_dee' => 0,
                'rapports_a_deposer' => $affectations->whereIn('status', ['confirme_par_expert', 'accepte_par_expert'])->count(),
            ],
            'affectations'         => $affectations->values(),
            'notifications'        => $notifications,
            'notificationsNonLues' => $notificationsNonLues,
        ]);
    }

    public function accept(Request $request, DossierExpert $dossierExpert)
    {
        $this->authorizeExpertAffectation($dossierExpert);

        // Directly confirm the expert — DEE already validated by creating the account
        $payload = ['status' => 'confirme_par_expert'];

        if (Schema::hasColumn('dossier_experts', 'accepte_par_expert_at')) {
            $payload['accepte_par_expert_at'] = now();
        }

        if (Schema::hasColumn('dossier_experts', 'expert_confirmed_at')) {
            $payload['expert_confirmed_at'] = now();
        }

        if (Schema::hasColumn('dossier_experts', 'expert_refused_at')) {
            $payload['expert_refused_at'] = null;
        }

        if (Schema::hasColumn('dossier_experts', 'motif_refus')) {
            $payload['motif_refus'] = null;
        }

        $dossierExpert->forceFill($payload)->save();

        $dossier = DB::table('dossiers')->where('id', $dossierExpert->dossier_id)->first();
        $ref = $dossier?->reference ?? '—';
        $dossierId = $dossier?->id;

        try {
            NotificationAneaq::create([
                'user_id' => Auth::id(),
                'type'    => 'general',
                'titre'   => "Participation confirmée — {$ref}",
                'message' => "Vous avez rejoint le dossier {$ref}. Vous pouvez maintenant accéder à votre espace d'évaluation.",
                'lu'      => true,
            ]);
        } catch (\Throwable) {}

        // Notify all DEE admins (non-blocking)
        try {
            $this->notifyDeeAdmins($dossierExpert, 'accept');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ExpertDashboard accept notifyDeeAdmins: ' . $e->getMessage());
        }

        if ($dossierId) {
            return redirect()
                ->route('expert.dossiers.show', $dossierId)
                ->with('success', "Participation confirmée ! Vous avez accès au dossier {$ref}.");
        }

        return redirect()
            ->route('expert.dossiers.index')
            ->with('success', "Participation confirmée ! Vous avez accès au dossier {$ref}.");
    }

    public function refuse(Request $request, DossierExpert $dossierExpert)
    {
        $this->authorizeExpertAffectation($dossierExpert);

        $motif = $request->input('motif_refus', '');

        $payload = ['status' => 'refuse_par_expert'];

        if (Schema::hasColumn('dossier_experts', 'expert_refused_at')) {
            $payload['expert_refused_at'] = now();
        }

        if (Schema::hasColumn('dossier_experts', 'motif_refus')) {
            $payload['motif_refus'] = $motif;
        }

        if (Schema::hasColumn('dossier_experts', 'accepte_par_expert_at')) {
            $payload['accepte_par_expert_at'] = null;
        }

        $dossierExpert->forceFill($payload)->save();

        // Trace self-action for expert
        $dossierForTrace = DB::table('dossiers')->where('id', $dossierExpert->dossier_id)->first();
        $refForTrace = $dossierForTrace?->reference ?? '—';
        try {
            NotificationAneaq::create([
                'user_id' => Auth::id(),
                'type'    => 'general',
                'titre'   => "Invitation refusée — {$refForTrace}",
                'message' => "Vous avez refusé votre participation pour le dossier {$refForTrace}" . ($motif ? " — Motif : {$motif}" : '') . '.',
                'lu'      => true,
            ]);
        } catch (\Throwable) {}

        // Notify all DEE admins with motif (non-blocking)
        try {
            $this->notifyDeeAdmins($dossierExpert, 'refuse', $motif);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('ExpertDashboard refuse notifyDeeAdmins: ' . $e->getMessage());
        }

        return back()->with('success', 'Invitation refusée. La DEE a été notifiée.');
    }

    private function notifyDeeAdmins(DossierExpert $dossierExpert, string $action, string $motif = ''): void
    {
        $user       = Auth::user();
        $expertName = $user->name ?? 'Expert';
        $expertEmail = $user->email ?? '—';

        // Try to get full name from experts table
        if (Schema::hasTable('experts')) {
            $expertRow = DB::table('experts')
                ->where(function ($q) use ($user) {
                    if (Schema::hasColumn('experts', 'user_id')) $q->where('user_id', $user->id);
                    if (Schema::hasColumn('experts', 'email'))   $q->orWhere('email', $user->email);
                })->first();

            if ($expertRow) {
                $full = trim(($expertRow->prenom ?? '') . ' ' . ($expertRow->nom ?? ''));
                if ($full !== '') $expertName = $full;
            }
        }

        $dossier    = DB::table('dossiers')->where('id', $dossierExpert->dossier_id)->first();
        $ref        = $dossier?->reference ?? '—';
        $dossierUrl = config('app.url') . '/dee/dossiers/' . ($dossier?->id ?? '');
        $expertRole = match ($dossierExpert->role_expert) {
            'chef_comite' => 'Coordonnateur expert',
            default       => 'Expert',
        };

        $deeAdmins = User::where('role', 'admin_dee')->get();

        foreach ($deeAdmins as $admin) {
            // Platform notification
            try {
                if ($action === 'accept') {
                    NotificationAneaq::create([
                        'user_id' => $admin->id,
                        'type'    => 'general',
                        'titre'   => 'Expert a accepté — ' . $ref,
                        'message' => $expertName . ' (' . $expertRole . ') a accepté l\'invitation pour le dossier '
                            . $ref . '. Confirmez son affectation.',
                        'lu'      => false,
                    ]);
                } else {
                    NotificationAneaq::create([
                        'user_id' => $admin->id,
                        'type'    => 'general',
                        'titre'   => 'Expert a refusé — ' . $ref,
                        'message' => $expertName . ' (' . $expertRole . ') a refusé l\'invitation pour le dossier '
                            . $ref . ($motif ? ' — Motif : ' . $motif : '') . '.',
                        'lu'      => false,
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('ExpertDashboard notify DEE platform: ' . $e->getMessage());
            }

            // Email notification
            try {
                if ($action === 'accept') {
                    Mail::to($admin->email)->send(new ExpertAcceptationDEEMail(
                        expertName:       $expertName,
                        expertEmail:      $expertEmail,
                        expertRole:       $expertRole,
                        dossierReference: $ref,
                        dossierUrl:       $dossierUrl,
                    ));
                } else {
                    Mail::to($admin->email)->send(new ExpertRefusDEEMail(
                        expertName:       $expertName,
                        expertEmail:      $expertEmail,
                        expertRole:       $expertRole,
                        dossierReference: $ref,
                        motifRefus:       $motif,
                        dossierUrl:       $dossierUrl,
                    ));
                }
            } catch (\Throwable $e) {
                Log::error('ExpertDashboard mail DEE: ' . $e->getMessage());
            }
        }
    }

    private function findExpertForUser($user)
    {
        if (!$user || !Schema::hasTable('experts')) {
            return null;
        }

        $query = DB::table('experts');

        $query->where(function ($subQuery) use ($user) {
            $hasCondition = false;

            if (Schema::hasColumn('experts', 'user_id')) {
                $subQuery->where('user_id', $user->id);
                $hasCondition = true;
            }

            if (Schema::hasColumn('experts', 'email')) {
                if ($hasCondition) {
                    $subQuery->orWhere('email', $user->email);
                } else {
                    $subQuery->where('email', $user->email);
                }
            }
        });

        return $query->first();
    }

    private function getAffectationsForExpert($expert)
    {
        if (!Schema::hasTable('dossier_experts')) {
            return collect();
        }

        $orderColumn = Schema::hasColumn('dossier_experts', 'created_at') ? 'created_at' : 'id';

        $items = DB::table('dossier_experts')
            ->where('expert_id', $expert->id)
            ->orderByDesc($orderColumn)
            ->get();

        return $items->map(function ($item) {
            $dossier = $this->findDossier($item->dossier_id ?? null);
            $etablissement = $this->findEtablissementForDossier($dossier);
            $comite = $this->getComiteForDossier($item->dossier_id ?? null);

            $confirmedCount = $comite
                ->filter(fn ($member) => $member['status'] === 'confirme_par_expert')
                ->count();

            return [
                'id' => $item->id,
                'status' => $item->status ?? 'en_attente_confirmation_expert',
                'status_label' => $this->statusLabel($item->status ?? null),
                'role' => $item->role_expert ?? 'expert',
                'role_label' => $this->roleLabel($item->role_expert ?? 'expert'),
                'access_sent_at' => $this->formatDate($item->access_sent_at ?? null),
                'expert_confirmed_at' => $this->formatDate($item->expert_confirmed_at ?? null),
                'expert_refused_at' => $this->formatDate($item->expert_refused_at ?? null),

                'dossier' => [
                    'id' => $dossier->id ?? null,
                    'reference' => $this->rowValue($dossier, ['reference'], '—'),
                    'nom' => $this->rowValue($dossier, ['nom', 'name', 'titre'], 'Dossier'),
                    'statut' => $this->rowValue($dossier, ['statut', 'status'], '—'),
                    'date_visite' => $this->rowValue($dossier, ['date_visite', 'date_visite_planifiee'], null),
                    'url' => isset($dossier->id) ? '/expert/dossiers/' . $dossier->id : null,
                ],

                'etablissement' => [
                    'nom' => $this->rowValue($etablissement, [
                        'etablissement_2',
                        'etablissement',
                        'nom',
                        'name',
                    ], '—'),
                    'ville' => $this->rowValue($etablissement, ['ville'], '—'),
                    'universite' => $this->rowValue($etablissement, ['universite', 'universite_nom'], '—'),
                    'email' => $this->rowValue($etablissement, ['email', 'mail'], '—'),
                ],

                'comite' => $comite->values(),
                'comite_confirmed_count' => $confirmedCount,
                'comite_total' => $comite->count(),
                'comite_completed' => $confirmedCount >= 3,
            ];
        });
    }

    private function findDossier($dossierId)
    {
        if (!$dossierId || !Schema::hasTable('dossiers')) {
            return null;
        }

        return DB::table('dossiers')
            ->where('id', $dossierId)
            ->first();
    }

    private function findEtablissementForDossier($dossier)
    {
        if (!$dossier || !Schema::hasTable('etablissements')) {
            return null;
        }

        if (isset($dossier->etablissement_id) && $dossier->etablissement_id) {
            return DB::table('etablissements')
                ->where('id', $dossier->etablissement_id)
                ->first();
        }

        if (
            isset($dossier->campagne_etablissement_id)
            && $dossier->campagne_etablissement_id
            && Schema::hasTable('campagne_etablissements')
        ) {
            $rattachement = DB::table('campagne_etablissements')
                ->where('id', $dossier->campagne_etablissement_id)
                ->first();

            if ($rattachement && isset($rattachement->etablissement_id)) {
                return DB::table('etablissements')
                    ->where('id', $rattachement->etablissement_id)
                    ->first();
            }
        }

        return null;
    }

    private function getComiteForDossier($dossierId)
    {
        if (!$dossierId || !Schema::hasTable('dossier_experts')) {
            return collect();
        }

        $assignments = DB::table('dossier_experts')
            ->where('dossier_id', $dossierId)
            ->get();

        if ($assignments->isEmpty()) {
            return collect();
        }

        $expertIds = $assignments
            ->pluck('expert_id')
            ->filter()
            ->unique()
            ->values();

        $experts = collect();

        if (Schema::hasTable('experts') && $expertIds->isNotEmpty()) {
            $experts = DB::table('experts')
                ->whereIn('id', $expertIds)
                ->get()
                ->keyBy('id');
        }

        return $assignments->map(function ($assignment) use ($experts) {
            $expert = $experts->get($assignment->expert_id);

            return [
                'id' => $assignment->id,
                'expert_id' => $assignment->expert_id,
                'name' => $this->expertFullName($expert),
                'email' => $this->rowValue($expert, ['email'], '—'),
                'role' => $assignment->role_expert ?? 'expert',
                'role_label' => $this->roleLabel($assignment->role_expert ?? 'expert'),
                'status' => $assignment->status ?? '—',
                'status_label' => $this->statusLabel($assignment->status ?? null),
                'confirmed_at' => $this->formatDate($assignment->expert_confirmed_at ?? null),
            ];
        });
    }

    private function authorizeExpertAffectation(DossierExpert $dossierExpert): void
    {
        $user = Auth::user();

        if (!$user || !Schema::hasTable('experts')) {
            abort(403, 'Accès refusé.');
        }

        $query = DB::table('experts')
            ->where('id', $dossierExpert->expert_id);

        $query->where(function ($subQuery) use ($user) {
            $hasCondition = false;

            if (Schema::hasColumn('experts', 'user_id')) {
                $subQuery->where('user_id', $user->id);
                $hasCondition = true;
            }

            if (Schema::hasColumn('experts', 'email')) {
                if ($hasCondition) {
                    $subQuery->orWhere('email', $user->email);
                } else {
                    $subQuery->where('email', $user->email);
                }
            }
        });

        $expert = $query->first();

        if (!$expert) {
            abort(403, 'Accès refusé.');
        }
    }

    private function updateDossierCommitteeStatus($dossierId): void
    {
        if (!$dossierId || !Schema::hasTable('dossiers') || !Schema::hasTable('dossier_experts')) {
            return;
        }

        $confirmedCount = DB::table('dossier_experts')
            ->where('dossier_id', $dossierId)
            ->where('status', 'confirme_par_expert')
            ->count();

        if ($confirmedCount < 3) {
            return;
        }

        $payload = [];

        if (Schema::hasColumn('dossiers', 'statut')) {
            $payload['statut'] = 'comite_confirme';
        }

        if (Schema::hasColumn('dossiers', 'status')) {
            $payload['status'] = 'comite_confirme';
        }

        if (!empty($payload)) {
            DB::table('dossiers')
                ->where('id', $dossierId)
                ->update($payload);
        }
    }

    private function expertFullName($expert): string
    {
        if (!$expert) {
            return 'Expert';
        }

        $prenom = $expert->prenom ?? '';
        $nom = $expert->nom ?? '';
        $fullName = trim($prenom . ' ' . $nom);

        if ($fullName !== '') {
            return $fullName;
        }

        if (!empty($expert->name)) {
            return $expert->name;
        }

        if (!empty($expert->email)) {
            return $expert->email;
        }

        return 'Expert';
    }

    private function rowValue($row, array $columns, $default = '—')
    {
        if (!$row) {
            return $default;
        }

        $data = (array) $row;

        foreach ($columns as $column) {
            if (array_key_exists($column, $data) && $data[$column] !== null && $data[$column] !== '') {
                return $data[$column];
            }
        }

        return $default;
    }

    private function formatDate($value): ?string
    {
        if (!$value) {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($value)->format('d/m/Y H:i');
        } catch (\Throwable $e) {
            return (string) $value;
        }
    }

    private function statusLabel(?string $status): string
    {
        return match ($status) {
            'en_attente_confirmation_dee'    => 'En attente DEE',
            'en_attente_confirmation_expert' => 'Invitation reçue',
            'acces_envoye'                   => 'Invitation reçue',
            'accepte_par_expert'             => 'Acceptée — en attente DEE',
            'confirme_par_expert'            => 'Affectation confirmée',
            'refuse_par_expert'              => 'Refusée',
            'comite_confirme'                => 'Comité confirmé',
            default => $status ?: '—',
        };
    }

    private function roleLabel(?string $role): string
    {
        return match ($role) {
            'chef_comite' => 'Coordonnateur expert',
            'expert' => 'Expert',
            default => $role ?: 'Expert',
        };
    }
}