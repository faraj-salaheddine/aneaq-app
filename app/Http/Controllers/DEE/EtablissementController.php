<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Etablissement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EtablissementController extends Controller
{
    public function index()
    {
        $etablissements = Etablissement::query()
            ->select('etablissements.*')
            ->selectSub(
                DB::table('campagne_etablissements')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('campagne_etablissements.etablissement_id', 'etablissements.id'),
                'campagnes_count'
            )
            ->selectSub(
                DB::table('dossiers')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('dossiers.etablissement_id', 'etablissements.id'),
                'dossiers_count'
            )
            ->orderByRaw("COALESCE(NULLIF(etablissement_2, ''), etablissement) ASC")
            ->get()
            ->map(function ($etablissement) {
                return [
                    'id' => $etablissement->id,
                    'etablissement' => $etablissement->etablissement,
                    'etablissement_2' => $etablissement->etablissement_2,
                    'display_name' => $etablissement->etablissement_2 ?: $etablissement->etablissement,
                    'ville' => $etablissement->ville,
                    'universite' => $etablissement->universite,
                    'email' => $etablissement->email,
                    'campagnes_count' => (int) ($etablissement->campagnes_count ?? 0),
                    'dossiers_count' => (int) ($etablissement->dossiers_count ?? 0),
                ];
            })
            ->values();

        return Inertia::render('DEE/Etablissements/Index', [

            'etablissements' => $etablissements,
        ]);
    }

    public function update(Request $request, Etablissement $etablissement)
    {
        $validated = $request->validate([
            'etablissement' => ['nullable', 'string', 'max:255'],
            'etablissement_2' => ['required', 'string', 'max:255'],
            'ville' => ['nullable', 'string', 'max:255'],
            'universite' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        if (empty($validated['etablissement'])) {
            $validated['etablissement'] = $validated['etablissement_2'];
        }

        $etablissement->update($validated);

        return back()->with('success', 'Établissement modifié avec succès.');
    }

    public function destroy(Etablissement $etablissement)
    {
        $campagnesCount = DB::table('campagne_etablissements')
            ->where('etablissement_id', $etablissement->id)
            ->count();

        $dossiersCount = DB::table('dossiers')
            ->where('etablissement_id', $etablissement->id)
            ->count();

        if ($campagnesCount > 0 || $dossiersCount > 0) {
            return back()->with(
                'error',
                "Suppression impossible : cet établissement est encore lié à {$campagnesCount} campagne(s) ou {$dossiersCount} dossier(s)."
            );
        }

        $etablissement->delete();

        return back()->with('success', 'Établissement supprimé avec succès.');
    }
}