<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\Etablissement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EtablissementDocumentController extends Controller
{
    public function index(): Response
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
        $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();

        $documents = DossierDocument::where('dossier_id', $dossier->id)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Etablissement/Documents/Index', [
            'etablissement' => $etablissement,
            'dossier'       => $dossier,
            'documents'     => $documents,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
        $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();

        $request->validate([
            'fichier'       => 'required|file|mimes:pdf,doc,docx|max:51200',
            'type_document' => 'required|in:rapport_autoevaluation,annexe',
            'observation'   => 'nullable|string|max:500',
        ]);

        $file = $request->file('fichier');
        $path = $file->store("dossiers/{$dossier->id}/etablissement", 'local');

        DossierDocument::create([
            'dossier_id'       => $dossier->id,
            'type_document'    => $request->type_document,
            'file_path'        => $path,
            'original_name'    => $file->getClientOriginalName(),
            'observation'      => $request->observation,
            'uploaded_by'      => Auth::id(),
            'uploaded_by_role' => 'etablissement',
            'status'           => 'Déposé',
        ]);

        if ($request->type_document === 'rapport_autoevaluation'
            && in_array($dossier->statut, ['en_attente_formulaire', 'formulaire_complete'])) {
            $dossier->update(['statut' => 'rapport_depose']);
        }

        return back()->with('success', 'Document déposé avec succès.');
    }

    public function telecharger(DossierDocument $document)
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
        $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();

        abort_if($document->dossier_id !== $dossier->id, 403);
        abort_if(!Storage::disk('local')->exists($document->file_path), 404);

        return response()->download(
            Storage::disk('local')->path($document->file_path),
            $document->original_name
        );
    }
}
