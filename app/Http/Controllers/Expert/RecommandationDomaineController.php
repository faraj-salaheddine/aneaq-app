<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class RecommandationDomaineController extends Controller
{
    public function index(Dossier $dossier)
    {
        $user   = Auth::user();
        $expert = $this->findExpertForUser($user);

        if (!$expert) {
            abort(403, 'Expert introuvable.');
        }

        $this->autoriser($expert->id, $dossier->id);

        $domaines        = $this->getDomaines();
        $recommandations = $this->getRecommandations($expert->id, $dossier->id);

        $dossierRow    = DB::table('dossiers')->where('id', $dossier->id)->first();
        $etablissement = $this->findEtablissementForDossier($dossierRow);

        return Inertia::render('Expert/Recommandations/Domaines', [
            'expert' => [
                'id'     => $expert->id,
                'nom'    => $expert->nom    ?? $expert->name ?? 'Expert',
                'prenom' => $expert->prenom ?? '',
            ],
            'dossier' => [
                'id'        => $dossier->id,
                'reference' => $dossierRow->reference ?? '—',
                'campagne'  => $dossierRow->campagne   ?? $dossierRow->campagne_reference ?? '—',
                'etablissement' => [
                    'acronyme' => $etablissement->acronyme ?? '',
                    'ville'    => $etablissement->ville    ?? '—',
                ],
            ],
            'domaines'        => $domaines,
            'recommandations' => $recommandations,
        ]);
    }

    public function store(Request $request, Dossier $dossier)
    {
        $user   = Auth::user();
        $expert = $this->findExpertForUser($user);
        if (!$expert) abort(403);
        $this->autoriser($expert->id, $dossier->id);

        $validated = $request->validate([
            'domaine_code'   => 'nullable|string|max:10',
            'recommandation' => 'required|string|max:3000',
            'urgence'        => 'required|in:rouge,orange,vert',
        ]);

        $this->ensureTable();

        DB::table('recommandations_domaines')->insert([
            'dossier_id'     => $dossier->id,
            'expert_id'      => $expert->id,
            'domaine_code'   => $validated['domaine_code'] ?? null,
            'recommandation' => $validated['recommandation'],
            'urgence'        => $validated['urgence'],
            'statut'         => 'brouillon',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return back()->with('success', 'Recommandation enregistrée en brouillon.');
    }

    public function update(Request $request, Dossier $dossier, int $recommandation)
    {
        $user   = Auth::user();
        $expert = $this->findExpertForUser($user);
        if (!$expert) abort(403);
        $this->autoriser($expert->id, $dossier->id);

        $validated = $request->validate([
            'recommandation' => 'required|string|max:3000',
            'urgence'        => 'required|in:rouge,orange,vert',
        ]);

        $this->ensureTable();

        $rec = DB::table('recommandations_domaines')
            ->where('id', $recommandation)
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->first();

        abort_unless($rec, 404);
        abort_unless(in_array($rec->statut ?? 'brouillon', ['brouillon', 'renvoyee_expert']), 403, 'Cette recommandation ne peut plus être modifiée.');

        DB::table('recommandations_domaines')
            ->where('id', $recommandation)
            ->update([
                'recommandation'      => $validated['recommandation'],
                'urgence'             => $validated['urgence'],
                'commentaire_revision' => $request->commentaire_revision ?? null,
                'updated_at'          => now(),
            ]);

        return back()->with('success', 'Recommandation mise à jour.');
    }

    public function destroy(Dossier $dossier, int $recommandation)
    {
        $user   = Auth::user();
        $expert = $this->findExpertForUser($user);
        if (!$expert) abort(403);
        $this->autoriser($expert->id, $dossier->id);

        $this->ensureTable();

        $rec = DB::table('recommandations_domaines')
            ->where('id', $recommandation)
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->first();

        abort_unless($rec, 404);
        abort_unless(($rec->statut ?? 'brouillon') === 'brouillon', 403, 'Seuls les brouillons peuvent être supprimés.');

        DB::table('recommandations_domaines')
            ->where('id', $recommandation)
            ->delete();

        return back()->with('success', 'Recommandation supprimée.');
    }

    public function soumettre(Dossier $dossier)
    {
        $user   = Auth::user();
        $expert = $this->findExpertForUser($user);
        if (!$expert) abort(403);
        $this->autoriser($expert->id, $dossier->id);

        $this->ensureTable();

        $count = DB::table('recommandations_domaines')
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->whereIn('statut', ['brouillon', 'renvoyee_expert'])
            ->count();

        abort_if($count === 0, 422, 'Aucune recommandation à soumettre.');

        DB::table('recommandations_domaines')
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->whereIn('statut', ['brouillon', 'renvoyee_expert'])
            ->update([
                'statut'              => 'soumise_dee',
                'date_soumission_dee' => now(),
                'updated_at'          => now(),
            ]);

        // Notifier les admins DEE
        $dossierRow = DB::table('dossiers')->where('id', $dossier->id)->first();
        $ref = $dossierRow->reference ?? "#{$dossier->id}";
        $expertNom = trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) ?: ($expert->name ?? 'Expert');

        $deeAdmins = DB::table('users')->where('role', 'admin_dee')->pluck('id');
        foreach ($deeAdmins as $adminId) {
            try {
                \App\Models\NotificationAneaq::envoyer(
                    $adminId, 'general',
                    "Recommandations soumises — {$ref}",
                    "{$expertNom} a soumis {$count} recommandation(s) pour le dossier {$ref}. En attente de votre validation.",
                    'Dossier', $dossier->id
                );
            } catch (\Throwable) {}
        }

        return back()->with('success', "{$count} recommandation(s) soumise(s) à la DEE.");
    }

    /* ── Private helpers ── */

    private function getDomaines(): array
    {
        // Primary source: criteres table (seeded with domains A-E)
        if (Schema::hasTable('criteres') && Schema::hasColumn('criteres', 'domaine')) {
            return DB::table('criteres')
                ->select('domaine as id', 'domaine as code', 'domaine_label as libelle')
                ->distinct()
                ->orderBy('domaine')
                ->get()
                ->toArray();
        }

        // Fallback: criteres_evaluation with parent_id IS NULL
        if (Schema::hasTable('criteres_evaluation')) {
            return DB::table('criteres_evaluation')
                ->whereNull('parent_id')
                ->orderBy(Schema::hasColumn('criteres_evaluation', 'ordre') ? 'ordre' : 'id')
                ->get(['id', 'code', 'libelle'])
                ->toArray();
        }

        return [];
    }

    private function getRecommandations(int $expertId, int $dossierId): array
    {
        if (!Schema::hasTable('recommandations_domaines')) {
            return [];
        }

        return DB::table('recommandations_domaines')
            ->where('expert_id', $expertId)
            ->where('dossier_id', $dossierId)
            ->orderBy('domaine_code')
            ->orderByDesc('created_at')
            ->get()
            ->toArray();
    }

    private function ensureTable(): void
    {
        if (Schema::hasTable('recommandations_domaines')) {
            return;
        }

        DB::statement("
            CREATE TABLE recommandations_domaines (
                id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                dossier_id      BIGINT UNSIGNED NOT NULL,
                expert_id       BIGINT UNSIGNED NOT NULL,
                domaine_code    VARCHAR(10) NULL,
                recommandation  TEXT NOT NULL,
                urgence         ENUM('rouge','orange','vert') NOT NULL DEFAULT 'vert',
                created_at      TIMESTAMP NULL,
                updated_at      TIMESTAMP NULL,
                INDEX idx_expert_dossier (expert_id, dossier_id)
            )
        ");
    }

    private function autoriser(int $expertId, int $dossierId): void
    {
        $ok = DB::table('dossier_experts')
            ->where('expert_id', $expertId)
            ->where('dossier_id', $dossierId)
            ->whereIn('status', ['confirme_par_expert', 'comite_confirme'])
            ->exists();

        if (!$ok && Schema::hasTable('expert_dossier')) {
            $ok = DB::table('expert_dossier')
                ->where('expert_id', $expertId)
                ->where('dossier_id', $dossierId)
                ->where('statut_participation', 'confirme')
                ->exists();
        }

        abort_unless($ok, 403);
    }

    private function findExpertForUser($user)
    {
        if (!$user || !Schema::hasTable('experts')) {
            return null;
        }

        return DB::table('experts')
            ->where(function ($q) use ($user) {
                if (Schema::hasColumn('experts', 'user_id')) {
                    $q->where('user_id', $user->id);
                }
                if (Schema::hasColumn('experts', 'email')) {
                    $q->orWhere('email', $user->email);
                }
            })
            ->first();
    }

    private function findEtablissementForDossier($dossier)
    {
        if (!$dossier || !Schema::hasTable('etablissements')) {
            return null;
        }

        if (!empty($dossier->etablissement_id)) {
            return DB::table('etablissements')->where('id', $dossier->etablissement_id)->first();
        }

        if (!empty($dossier->campagne_etablissement_id) && Schema::hasTable('campagne_etablissements')) {
            $rattachement = DB::table('campagne_etablissements')
                ->where('id', $dossier->campagne_etablissement_id)->first();
            if ($rattachement && !empty($rattachement->etablissement_id)) {
                return DB::table('etablissements')->where('id', $rattachement->etablissement_id)->first();
            }
        }

        return null;
    }
}
