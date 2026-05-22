<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class RapportExpertController extends Controller
{
    public function index()
    {
        $user   = Auth::user();
        $expert = $this->findExpertForUser($user);

        if (!$expert) {
            return Inertia::render('Expert/Rapports/Index', [
                'rapports'          => [],
                'dossiersEnAttente' => [],
            ]);
        }

        $assignments = DB::table('dossier_experts')
            ->where('expert_id', $expert->id)
            ->whereIn('status', ['accepte_par_expert', 'confirme_par_expert', 'comite_confirme'])
            ->get();

        $rapports          = collect();
        $dossiersEnAttente = collect();

        foreach ($assignments as $assignment) {
            $dossier = DB::table('dossiers')->where('id', $assignment->dossier_id)->first();
            if (!$dossier) continue;

            $etab  = $this->findEtablissement($dossier);
            $vague = $dossier->campagne ?? $dossier->campagne_reference ?? $dossier->vague ?? '—';

            $rapport = $this->findRapport($expert->id, $dossier->id);

            if ($rapport) {
                $rapports->push([
                    'id'            => $rapport->id,
                    'dossier_id'    => $dossier->id,
                    'acronyme'      => $etab->acronyme ?? '—',
                    'ville'         => $etab->ville    ?? '—',
                    'vague'         => $vague,
                    'original_name' => $rapport->fichier ? basename($rapport->fichier) : '—',
                    'file_size'     => $rapport->fichier && file_exists(storage_path('app/public/' . $rapport->fichier))
                        ? filesize(storage_path('app/public/' . $rapport->fichier))
                        : null,
                    'statut'        => $rapport->statut ?? 'depose',
                    'created_at'    => $rapport->created_at,
                ]);
            } else {
                $dossiersEnAttente->push([
                    'id'      => $dossier->id,
                    'acronyme' => $etab->acronyme ?? '—',
                    'ville'    => $etab->ville    ?? '—',
                    'vague'    => $vague,
                ]);
            }
        }

        return Inertia::render('Expert/Rapports/Index', [
            'rapports'          => $rapports->values(),
            'dossiersEnAttente' => $dossiersEnAttente->values(),
        ]);
    }

    private function findEtablissement($dossier)
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

    public function create(Dossier $dossier)
    {
        $user = Auth::user();
        $expert = $this->findExpertForUser($user);

        if (!$expert) {
            abort(403);
        }

        $this->authorizeDossier($expert->id, $dossier->id);

        $rapport = $this->findRapport($expert->id, $dossier->id);

        return Inertia::render('Expert/Rapports/Deposer', [
    'dossier' => [
        'id' => $dossier->id,
        'reference' => $dossier->reference ?? '—',
        'statut' => $dossier->statut ?? $dossier->status ?? '—',
    ],
    'rapport' => $rapport,
]);
    }

    public function store(Request $request, Dossier $dossier)
    {
        $user = Auth::user();
        $expert = $this->findExpertForUser($user);

        if (!$expert) {
            abort(403);
        }

        $this->authorizeDossier($expert->id, $dossier->id);

        $validated = $request->validate([
            'titre' => ['nullable', 'string', 'max:255'],
            'commentaire' => ['nullable', 'string'],
            'rapport' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ]);

        $file = $request->file('rapport');
        $path = $file->store('rapports_experts', 'public');

        if (!Schema::hasTable('rapports_experts')) {
            return back()->withErrors([
                'rapport' => 'La table rapports_experts est introuvable.',
            ]);
        }

        $existing = DB::table('rapports_experts')
            ->where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->first();

        $columns = Schema::getColumnListing('rapports_experts');

        $payload = [
            'dossier_id'    => $dossier->id,
            'expert_id'     => $expert->id,
            'statut'        => 'depose',
            'updated_at'    => now(),
        ];

        // Populate every column that exists so NOT NULL constraints are satisfied
        if (in_array('file_path', $columns))    $payload['file_path']    = $path;
        if (in_array('fichier', $columns))      $payload['fichier']      = $path;
        if (in_array('original_name', $columns))$payload['original_name']= $file->getClientOriginalName();
        if (in_array('mime_type', $columns))    $payload['mime_type']    = $file->getMimeType() ?? $file->getClientMimeType();
        if (in_array('file_size', $columns))    $payload['file_size']    = $file->getSize();
        if (in_array('titre', $columns))        $payload['titre']        = $validated['titre'] ?: 'Rapport expert';
        if (in_array('commentaire', $columns))  $payload['commentaire']  = $validated['commentaire'] ?? null;
        // Reset validation fields when re-depositing
        if (in_array('motif_rejet', $columns))  $payload['motif_rejet']  = null;
        if (in_array('valide_le', $columns))    $payload['valide_le']    = null;
        if (in_array('valide_par', $columns))   $payload['valide_par']   = null;

        if ($existing) {
            DB::table('rapports_experts')->where('id', $existing->id)->update($payload);
        } else {
            $payload['created_at'] = now();
            DB::table('rapports_experts')->insert($payload);
        }

        // Advance dossier status so the établissement timeline reflects the deposit
        DB::table('dossiers')
            ->where('id', $dossier->id)
            ->whereNotIn('statut', ['rapport_en_attente', 'valide', 'rejeté', 'valide_definitif'])
            ->update(['statut' => 'rapport_en_attente', 'updated_at' => now()]);

        return redirect('/expert/dossiers/' . $dossier->id)
            ->with('success', 'Rapport déposé avec succès.');
    }

    public function telecharger($rapport)
    {
        $item = DB::table('rapports_experts')->where('id', $rapport)->first();

        if (!$item || empty($item->fichier)) {
            abort(404);
        }

$cheminComplet = storage_path('app/public/' . $item->fichier);

abort_if(!file_exists($cheminComplet), 404);

return response()->download($cheminComplet, basename($item->fichier));
    }

    private function findExpertForUser($user)
    {
        if (!$user || !Schema::hasTable('experts')) {
            return null;
        }

        return DB::table('experts')
            ->where(function ($query) use ($user) {
                if (Schema::hasColumn('experts', 'user_id')) {
                    $query->where('user_id', $user->id);
                }

                if (Schema::hasColumn('experts', 'email')) {
                    $query->orWhere('email', $user->email);
                }
            })
            ->first();
    }

    private function authorizeDossier($expertId, $dossierId): void
    {
        $authorized = DB::table('dossier_experts')
            ->where('expert_id', $expertId)
            ->where('dossier_id', $dossierId)
            ->whereIn('status', ['accepte_par_expert', 'confirme_par_expert', 'comite_confirme'])
            ->exists();

        abort_unless($authorized, 403);
    }

    private function findRapport($expertId, $dossierId)
    {
        if (!Schema::hasTable('rapports_experts')) {
            return null;
        }

        return DB::table('rapports_experts')
            ->where('expert_id', $expertId)
            ->where('dossier_id', $dossierId)
            ->first();
    }
}