<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class HistoriqueParticipationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $expert = $this->findExpertForUser($user);

        if (!$expert) {
            return Inertia::render('Expert/Historique/Index', [
                'expert' => [
                    'id' => null,
                    'name' => $user->name ?? 'Expert',
                    'email' => $user->email ?? '',
                ],
                'participations' => [],
            ]);
        }

        $assignments = $this->getAssignments($expert->id);

        $participations = $assignments
            ->map(function ($assignment) use ($expert) {
                $dossier = $this->findDossier($assignment->dossier_id ?? null);

                if (!$dossier) {
                    return null;
                }

                $etablissement = $this->findEtablissementForDossier($dossier);
                $campagne = $this->findCampagneForDossier($dossier);
                $rapport = $this->findRapport($expert->id, $dossier->id);

                $status = $this->rowValue($assignment, ['status', 'statut_participation'], '—');
                $dossierStatus = $this->rowValue($dossier, ['statut', 'status'], '—');

                return [
                    'id' => $dossier->id,
                    'dossier_id' => $dossier->id,
                    'assignment_id' => $assignment->id ?? null,

                    'reference' => $this->rowValue($dossier, ['reference'], '—'),
                    'campagne' => $this->campagneLabel($campagne, $dossier),
                    'statut_dossier' => $dossierStatus,

                    'etablissement' => $this->rowValue($etablissement, ['etablissement_2', 'etablissement', 'nom', 'name'], '—'),
                    'acronyme' => $this->rowValue($etablissement, ['acronyme'], ''),
                    'ville' => $this->rowValue($etablissement, ['ville'], '—'),
                    'universite' => $this->rowValue($etablissement, ['universite', 'universite_nom'], '—'),

                    'role_comite' => $this->roleLabel($this->rowValue($assignment, ['role_expert', 'role_comite', 'role'], 'expert')),
                    'status' => $status,
                    'status_label' => $this->statusLabel($status),

                    'date_invitation' => $this->formatDate($this->rowValue($assignment, ['created_at', 'date_invitation'], null)),
                    'date_reponse' => $this->formatDate(
                        $this->rowValue($assignment, ['expert_confirmed_at', 'expert_refused_at', 'date_reponse', 'updated_at'], null)
                    ),

                    'timeline' => [
                        [
                            'event'     => 'invitation_envoyee',
                            'label'     => 'Invitation envoyée par la DEE',
                            'date'      => $this->formatDate($this->rowValue($assignment, ['invitation_sent_at', 'access_sent_at', 'created_at'], null)),
                            'done'      => true,
                        ],
                        [
                            'event'     => 'expert_accepte',
                            'label'     => 'Invitation acceptée par l\'expert',
                            'date'      => $this->formatDate($this->rowValue($assignment, ['accepte_par_expert_at', 'expert_confirmed_at'], null)),
                            'done'      => !empty($assignment->accepte_par_expert_at ?? $assignment->expert_confirmed_at ?? null),
                        ],
                        [
                            'event'     => 'dee_confirme',
                            'label'     => 'Confirmation définitive par la DEE',
                            'date'      => $this->formatDate($this->rowValue($assignment, ['dee_confirmed_at', 'validated_by_dee_at', 'confirmed_at'], null)),
                            'done'      => !empty($assignment->dee_confirmed_at ?? $assignment->validated_by_dee_at ?? $assignment->confirmed_at ?? null),
                        ],
                    ],
                    'motif_refus' => $assignment->motif_refus ?? null,

                    'rapport_id' => $rapport->id ?? null,
                    'rapport_statut' => $this->rowValue($rapport, ['statut', 'status'], null),
                    'rapport_statut_label' => $this->rapportStatusLabel($this->rowValue($rapport, ['statut', 'status'], null)),
                    'rapport_nom' => $this->rowValue($rapport, ['original_name', 'titre', 'fichier'], null),
                    'date_depot_rapport' => $this->formatDate($this->rowValue($rapport, ['date_depot', 'submitted_at', 'created_at', 'updated_at'], null)),

                    'is_confirmed' => in_array($status, ['confirme_par_expert', 'comite_confirme', 'confirme'], true),
                    'is_refused' => in_array($status, ['refuse_par_expert', 'refuse'], true),
                    'is_closed' => in_array($dossierStatus, ['valide', 'cloture', 'clôturé', 'cloturé'], true),
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('Expert/Historique/Index', [
            'expert' => [
                'id' => $expert->id,
                'name' => $this->expertFullName($expert),
                'email' => $expert->email ?? $user->email ?? '',
            ],
            'participations' => $participations,
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

    private function getAssignments($expertId)
    {
        if (!$expertId) {
            return collect();
        }

        if (Schema::hasTable('dossier_experts')) {
            $orderColumn = Schema::hasColumn('dossier_experts', 'created_at')
                ? 'created_at'
                : 'id';

            return DB::table('dossier_experts')
                ->where('expert_id', $expertId)
                ->orderByDesc($orderColumn)
                ->get();
        }

        if (Schema::hasTable('expert_dossier')) {
            $orderColumn = Schema::hasColumn('expert_dossier', 'created_at')
                ? 'created_at'
                : 'id';

            return DB::table('expert_dossier')
                ->where('expert_id', $expertId)
                ->orderByDesc($orderColumn)
                ->get();
        }

        return collect();
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

    private function findCampagneForDossier($dossier)
    {
        if (!$dossier || !Schema::hasTable('campagne_evaluations')) {
            return null;
        }

        if (isset($dossier->campagne_evaluation_id) && $dossier->campagne_evaluation_id) {
            return DB::table('campagne_evaluations')
                ->where('id', $dossier->campagne_evaluation_id)
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

            if ($rattachement && isset($rattachement->campagne_evaluation_id)) {
                return DB::table('campagne_evaluations')
                    ->where('id', $rattachement->campagne_evaluation_id)
                    ->first();
            }
        }

        return null;
    }

    private function findRapport($expertId, $dossierId)
    {
        if (
            !$expertId
            || !$dossierId
            || !Schema::hasTable('rapports_experts')
            || !Schema::hasColumn('rapports_experts', 'expert_id')
            || !Schema::hasColumn('rapports_experts', 'dossier_id')
        ) {
            return null;
        }

        return DB::table('rapports_experts')
            ->where('expert_id', $expertId)
            ->where('dossier_id', $dossierId)
            ->orderByDesc(Schema::hasColumn('rapports_experts', 'created_at') ? 'created_at' : 'id')
            ->first();
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

    private function campagneLabel($campagne, $dossier): string
    {
        $label = $this->rowValue($campagne, [
            'reference',
            'titre',
            'nom',
            'libelle',
            'name',
        ], null);

        if ($label) {
            return (string) $label;
        }

        return (string) $this->rowValue($dossier, ['campagne', 'vague', 'campagne_reference'], '—');
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
        if (!$value || $value === '—') {
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
            'confirme_par_expert' => 'Confirmée',
            'comite_confirme' => 'Comité confirmé',
            'refuse_par_expert' => 'Refusée',
            'confirme' => 'Confirmée',
            'refuse' => 'Refusée',
            default => $status ?: '—',
        };
    }

    private function rapportStatusLabel(?string $status): string
    {
        return match ($status) {
            'brouillon' => 'Brouillon',
            'depose' => 'Déposé',
            'transmis_dee' => 'Transmis DEE',
            'valide_dee' => 'Validé DEE',
            'retourne_correction' => 'Retourné pour correction',
            'valide' => 'Validé',
            'rejete' => 'Rejeté',
            default => $status ?: 'Non déposé',
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