<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\Dossier;
use App\Models\RapportExpert;
use App\Models\NotificationAneaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RapportExpertController extends Controller
{
    public function index(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $rapports = DB::table('rapports_experts')
            ->where('rapports_experts.expert_id', $expert->id)
            ->join('dossiers', 'dossiers.id', '=', 'rapports_experts.dossier_id')
            ->join('etablissements', 'etablissements.id', '=', 'dossiers.etablissement_id')
            ->select(
                'rapports_experts.*',
                'dossiers.vague',
                'etablissements.acronyme',
                'etablissements.etablissement_2 as nom',
                'etablissements.ville'
            )
            ->orderByDesc('rapports_experts.created_at')
            ->get();

        $dossiersEnAttente = DB::table('expert_dossier')
            ->where('expert_dossier.expert_id', $expert->id)
            ->where('expert_dossier.statut_participation', 'confirme')
            ->join('dossiers', 'dossiers.id', '=', 'expert_dossier.dossier_id')
            ->join('etablissements', 'etablissements.id', '=', 'dossiers.etablissement_id')
            ->whereIn('dossiers.statut', ['visite_planifiee', 'rapport_en_attente'])
            ->whereNotExists(fn($q) => $q->from('rapports_experts')
                ->whereColumn('rapports_experts.dossier_id', 'dossiers.id')
                ->where('rapports_experts.expert_id', $expert->id))
            ->select(
                'dossiers.id',
                'dossiers.vague',
                'dossiers.statut',
                'etablissements.acronyme',
                'etablissements.etablissement_2 as nom',
                'etablissements.ville'
            )
            ->get();

        return Inertia::render('Expert/Rapports/Index', [
            'expert'            => $expert,
            'rapports'          => $rapports,
            'dossiersEnAttente' => $dossiersEnAttente,
        ]);
    }

    public function create(Dossier $dossier): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $dossier->load('etablissement');

        $rapportExistant = RapportExpert::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->first();

        return Inertia::render('Expert/Rapports/Deposer', [
            'expert'          => $expert,
            'dossier'         => $dossier,
            'rapportExistant' => $rapportExistant,
        ]);
    }

    public function store(Request $request, Dossier $dossier)
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $request->validate([
            'rapport' => 'required|file|mimes:pdf,doc,docx|max:51200',
        ]);

        $file = $request->file('rapport');
        $path = $file->store("rapports/experts/{$dossier->id}/{$expert->id}", 'local');

        DB::transaction(function () use ($dossier, $expert, $file, $path) {
            RapportExpert::updateOrCreate(
                ['dossier_id' => $dossier->id, 'expert_id' => $expert->id],
                [
                    'file_path'     => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type'     => $file->getMimeType(),
                    'file_size'     => $file->getSize(),
                    'statut'        => 'depose',
                    'motif_rejet'   => null,
                    'valide_le'     => null,
                    'valide_par'    => null,
                ]
            );

            if ($dossier->statut !== 'rapport_depose') {
                $dossier->update(['statut' => 'rapport_depose']);
            }

            $uids = DB::table('utilisateurs_dee')->pluck('user_id');
            $etab = DB::table('etablissements')->find($dossier->etablissement_id);

            foreach ($uids as $uid) {
                NotificationAneaq::envoyer(
                    $uid,
                    'general',
                    "Rapport déposé — {$etab->acronyme} {$etab->ville}",
                    "{$expert->prenom} {$expert->nom} a déposé son rapport final (Vague {$dossier->vague}).",
                    'dossier',
                    $dossier->id
                );
            }
        });

        return redirect()->route('expert.rapports.index')
            ->with('success', 'Rapport déposé avec succès.');
    }

    public function telecharger(RapportExpert $rapport)
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        abort_if($rapport->expert_id !== $expert->id, 403);
        abort_if(!Storage::disk('local')->exists($rapport->file_path), 404);

        return Storage::disk('local')->download($rapport->file_path, $rapport->original_name);
    }

    private function autoriser(Expert $expert, Dossier $dossier): void
    {
        $ok = DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->where('statut_participation', 'confirme')
            ->exists();

        abort_unless($ok, 403);
    }
}