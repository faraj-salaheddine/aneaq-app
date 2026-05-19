<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Critere;
use App\Models\CriterePreuve;
use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnnexeController extends Controller
{
    /**
     * Affiche la page des annexes avec tous les critères groupés
     * et les réponses déjà soumises par l'établissement connecté.
     */
    public function index()
    {
        $etablissement = \App\Models\Etablissement::where('user_id', Auth::id())->firstOrFail();

        $criteres = Critere::all();

        $reponsesExistantes = CriterePreuve::where('etablissement_id', $etablissement->id)
            ->get()
            ->groupBy('critere_id')
            ->map(fn($groupe) => $groupe->keyBy('preuve_index'));

        $grouped = $criteres->groupBy('domaine')->map(function ($parChamp, $domaine) use ($reponsesExistantes) {
            $premierDomaine = $parChamp->first();
            return [
                'domaine'       => $domaine,
                'domaine_label' => $premierDomaine->domaine_label,
                'champs'        => $parChamp->groupBy('champ')->map(function ($parRef, $champ) use ($reponsesExistantes) {
                    $premierChamp = $parRef->first();
                    return [
                        'champ'       => $champ,
                        'champ_label' => $premierChamp->champ_label,
                        'references'  => $parRef->groupBy('reference')->map(function ($criteres, $reference) use ($reponsesExistantes) {
                            $premiereRef = $criteres->first();
                            return [
                                'reference'       => $reference,
                                'reference_label' => $premiereRef->reference_label,
                                'criteres'        => $criteres->map(function ($critere) use ($reponsesExistantes) {
                                    $reponsesParIndex = $reponsesExistantes->get($critere->id, collect());
                                    $preuves = collect($critere->preuves)->map(function ($label, $index) use ($reponsesParIndex) {
                                        $reponse = $reponsesParIndex->get($index);
                                        return [
                                            'index'        => $index,
                                            'label'        => $label,
                                            'existe'       => $reponse?->existe ?? null,
                                            'fichier_nom'  => $reponse?->fichier_nom ?? null,
                                            'fichier_path' => $reponse?->fichier_path ?? null,
                                            'commentaire'  => $reponse?->commentaire ?? null,
                                            'note'         => $reponse?->note ?? null,
                                            'id'           => $reponse?->id ?? null,
                                        ];
                                    });
                                    return [
                                        'id'            => $critere->id,
                                        'critere_num'   => $critere->critere_num,
                                        'critere_label' => $critere->critere_label,
                                        'preuves'       => $preuves,
                                    ];
                                })->values(),
                            ];
                        })->values(),
                    ];
                })->values(),
            ];
        })->values();

        $totalPreuves    = $criteres->sum(fn($c) => count($c->preuves));
        $preuvesRemplies = CriterePreuve::where('etablissement_id', $etablissement->id)->count();

        return Inertia::render('Etablissement/Annexe/Annexe', [
            'grouped'         => $grouped,
            'totalPreuves'    => $totalPreuves,
            'preuvesRemplies' => $preuvesRemplies,
        ]);
    }

    /**
     * Sauvegarde la réponse d'une preuve (upload fichier ou non disponible).
     */
    public function store(Request $request)
    {
        $etablissement = \App\Models\Etablissement::where('user_id', Auth::id())->firstOrFail();

        $request->validate([
            'critere_id'   => 'required|exists:criteres,id',
            'preuve_index' => 'required|integer|min:0',
            'existe'       => 'required|boolean',
            'fichier'      => $request->boolean('existe')
                ? 'required|file|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png|max:10240'
                : 'nullable',
            'commentaire'  => 'nullable|string|max:1000',
            'note'         => 'nullable|string|max:2000',
        ], [
            'fichier.required' => 'Un fichier justificatif est obligatoire pour cette preuve.',
            'fichier.mimes'    => 'Format non autorisé. Formats acceptés : PDF, Word, Excel, PowerPoint, JPG, PNG.',
            'fichier.max'      => 'Le fichier ne doit pas dépasser 10 Mo.',
        ]);

        $data = [
            'critere_id'       => $request->critere_id,
            'etablissement_id' => $etablissement->id,
            'preuve_index'     => $request->preuve_index,
            'existe'           => $request->boolean('existe'),
            'commentaire'      => $request->commentaire,
            'note'             => $request->note,
        ];

        if ($request->boolean('existe') && $request->hasFile('fichier')) {
            $ancienne = CriterePreuve::where([
                'critere_id'       => $request->critere_id,
                'etablissement_id' => $etablissement->id,
                'preuve_index'     => $request->preuve_index,
            ])->first();

            if ($ancienne && $ancienne->fichier_path) {
                Storage::disk('public')->delete($ancienne->fichier_path);
            }

            $fichier = $request->file('fichier');
            $path    = $fichier->store('annexes/' . $etablissement->id, 'public');

            $data['fichier_path'] = $path;
            $data['fichier_nom']  = $fichier->getClientOriginalName();
        }

        if (!$request->boolean('existe')) {
            $ancienne = CriterePreuve::where([
                'critere_id'       => $request->critere_id,
                'etablissement_id' => $etablissement->id,
                'preuve_index'     => $request->preuve_index,
            ])->first();

            if ($ancienne && $ancienne->fichier_path) {
                Storage::disk('public')->delete($ancienne->fichier_path);
            }

            $data['fichier_path'] = null;
            $data['fichier_nom']  = null;
        }

        CriterePreuve::updateOrCreate(
            [
                'critere_id'       => $request->critere_id,
                'etablissement_id' => $etablissement->id,
                'preuve_index'     => $request->preuve_index,
            ],
            $data
        );

        NotificationAneaq::envoyer(
            Auth::id(), 'annexe',
            'Annexe enregistrée',
            'Une preuve a été enregistrée avec succès.',
            'Etablissement', $etablissement->id
        );

        ActivityLogger::log('annexe_enregistree', 'Preuve annexe enregistrée', $etablissement);

        return back()->with('success', 'Preuve enregistrée avec succès.');
    }

    /**
     * Sauvegarde uniquement la note d'une preuve déjà soumise.
     */
    public function saveNote(Request $request)
    {
        $etablissement = \App\Models\Etablissement::where('user_id', Auth::id())->firstOrFail();

        $request->validate([
            'critere_id'   => 'required|exists:criteres,id',
            'preuve_index' => 'required|integer|min:0',
            'note'         => 'nullable|string|max:2000',
        ]);

        CriterePreuve::updateOrCreate(
            [
                'critere_id'       => $request->critere_id,
                'etablissement_id' => $etablissement->id,
                'preuve_index'     => $request->preuve_index,
            ],
            ['note' => $request->note]
        );

        return back()->with('success', 'Note sauvegardée.');
    }

    /**
     * Télécharger un fichier de preuve.
     */
    public function download(CriterePreuve $criterePreuve)
    {
        $etablissement = \App\Models\Etablissement::where('user_id', Auth::id())->firstOrFail();

        abort_if($criterePreuve->etablissement_id !== $etablissement->id, 403);

        $cheminComplet = storage_path('app/public/' . $criterePreuve->fichier_path);

        abort_if(!file_exists($cheminComplet), 404);

        return response()->download($cheminComplet, $criterePreuve->fichier_nom);
    }
}