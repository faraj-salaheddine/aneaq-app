<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Expert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ExpertController extends Controller
{
    public function index()
    {
        $experts = Expert::query()
            ->select('experts.*')
            ->selectSub(
                DB::table('dossier_experts')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('dossier_experts.expert_id', 'experts.id'),
                'dossiers_count'
            )
            ->orderBy('nom')
            ->orderBy('prenom')
            ->get()
            ->map(function ($expert) {
                $fullName = trim(($expert->nom ?? '') . ' ' . ($expert->prenom ?? ''));

                return [
                    'id' => $expert->id,
                    'nom' => $expert->nom,
                    'prenom' => $expert->prenom,
                    'full_name' => $fullName !== '' ? $fullName : '—',
                    'email' => $expert->email,
                    'ville' => $expert->ville,
                    'pays' => $expert->pays,
                    'telephone' => $expert->telephone,
                    'specialite' => $expert->specialite,
                    'fonction_actuelle' => $expert->fonction_actuelle,
                    'universite_ou_departement_ministeriel' => $expert->universite_ou_departement_ministeriel,
                    'type_etablissement' => $expert->type_etablissement,
                    'etablissement' => $expert->etablissement,
                    'grade' => $expert->grade,
                    'diplomes_obtenus' => $expert->diplomes_obtenus,
                    'dossiers_count' => (int) ($expert->dossiers_count ?? 0),
                ];
            })
            ->values();

        return Inertia::render('DEE/Experts/Index', [

            'experts' => $experts,
        ]);
    }

    public function update(Request $request, Expert $expert)
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'ville' => ['nullable', 'string', 'max:255'],
            'pays' => ['nullable', 'string', 'max:255'],
            'telephone' => ['nullable', 'string', 'max:255'],
            'specialite' => ['nullable', 'string'],
            'fonction_actuelle' => ['nullable', 'string'],
            'universite_ou_departement_ministeriel' => ['nullable', 'string'],
            'type_etablissement' => ['nullable', 'string', 'max:255'],
            'etablissement' => ['nullable', 'string'],
            'grade' => ['nullable', 'string'],
            'diplomes_obtenus' => ['nullable', 'string'],
        ]);

        $expert->update($validated);

        return back()->with('success', 'Expert modifié avec succès.');
    }

    public function destroy(Expert $expert)
    {
        $dossiersCount = DB::table('dossier_experts')
            ->where('expert_id', $expert->id)
            ->count();

        if ($dossiersCount > 0) {
            return back()->with(
                'error',
                "Suppression impossible : cet expert est encore affecté à {$dossiersCount} dossier(s)."
            );
        }

        $expert->delete();

        return back()->with('success', 'Expert supprimé avec succès.');
    }
}