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
            ->where('type_document', 'rapport_autoevaluation')
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
        'fichier_pdf'   => 'required|file|mimes:pdf|max:51200',
        'fichier_word'  => 'required|file|mimes:doc,docx|max:51200',
        'type_document' => 'required|in:rapport_autoevaluation',
        'observation'   => 'nullable|string|max:500',
    ], [
        'fichier_pdf.required'  => 'Le fichier PDF est obligatoire.',
        'fichier_pdf.mimes'     => 'Le premier fichier doit être au format PDF.',
        'fichier_word.required' => 'Le fichier Word est obligatoire.',
        'fichier_word.mimes'    => 'Le deuxième fichier doit être au format Word (.doc ou .docx).',
    ]);

    // Store PDF
    $pdf      = $request->file('fichier_pdf');
    $pathPdf  = $pdf->store("dossiers/{$dossier->id}/etablissement", 'local');

    DossierDocument::create([
        'dossier_id'       => $dossier->id,
        'type_document'    => 'rapport_autoevaluation',
        'file_path'        => $pathPdf,
        'original_name'    => $pdf->getClientOriginalName(),
        'observation'      => $request->observation,
        'uploaded_by'      => Auth::id(),
        'uploaded_by_role' => 'etablissement',
        'status'           => 'Déposé',
    ]);

    // Store Word
    $word     = $request->file('fichier_word');
    $pathWord = $word->store("dossiers/{$dossier->id}/etablissement", 'local');

    DossierDocument::create([
        'dossier_id'       => $dossier->id,
        'type_document'    => 'rapport_autoevaluation',
        'file_path'        => $pathWord,
        'original_name'    => $word->getClientOriginalName(),
        'observation'      => $request->observation,
        'uploaded_by'      => Auth::id(),
        'uploaded_by_role' => 'etablissement',
        'status'           => 'Déposé',
    ]);

    if (in_array($dossier->statut, ['en_attente_formulaire', 'formulaire_complete'])) {
        $dossier->update(['statut' => 'rapport_depose']);
    }

    return back()->with('success', 'Rapport déposé avec succès (PDF + Word).');
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


    public function voir(DossierDocument $document)
{
    $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
    $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();
    abort_if($document->dossier_id !== $dossier->id, 403);
    abort_if(!Storage::disk('local')->exists($document->file_path), 404);

    $path     = Storage::disk('local')->path($document->file_path);
    $mime     = mime_content_type($path);
    $filename = $document->original_name;

    return response()->file($path, [
        'Content-Type'        => $mime,
        'Content-Disposition' => 'inline; filename="' . $filename . '"',
    ]);
}


public function complementaires(): Response
{
    $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
    $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();

    $documents = DossierDocument::where('dossier_id', $dossier->id)
        ->where('type_document', 'document_complementaire')
        ->orderByDesc('created_at')
        ->get();

    return Inertia::render('Etablissement/Documents/Complementaires', [
        'etablissement' => $etablissement,
        'dossier'       => $dossier,
        'documents'     => $documents,
    ]);
}

public function storeComplementaire(Request $request): RedirectResponse
{
    $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
    $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();

    $request->validate([
        'fichier'     => 'required|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png',
        'observation' => 'required|string|min:10|max:1000',
    ], [
        'fichier.required'     => 'Veuillez sélectionner un fichier.',
        'fichier.mimes'        => 'Format non autorisé. Les fichiers ZIP ne sont pas acceptés.',
        'observation.required' => 'Un commentaire est obligatoire pour ce type de document.',
        'observation.min'      => 'Le commentaire doit contenir au moins 10 caractères.',
    ]);

    $file = $request->file('fichier');
    $path = $file->store("dossiers/{$dossier->id}/complementaires", 'local');

    DossierDocument::create([
        'dossier_id'       => $dossier->id,
        'type_document'    => 'document_complementaire',
        'file_path'        => $path,
        'original_name'    => $file->getClientOriginalName(),
        'observation'      => $request->observation,
        'uploaded_by'      => Auth::id(),
        'uploaded_by_role' => 'etablissement',
        'status'           => 'Déposé',
    ]);

    return back()->with('success', 'Document complémentaire envoyé avec succès.');
}

public function rapportAneaq(): Response
{
    $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
    $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();

    $documents = DossierDocument::where('dossier_id', $dossier->id)
        ->where('type_document', 'rapport_aneaq')
        ->orderByDesc('created_at')
        ->get();

    return Inertia::render('Etablissement/Documents/RapportAneaq', [
        'etablissement' => $etablissement,
        'dossier'       => $dossier,
        'documents'     => $documents,
    ]);
}

}
