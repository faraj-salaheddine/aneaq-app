<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Critere;
use App\Models\CriterePreuve;
use App\Models\Dossier;
use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use App\Services\NotifierDee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnnexeController extends Controller
{
    use ResolvesActiveEtablissement;

    /**
     * Affiche la page des annexes avec tous les critères groupés
     * et les réponses déjà soumises par l'établissement connecté.
     */
    public function index()
    {
        $etablissement = $this->activeEtablissement();

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

        $annexesPubliees = ActivityLog::where('action', 'annexes_publiees')
            ->where('model_type', \App\Models\Etablissement::class)
            ->where('model_id', $etablissement->id)
            ->exists();

        return Inertia::render('Etablissement/Annexe/Annexe', [
            'grouped'          => $grouped,
            'totalPreuves'     => $totalPreuves,
            'preuvesRemplies'  => $preuvesRemplies,
            'annexesPubliees'  => $annexesPubliees,
        ]);
    }

    /**
     * Sauvegarde la réponse d'une preuve (upload fichier ou non disponible).
     */
    public function store(Request $request)
    {
        $etablissement = $this->activeEtablissement();

        $request->validate([
            'critere_id'   => 'required|exists:criteres,id',
            'preuve_index' => 'required|integer|min:0',
            'existe'       => 'required|boolean',
            'fichier'      => $request->boolean('existe')
                ? 'required|file|max:51200'
                : 'nullable',
            'commentaire'  => 'nullable|string|max:1000',
            'note'         => 'nullable|string|max:2000',
        ], [
            'fichier.required' => 'Un fichier justificatif est obligatoire pour cette preuve.',
            'fichier.max'      => 'Le fichier ne doit pas dépasser 50 Mo.',
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

        $preuve = CriterePreuve::updateOrCreate(
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

        $dossier = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();
        if ($dossier) {
            $critere = Critere::find($request->critere_id);
            $preuveNumero = $request->integer('preuve_index') + 1;
            $critereLabel = $critere?->critere_num ?? "#{$request->critere_id}";
            $detail = $preuve->existe
                ? "a ajouté la preuve annexe {$preuveNumero} du critère {$critereLabel} : « {$preuve->fichier_nom} »"
                : "a déclaré indisponible la preuve annexe {$preuveNumero} du critère {$critereLabel}";

            NotifierDee::pourDossier(
                $dossier,
                'annexe',
                "Annexe mise à jour — {$dossier->reference}",
                "L'établissement {$detail} dans le dossier {$dossier->reference}."
            );
        }

        ActivityLogger::log('annexe_enregistree', 'Preuve annexe enregistrée', $etablissement);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Preuve enregistrée avec succès.');
    }

    /**
     * Sauvegarde uniquement la note d'une preuve déjà soumise.
     */
    public function saveNote(Request $request)
    {
        $etablissement = $this->activeEtablissement();

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
     * Publie officiellement les annexes (enregistre l'événement et notifie la DEE).
     */
    public function publier(Request $request)
    {
        $etablissement = $this->activeEtablissement();

        $total   = \App\Models\Critere::all()->sum(fn ($c) => count($c->preuves));

        // Count all filled preuves (both submitted files and declared non-available)
        $remplies = \App\Models\CriterePreuve::where('etablissement_id', $etablissement->id)->count();
        $soumises = \App\Models\CriterePreuve::where('etablissement_id', $etablissement->id)
            ->where('existe', true)->count();

        ActivityLogger::log(
            'annexes_publiees',
            "Annexes publiées : {$remplies}/{$total} preuves remplies ({$soumises} avec fichier).",
            $etablissement
        );

        NotificationAneaq::envoyer(
            Auth::id(), 'annexe',
            'Annexes publiées',
            "L'établissement a publié ses annexes ({$remplies}/{$total} remplies).",
            'Etablissement', $etablissement->id
        );

        $dossier = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();
        if ($dossier) {
            NotifierDee::pourDossier(
                $dossier,
                'annexe',
                "Annexes publiées — {$dossier->reference}",
                "L'établissement a publié officiellement {$remplies}/{$total} preuves annexes pour le dossier {$dossier->reference}."
            );
        }

        return response()->json([
            'success'  => true,
            'soumises' => $remplies,
            'total'    => $total,
        ]);
    }

    /**
     * Sauvegarde un lot de notes en une seule requête (utilisé par le bouton global).
     */
    public function saveNotesBatch(Request $request)
    {
        $etablissement = $this->activeEtablissement();

        $request->validate([
            'notes'                  => 'required|array|max:600',
            'notes.*.critere_id'     => 'required|exists:criteres,id',
            'notes.*.preuve_index'   => 'required|integer|min:0',
            'notes.*.note'           => 'nullable|string|max:2000',
        ]);

        foreach ($request->notes as $item) {
            CriterePreuve::updateOrCreate(
                [
                    'critere_id'       => $item['critere_id'],
                    'etablissement_id' => $etablissement->id,
                    'preuve_index'     => $item['preuve_index'],
                ],
                ['note' => $item['note'] ?? null]
            );
        }

        return response()->json(['success' => true, 'saved' => count($request->notes)]);
    }

    /**
     * Télécharger un fichier de preuve.
     */
    public function download(CriterePreuve $criterePreuve)
    {
        $etablissement = $this->activeEtablissement();

        abort_if($criterePreuve->etablissement_id !== $etablissement->id, 403);

        $cheminComplet = storage_path('app/public/' . $criterePreuve->fichier_path);

        abort_if(!file_exists($cheminComplet), 404);

        return response()->download($cheminComplet, $criterePreuve->fichier_nom);
    }

    public function voir(CriterePreuve $criterePreuve)
    {
        $etablissement = $this->activeEtablissement();

        abort_if($criterePreuve->etablissement_id !== $etablissement->id, 403);

        $cheminComplet = storage_path('app/public/' . $criterePreuve->fichier_path);

        abort_if(!file_exists($cheminComplet), 404);

        return response()->file($cheminComplet, [
            'Content-Disposition' => 'inline; filename="' . $criterePreuve->fichier_nom . '"',
        ]);
    }
}
