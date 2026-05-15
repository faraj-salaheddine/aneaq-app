<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\CampagneEvaluation;
use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\Expert;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (auth()->user()->role !== 'admin_dee') {
            abort(403, "Accès refusé. Cette page est réservée à l'administrateur DEE.");
        }

        // ── KPIs de base ──
        $totalDossiers      = Dossier::count();
        $totalEtablissements = Etablissement::count();
        $totalExperts       = Expert::count();
        $totalCampagnes     = CampagneEvaluation::count();
        $totalVisites       = Dossier::whereNotNull('date_visite')->count();

        // ── Dossiers par statut ──
        $dossierParStatut = Dossier::select('statut', DB::raw('count(*) as total'))
            ->groupBy('statut')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->statut => $r->total]);

        // ── Experts par statut d'affectation ──
        $affectationsParStatut = DB::table('dossier_experts')
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->status => $r->total]);

        // ── Rapports ──
        $rapportsEnAttente = DB::table('rapports_experts')
            ->where('statut', 'depose')
            ->count();

        $rapportsValides = DB::table('rapports_experts')
            ->whereIn('statut', ['valide', 'valide_dee'])
            ->count();

        // ── Activité mensuelle (dossiers créés par mois, 6 derniers mois) ──
        $activiteMensuelle = Dossier::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as mois'),
            DB::raw('count(*) as total')
        )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('mois')
            ->orderBy('mois')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->mois => $r->total]);

        // Remplir les mois manquants avec 0
        $moisLabels = [];
        $moisValeurs = [];
        for ($i = 5; $i >= 0; $i--) {
            $key = now()->subMonths($i)->format('Y-m');
            $label = now()->subMonths($i)->locale('fr')->isoFormat('MMM');
            $moisLabels[] = $label;
            $moisValeurs[] = $activiteMensuelle[$key] ?? 0;
        }

        // ── Campagnes actives ──
        $campagnesActives = CampagneEvaluation::where('statut', 'active')
            ->orWhere('statut', 'en_cours')
            ->count();

        // ── Évaluations en cours ──
        $evaluationsEnCours = DB::table('evaluations_quantitatives')
            ->where('statut', 'brouillon')
            ->whereNotNull('note')
            ->count();

        // ── Activité récente (dossiers modifiés récemment) ──
        $activiteRecente = Dossier::with('etablissement')
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(fn ($d) => [
                'id'            => $d->id,
                'reference'     => $d->reference,
                'statut'        => $d->statut,
                'etablissement' => $d->etablissement?->etablissement_2
                    ?? $d->etablissement?->etablissement
                    ?? $d->etablissement?->acronyme
                    ?? 'Établissement #' . $d->etablissement_id,
                'updated_at'    => $d->updated_at?->diffForHumans(),
            ]);

        // ── Top experts (les plus actifs) ──
        $topExperts = DB::table('dossier_experts')
            ->join('experts', 'experts.id', '=', 'dossier_experts.expert_id')
            ->select('experts.id', 'experts.prenom', 'experts.nom', 'experts.email', DB::raw('count(*) as nb_dossiers'))
            ->groupBy('experts.id', 'experts.prenom', 'experts.nom', 'experts.email')
            ->orderByDesc('nb_dossiers')
            ->limit(5)
            ->get();

        return Inertia::render('DEE/AdminDashboard', [
            'stats' => [
                'etablissements'      => $totalEtablissements,
                'experts'             => $totalExperts,
                'vagues'              => $totalCampagnes,
                'campagnes'           => $totalCampagnes,
                'dossiers'            => $totalDossiers,
                'visites'             => $totalVisites,
                'rapports_en_attente' => $rapportsEnAttente,
                'rapports_valides'    => $rapportsValides,
                'campagnes_actives'   => $campagnesActives,
                'evaluations_en_cours'=> $evaluationsEnCours,
            ],
            'dossierParStatut'      => $dossierParStatut,
            'affectationsParStatut' => $affectationsParStatut,
            'graphMoisLabels'       => $moisLabels,
            'graphMoisValeurs'      => $moisValeurs,
            'activiteRecente'       => $activiteRecente,
            'topExperts'            => $topExperts,
        ]);
    }
}
