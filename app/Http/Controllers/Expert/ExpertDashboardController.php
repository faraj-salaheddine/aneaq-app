<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\DossierExpert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('Expert/Dashboard', [
            'expert' => [
                'id' => $expert->id,
                'name' => $this->expertFullName($expert),
                'email' => $expert->email ?? $user->email ?? '—',
            ],
            'stats' => [
                'dossiers_actifs' => $affectations->where('status', 'confirme_par_expert')->count(),
                'evaluations_en_cours' => $affectations->where('status', 'confirme_par_expert')->count(),
                'invitations_en_attente' => $affectations->whereIn('status', [
                    'en_attente_confirmation_expert',
                    'acces_envoye',
                ])->count(),
                'rapports_a_deposer' => $affectations->where('status', 'confirme_par_expert')->count(),
            ],
            'affectations' => $affectations->values(),
            'notifications' => [],
            'notificationsNonLues' => 0,
        ]);
    }

    public function accept(Request $request, DossierExpert $dossierExpert)
    {
        $this->authorizeExpertAffectation($dossierExpert);

        $payload = [];

        if (Schema::hasColumn('dossier_experts', 'status')) {
            $payload['status'] = 'confirme_par_expert';
        }

        if (Schema::hasColumn('dossier_experts', 'expert_confirmed_at')) {
            $payload['expert_confirmed_at'] = now();
        }

        if (Schema::hasColumn('dossier_experts', 'expert_refused_at')) {
            $payload['expert_refused_at'] = null;
        }

        if (!empty($payload)) {
            $dossierExpert->forceFill($payload)->save();
        }

        $this->updateDossierCommitteeStatus($dossierExpert->dossier_id);

        return back()->with('success', 'Participation confirmée avec succès.');
    }

    public function refuse(Request $request, DossierExpert $dossierExpert)
    {
        $this->authorizeExpertAffectation($dossierExpert);

        $payload = [];

        if (Schema::hasColumn('dossier_experts', 'status')) {
            $payload['status'] = 'refuse_par_expert';
        }

        if (Schema::hasColumn('dossier_experts', 'expert_refused_at')) {
            $payload['expert_refused_at'] = now();
        }

        if (!empty($payload)) {
            $dossierExpert->forceFill($payload)->save();
        }

        return back()->with('success', 'Participation refusée.');
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
            'en_attente_confirmation_dee' => 'En attente confirmation DEE',
            'en_attente_confirmation_expert' => 'À confirmer',
            'acces_envoye' => 'À confirmer',
            'confirme_par_expert' => 'Confirmé',
            'refuse_par_expert' => 'Refusé',
            default => $status ?: '—',
        };
    }

    private function roleLabel(?string $role): string
    {
        return match ($role) {
            'chef_comite' => 'Chef de comité',
            'expert' => 'Expert',
            default => $role ?: 'Expert',
        };
    }
}