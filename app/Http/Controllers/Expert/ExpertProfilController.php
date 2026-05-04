<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\ExpertDocument;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\ActivityLog;
use Inertia\Inertia;
use Inertia\Response;
class ExpertProfilController extends Controller
{
    // ─────────────────────────────────────────────────────────
    // GET /expert/profil
    // ─────────────────────────────────────────────────────────
    public function show(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $documents = ExpertDocument::where('expert_id', $expert->id)
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('type')
            ->map(fn($docs) => $docs->map(fn($d) => [
                'id'            => $d->id,
                'original_name' => $d->original_name,
                'file_size'     => $d->file_size,
                'type'          => $d->type,
                'expert_id'     => $d->expert_id,
            ])->values()->toArray())
            ->toArray();

        return Inertia::render('Expert/Profil/Show', [
            'expert'    => $expert,
            'documents' => $documents,
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // GET /expert/profil/edit
    // ─────────────────────────────────────────────────────────
    public function edit(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $documents = ExpertDocument::where('expert_id', $expert->id)
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('type')
            ->map(fn($docs) => $docs->map(fn($d) => [
                'id'            => $d->id,
                'original_name' => $d->original_name,
                'file_size'     => $d->file_size,
                'type'          => $d->type,
                'expert_id'     => $d->expert_id,
            ])->values()->toArray())
            ->toArray();

        return Inertia::render('Expert/Profil/Edit', [
            'expert'    => $expert,
            'documents' => $documents,
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // PUT /expert/profil
    // ─────────────────────────────────────────────────────────
    public function update(Request $request): RedirectResponse
{
    $expert = Expert::where('user_id', Auth::id())->firstOrFail();

    $request->validate([
        'telephone'                             => 'nullable|string|max:30',
        'ville'                                 => 'nullable|string|max:100',
        'pays'                                  => 'nullable|string|max:100',
        'specialite'                            => 'nullable|string|max:255',
        'grade'                                 => 'nullable|string|max:100',
        'fonction_actuelle'                     => 'nullable|string|max:255',
        'universite_ou_departement_ministeriel' => 'nullable|string|max:255',
        'type_etablissement'                    => 'nullable|string|max:255',
        'etablissement'                         => 'nullable|string|max:255',
        'diplomes_obtenus'                      => 'nullable|string|max:2000',
        'responsabilite'                        => 'nullable|string|max:255',
        'cin_number'                            => 'nullable|string|max:20',
        'rib'                                   => 'nullable|string|max:24',
        'password'                              => 'nullable|string|min:8|confirmed',
        'cin_file'                              => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'contract_file'                         => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'carte_grise_file'                      => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        'rib_file'                              => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
    ]);

    // ── Capture old values before update ──
    $fields = [
        'telephone', 'ville', 'pays', 'specialite', 'grade',
        'fonction_actuelle', 'universite_ou_departement_ministeriel',
        'type_etablissement', 'etablissement', 'diplomes_obtenus',
        'responsabilite', 'cin_number', 'rib',
    ];

    $labels = [
        'telephone'                             => 'Téléphone',
        'ville'                                 => 'Ville',
        'pays'                                  => 'Pays',
        'specialite'                            => 'Spécialité',
        'grade'                                 => 'Grade',
        'fonction_actuelle'                     => 'Fonction actuelle',
        'universite_ou_departement_ministeriel' => 'Université / Département',
        'type_etablissement'                    => 'Type établissement',
        'etablissement'                         => 'Établissement',
        'diplomes_obtenus'                      => 'Diplômes',
        'responsabilite'                        => 'Responsabilité',
        'cin_number'                            => 'CIN',
        'rib'                                   => 'RIB',
    ];

    $changes = [];
    foreach ($fields as $field) {
        $oldVal = $expert->$field;
        $newVal = $request->$field;
        if ($oldVal !== $newVal) {
            $changes[] = ($labels[$field] ?? $field) . ': "' . ($oldVal ?: '—') . '" → "' . ($newVal ?: '—') . '"';
        }
    }

    if ($request->filled('password')) {
        $changes[] = 'Mot de passe modifié';
    }

    $details = count($changes) > 0
        ? implode(' | ', $changes)
        : 'Aucun changement détecté';

    // ── Update ──
    $expert->update([
        'telephone'                             => $request->telephone,
        'ville'                                 => $request->ville,
        'pays'                                  => $request->pays,
        'specialite'                            => $request->specialite,
        'grade'                                 => $request->grade,
        'fonction_actuelle'                     => $request->fonction_actuelle,
        'universite_ou_departement_ministeriel' => $request->universite_ou_departement_ministeriel,
        'type_etablissement'                    => $request->type_etablissement,
        'etablissement'                         => $request->etablissement,
        'diplomes_obtenus'                      => $request->diplomes_obtenus,
        'responsabilite'                        => $request->responsabilite,
        'cin_number'                            => $request->cin_number,
        'rib'                                   => $request->rib,
    ]);

    if ($request->filled('password')) {
    User::where('id', Auth::id())->update([
        'password' => Hash::make($request->password),
    ]);
}

    $docTypes = [
        'cin_file'         => 'cin',
        'contract_file'    => 'contract',
        'carte_grise_file' => 'carte_grise',
        'rib_file'         => 'rib',
    ];

    foreach ($docTypes as $fieldName => $docType) {
        if ($request->hasFile($fieldName) && $request->file($fieldName)->isValid()) {
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

    ActivityLog::create([
        'user_id'      => Auth::id(),
        'action'       => 'Compte modifié',
        'model_type'   => 'Expert',
        'model_id'     => $expert->id,
        'model_name'   => $expert->nom . ' ' . $expert->prenom,
        'performed_by' => $expert->nom . ' ' . $expert->prenom,
        'role'         => 'expert',
        'details'      => $details,
    ]);

    return redirect()->route('expert.profil.show')
        ->with('success', 'Profil mis à jour avec succès.');
}}