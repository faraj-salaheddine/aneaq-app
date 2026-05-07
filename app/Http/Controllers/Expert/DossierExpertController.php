<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DossierExpertController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $expert = $this->findExpertForUser($user);

        if (!$expert) {
            return Inertia::render('Expert/Dossiers/Index', [
                'expert' => [
                    'id' => null,
                    'nom' => $user->name ?? 'Expert',
                    'prenom' => '',
                    'email' => $user->email ?? '—',
                ],
                'dossiers' => [],
            ]);
        }

        $assignments = $this->confirmedAssignmentsForExpert($expert->id);

        $dossiers = $assignments
            ->map(function ($assignment) {
                $dossier = $this->findDossier($assignment->dossier_id ?? null);

                if (!$dossier) {
                    return null;
                }

                $etablissement = $this->findEtablissementForDossier($dossier);

                return [
                    'id' => $dossier->id,
                    'reference' => $this->rowValue($dossier, ['reference'], '—'),
                    'vague' => $this->rowValue($dossier, ['campagne', 'campagne_reference', 'vague'], '—'),
                    'statut' => $this->rowValue($dossier, ['statut', 'status'], '—'),
                    'date_visite' => $this->rowValue($dossier, ['date_visite', 'date_visite_planifiee'], null),
                    'observation' => $this->rowValue($dossier, ['observation', 'description'], ''),
                    'acronyme' => $this->rowValue($etablissement, ['acronyme'], ''),
                    'nom' => $this->rowValue($etablissement, ['etablissement_2', 'etablissement', 'nom', 'name'], '—'),
                    'ville' => $this->rowValue($etablissement, ['ville'], '—'),
                    'universite' => $this->rowValue($etablissement, ['universite', 'universite_nom'], '—'),
                    'domaine_connaissances' => $this->rowValue($etablissement, ['domaine_connaissances', 'domaine'], '—'),
                    'role_comite' => $this->roleLabel($assignment->role_expert ?? 'expert'),
                    'assignment_id' => $assignment->id,
                    'confirmed_at' => $this->formatDate($assignment->expert_confirmed_at ?? null),
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('Expert/Dossiers/Index', [
            'expert' => [
                'id' => $expert->id,
                'nom' => $expert->nom ?? $expert->name ?? 'Expert',
                'prenom' => $expert->prenom ?? '',
                'email' => $expert->email ?? $user->email ?? '—',
            ],
            'dossiers' => $dossiers,
        ]);
    }

    public function show(Dossier $dossier): Response
    {
        $user = Auth::user();
        $expert = $this->findExpertForUser($user);

        if (!$expert) {
            abort(403, 'Expert introuvable.');
        }

        $this->authorizeDossier($expert->id, $dossier->id);

        $dossierRow = DB::table('dossiers')
            ->where('id', $dossier->id)
            ->first();

        $etablissement = $this->findEtablissementForDossier($dossierRow);

        $comite = $this->getComiteForDossier($dossier->id);

        $progression = $this->calculateProgression($expert->id, $dossier->id);

        $rapport = $this->findRapport($expert->id, $dossier->id);

        $nbRecommandations = $this->countRecommandations($expert->id, $dossier->id);

        $dossierPayload = array_merge($dossier->toArray(), [
            'id' => $dossier->id,
            'reference' => $this->rowValue($dossierRow, ['reference'], $dossier->reference ?? '—'),
            'campagne' => $this->rowValue($dossierRow, ['campagne', 'campagne_reference', 'vague'], $dossier->campagne ?? '—'),
            'statut' => $this->rowValue($dossierRow, ['statut', 'status'], $dossier->statut ?? '—'),
            'date_visite' => $this->rowValue($dossierRow, ['date_visite', 'date_visite_planifiee'], $dossier->date_visite ?? null),
            'observation' => $this->rowValue($dossierRow, ['observation', 'description'], $dossier->observation ?? ''),
            'etablissement' => [
                'id' => $etablissement->id ?? null,
                'acronyme' => $this->rowValue($etablissement, ['acronyme'], ''),
                'etablissement_2' => $this->rowValue($etablissement, ['etablissement_2', 'etablissement', 'nom', 'name'], '—'),
                'nom' => $this->rowValue($etablissement, ['etablissement_2', 'etablissement', 'nom', 'name'], '—'),
                'ville' => $this->rowValue($etablissement, ['ville'], '—'),
                'universite' => $this->rowValue($etablissement, ['universite', 'universite_nom'], '—'),
                'email' => $this->rowValue($etablissement, ['email', 'mail'], '—'),
                'domaine_connaissances' => $this->rowValue($etablissement, ['domaine_connaissances', 'domaine'], '—'),
            ],
        ]);

        return Inertia::render('Expert/Dossiers/Show', [
            'expert' => [
                'id' => $expert->id,
                'nom' => $expert->nom ?? $expert->name ?? 'Expert',
                'prenom' => $expert->prenom ?? '',
                'email' => $expert->email ?? $user->email ?? '—',
            ],
            'dossier' => $dossierPayload,
            'comite' => $comite,
            'progression' => $progression,
            'rapport' => $rapport,
            'nbRecommandations' => $nbRecommandations,
        ]);
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

    private function confirmedAssignmentsForExpert($expertId)
    {
        if (!$expertId || !Schema::hasTable('dossier_experts')) {
            return collect();
        }

        $orderColumn = Schema::hasColumn('dossier_experts', 'created_at')
            ? 'created_at'
            : 'id';

        return DB::table('dossier_experts')
            ->where('expert_id', $expertId)
            ->where(function ($query) {
                if (Schema::hasColumn('dossier_experts', 'status')) {
                    $query->whereIn('status', [
                        'confirme_par_expert',
                        'comite_confirme',
                    ]);
                }
            })
            ->orderByDesc($orderColumn)
            ->get();
    }

    private function authorizeDossier($expertId, $dossierId): void
    {
        if (!$expertId || !$dossierId) {
            abort(403, 'Accès refusé.');
        }

        $authorized = false;

        if (Schema::hasTable('dossier_experts')) {
            $query = DB::table('dossier_experts')
                ->where('expert_id', $expertId)
                ->where('dossier_id', $dossierId);

            if (Schema::hasColumn('dossier_experts', 'status')) {
                $query->whereIn('status', [
                    'confirme_par_expert',
                    'comite_confirme',
                ]);
            }

            $authorized = $query->exists();
        }

        if (!$authorized && Schema::hasTable('expert_dossier')) {
            $legacyQuery = DB::table('expert_dossier')
                ->where('expert_id', $expertId)
                ->where('dossier_id', $dossierId);

            if (Schema::hasColumn('expert_dossier', 'statut_participation')) {
                $legacyQuery->where('statut_participation', 'confirme');
            }

            $authorized = $legacyQuery->exists();
        }

        abort_unless($authorized, 403, 'Accès refusé.');
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

        return $assignments
            ->map(function ($assignment) use ($experts) {
                $expert = $experts->get($assignment->expert_id);

                return [
                    'id' => $assignment->id,
                    'expert_id' => $assignment->expert_id,
                    'nom' => $expert->nom ?? '',
                    'prenom' => $expert->prenom ?? '',
                    'name' => $this->expertFullName($expert),
                    'email' => $this->rowValue($expert, ['email'], '—'),
                    'grade' => $this->rowValue($expert, ['grade'], '—'),
                    'specialite' => $this->rowValue($expert, ['specialite'], '—'),
                    'role_comite' => $this->roleLabel($assignment->role_expert ?? 'expert'),
                    'role_expert' => $assignment->role_expert ?? 'expert',
                    'status' => $assignment->status ?? '—',
                    'status_label' => $this->statusLabel($assignment->status ?? null),
                    'confirmed_at' => $this->formatDate($assignment->expert_confirmed_at ?? null),
                ];
            })
            ->values();
    }

    private function calculateProgression($expertId, $dossierId): int
    {
        if (
            !Schema::hasTable('criteres_evaluation')
            || !Schema::hasTable('evaluations_quantitatives')
        ) {
            return 0;
        }

        $totalCriteres = DB::table('criteres_evaluation')
            ->whereNotNull('parent_id')
            ->count();

        if ($totalCriteres <= 0) {
            return 0;
        }

        $criteresSaisis = DB::table('evaluations_quantitatives')
            ->where('dossier_id', $dossierId)
            ->where('expert_id', $expertId)
            ->whereNotNull('note')
            ->count();

        return (int) round(($criteresSaisis / $totalCriteres) * 100);
    }

    private function findRapport($expertId, $dossierId)
    {
        if (!Schema::hasTable('rapports_experts')) {
            return null;
        }

        return DB::table('rapports_experts')
            ->where('dossier_id', $dossierId)
            ->where('expert_id', $expertId)
            ->first();
    }

    private function countRecommandations($expertId, $dossierId): int
    {
        if (!Schema::hasTable('matrices_recommandations')) {
            return 0;
        }

        return DB::table('matrices_recommandations')
            ->where('dossier_id', $dossierId)
            ->where('expert_id', $expertId)
            ->count();
    }

    private function rowValue($row, array $columns, $default = '—')
    {
        if (!$row) {
            return $default;
        }

        $data = (array) $row;

        foreach ($columns as $column) {
            if (
                array_key_exists($column, $data)
                && $data[$column] !== null
                && $data[$column] !== ''
            ) {
                return $data[$column];
            }
        }

        return $default;
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
            'en_attente_confirmation_dee' => 'En attente DEE',
            'en_attente_confirmation_expert' => 'À confirmer',
            'acces_envoye' => 'À confirmer',
            'confirme_par_expert' => 'Confirmé',
            'refuse_par_expert' => 'Refusé',
            'comite_confirme' => 'Comité confirmé',
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