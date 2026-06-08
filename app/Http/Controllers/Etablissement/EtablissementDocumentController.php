<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\Etablissement;
use App\Models\EtablissementOnboarding;
use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use App\Services\DossierDocumentService;
use App\Services\NotifierDee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EtablissementDocumentController extends Controller
{
    use ResolvesActiveEtablissement;
    public function index(): Response
    {
        $etablissement = $this->activeEtablissement();
        $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();
        if (!$dossier) return Inertia::render('Etablissement/SansDossier', ['page' => "Rapport d'autoévaluation"]);

        $onboarding = EtablissementOnboarding::where('etablissement_id', $etablissement->id)->first();
        $profilComplete = $onboarding && $onboarding->statut === 'complete';

        $documents = DossierDocument::where('dossier_id', $dossier->id)
            ->where('type_document', 'rapport_autoevaluation')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Etablissement/Documents/Index', [
            'etablissement'  => $etablissement,
            'dossier'        => $dossier,
            'documents'      => $documents,
            'profil_complete' => $profilComplete,
        ]);
    }

    public function store(Request $request): RedirectResponse
{
    $etablissement = $this->activeEtablissement();
    $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();

    $onboarding = EtablissementOnboarding::where('etablissement_id', $etablissement->id)->first();
    if (!$onboarding || $onboarding->statut !== 'complete') {
        return back()->withErrors(['profil' => 'Vous devez compléter votre profil avant de déposer le rapport d\'autoévaluation.']);
    }

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
        'status'           => DossierDocumentService::STATUS_PENDING_DEE,
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
        'status'           => DossierDocumentService::STATUS_PENDING_DEE,
    ]);

    if (in_array($dossier->statut, ['en_attente_formulaire', 'formulaire_complete'])) {
        $dossier->update(['statut' => 'rapport_depose']);
    }

    NotificationAneaq::envoyer(
        Auth::id(), 'document',
        'Rapport en attente de confirmation DEE',
        "Votre rapport d'autoévaluation a été déposé pour le dossier {$dossier->reference}. Il sera transmis aux experts après confirmation par la DEE.",
        'Dossier', $dossier->id
    );

    NotifierDee::pourDossier(
        $dossier,
        'document',
        "Rapport d'autoévaluation ajouté — {$dossier->reference}",
        "L'établissement {$this->etablissementNom($etablissement)} a ajouté son rapport d'autoévaluation au dossier {$dossier->reference} : {$pdf->getClientOriginalName()} et {$word->getClientOriginalName()}."
    );

    ActivityLogger::log(
        'rapport_depose',
        "Rapport d'autoévaluation déposé pour le dossier {$dossier->reference}",
        $dossier
    );

    return back()->with('success', 'Rapport déposé avec succès. Il sera envoyé aux experts après confirmation par la DEE.');
}

    public function telecharger(DossierDocument $document)
    {
        $etablissement = $this->activeEtablissement();
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
    $etablissement = $this->activeEtablissement();
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
    $etablissement = $this->activeEtablissement();
    $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();
    if (!$dossier) return Inertia::render('Etablissement/SansDossier', ['page' => 'Documents complémentaires']);

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
    $etablissement = $this->activeEtablissement();
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

    NotificationAneaq::envoyer(
        Auth::id(), 'document',
        'Document complémentaire déposé',
        "Un document complémentaire a été déposé pour le dossier {$dossier->reference}.",
        'Dossier', $dossier->id
    );

    NotifierDee::pourDossier(
        $dossier,
        'document',
        "Document complémentaire ajouté — {$dossier->reference}",
        "L'établissement {$this->etablissementNom($etablissement)} a ajouté le document complémentaire « {$file->getClientOriginalName()} » au dossier {$dossier->reference}."
    );

    ActivityLogger::log(
        'document_complementaire_depose',
        "Document complémentaire déposé pour le dossier {$dossier->reference}",
        $dossier
    );

    return back()->with('success', 'Document complémentaire envoyé avec succès.');
}

public function rapportAneaq(): Response
{
    $etablissement = $this->activeEtablissement();
    $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();
    if (!$dossier) return Inertia::render('Etablissement/SansDossier', ['page' => 'Rapport ANEAQ']);

    // DEE-uploaded rapport_aneaq documents
    $docsFormels = DossierDocument::where('dossier_id', $dossier->id)
        ->where('type_document', 'rapport_aneaq')
        ->orderByDesc('created_at')
        ->get()
        ->map(fn($d) => [
            'id'            => $d->id,
            'original_name' => $d->original_name ?? basename($d->file_path ?? ''),
            'observation'   => $d->observation,
            'created_at'    => $d->created_at,
            'url'           => $d->file_path ? asset('storage/' . $d->file_path) : null,
            'source'        => 'dee',
        ]);

    // Validated expert rapports (valide = validated, envoye_etablissement = sent to etablissement)
    $rapportsExperts = collect();
    if (Schema::hasTable('rapports_experts')) {
        $rapportsExperts = DB::table('rapports_experts')
            ->where('dossier_id', $dossier->id)
            ->whereIn('statut', ['valide', 'envoye_etablissement'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($r) {
                $expert = DB::table('experts')->where('id', $r->expert_id)->first();
                $expertName = $expert ? trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) : 'Expert';
                return [
                    'id'            => $r->id,
                    'original_name' => $r->original_name ?? $r->titre ?? 'Rapport expert',
                    'observation'   => "Rapport déposé par l'expert : {$expertName}",
                    'created_at'    => $r->created_at,
                    'url'           => $r->file_path ? asset('storage/' . $r->file_path) : null,
                    'source'        => 'expert',
                ];
            });
    }

    $documents = $docsFormels->concat($rapportsExperts)->sortByDesc('created_at')->values();

    return Inertia::render('Etablissement/Documents/RapportAneaq', [
        'etablissement' => $etablissement,
        'dossier'       => $dossier,
        'documents'     => $documents,
    ]);
}

private function etablissementNom(Etablissement $etablissement): string
{
    return $etablissement->etablissement_2
        ?? $etablissement->etablissement
        ?? $etablissement->nom
        ?? $etablissement->acronyme
        ?? 'concerné';
}

}
