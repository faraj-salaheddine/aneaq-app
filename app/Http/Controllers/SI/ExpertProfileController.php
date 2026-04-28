<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\ExpertDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ExpertProfilController extends Controller
{
    /**
     * GET /expert/profil
     * Affiche le profil de l'expert connecté.
     */
    public function show(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        // Regroupe les documents par type
        $documents = $expert->documents()
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('type')
            ->toArray();

        return Inertia::render('Expert/Profil/Show', [
            'expert'    => $expert,
            'documents' => $documents,
        ]);
    }

    /**
     * GET /expert/profil/edit
     * Formulaire de modification du profil expert.
     */
    public function edit(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $documents = $expert->documents()
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('type')
            ->map(fn($docs) => $docs->map(fn($d) => [
                'id'            => $d->id,
                'original_name' => $d->original_name,
                'file_size'     => $d->file_size,
                'type'          => $d->type,
            ])->values())
            ->toArray();

        return Inertia::render('Expert/Profil/Edit', [
            'expert'    => $expert,
            'documents' => $documents,
        ]);
    }

    /**
     * PUT /expert/profil
     * Met à jour le profil de l'expert connecté.
     */
    public function update(Request $request)
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $user   = Auth::user();

        $request->validate([
            'telephone'                           => 'nullable|string|max:30',
            'ville'                               => 'nullable|string|max:100',
            'pays'                                => 'nullable|string|max:100',
            'specialite'                          => 'nullable|string|max:255',
            'grade'                               => 'nullable|string|max:100',
            'fonction_actuelle'                   => 'nullable|string|max:255',
            'universite_ou_departement_ministeriel' => 'nullable|string|max:255',
            'type_etablissement'                  => 'nullable|string|max:255',
            'etablissement'                       => 'nullable|string|max:255',
            'diplomes_obtenus'                    => 'nullable|string|max:2000',
            'responsabilite'                      => 'nullable|string|max:255',
            'cin_number'                          => 'nullable|string|max:20',
            'rib'                                 => 'nullable|digits:24',
            'password'                            => 'nullable|string|min:8|confirmed',
            'cin_file'                            => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'contract_file'                       => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'carte_grise_file'                    => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'rib_file'                            => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // Met à jour les champs expert
        $expert->update($request->only([
            'telephone', 'ville', 'pays', 'specialite', 'grade',
            'fonction_actuelle', 'universite_ou_departement_ministeriel',
            'type_etablissement', 'etablissement', 'diplomes_obtenus',
            'responsabilite', 'cin_number', 'rib',
        ]));

        // Met à jour le mot de passe si fourni
        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        // Traitement des documents uploadés
        $docTypes = [
            'cin_file'          => 'cin',
            'contract_file'     => 'contract',
            'carte_grise_file'  => 'carte_grise',
            'rib_file'          => 'rib',
        ];

        foreach ($docTypes as $fieldName => $docType) {
            if ($request->hasFile($fieldName)) {
                $file = $request->file($fieldName);
                $path = $file->store("experts/{$expert->id}/documents", 'local');

                ExpertDocument::create([
                    'expert_id'     => $expert->id,
                    'type'          => $docType,
                    'file_path'     => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type'     => $file->getMimeType(),
                    'file_size'     => $file->getSize(),
                ]);
            }
        }

        return redirect()->route('expert.profil.show')
            ->with('success', 'Profil mis à jour avec succès.');
    }
}