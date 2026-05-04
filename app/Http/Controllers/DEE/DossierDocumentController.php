<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Dossier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class DossierDocumentController extends Controller
{
    public function store(Request $request, Dossier $dossier)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'max:255'],
            'fichier' => ['required', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
        ]);

        $table = $this->documentsTable();

        if (!$table) {
            return back()->with('error', 'Table des documents introuvable.');
        }

        $file = $request->file('fichier');

        $path = $file->store('dossiers/' . $dossier->id . '/documents', 'public');

        $data = [];

        $this->setColumn($table, $data, 'dossier_id', $dossier->id);
        $this->setColumn($table, $data, 'type', $validated['type']);
        $this->setColumn($table, $data, 'document_type', $validated['type']);
        $this->setColumn($table, $data, 'titre', $this->documentLabel($validated['type']));
        $this->setColumn($table, $data, 'nom', $this->documentLabel($validated['type']));
        $this->setColumn($table, $data, 'name', $this->documentLabel($validated['type']));

        $this->setColumn($table, $data, 'path', $path);
        $this->setColumn($table, $data, 'file_path', $path);
        $this->setColumn($table, $data, 'fichier', $path);

        $this->setColumn($table, $data, 'original_name', $file->getClientOriginalName());
        $this->setColumn($table, $data, 'filename', $file->getClientOriginalName());
        $this->setColumn($table, $data, 'mime_type', $file->getClientMimeType());
        $this->setColumn($table, $data, 'size', $file->getSize());

        $this->setColumn($table, $data, 'uploaded_by', Auth::id());
        $this->setColumn($table, $data, 'created_by', Auth::id());
        $this->setColumn($table, $data, 'depose_par', 'DEE');
        $this->setColumn($table, $data, 'statut', 'Déposé');
        $this->setColumn($table, $data, 'status', 'Déposé');

        if (Schema::hasColumn($table, 'created_at')) {
            $data['created_at'] = now();
        }

        if (Schema::hasColumn($table, 'updated_at')) {
            $data['updated_at'] = now();
        }

        DB::table($table)->insert($data);

        return back()->with('success', 'Document ajouté avec succès.');
    }

    public function destroy(Dossier $dossier, $document)
    {
        $table = $this->documentsTable();

        if (!$table) {
            return back()->with('error', 'Table des documents introuvable.');
        }

        $documentRow = DB::table($table)
            ->where('id', $document)
            ->where('dossier_id', $dossier->id)
            ->first();

        if (!$documentRow) {
            return back()->with('error', 'Document introuvable.');
        }

        $path = $documentRow->path
            ?? $documentRow->file_path
            ?? $documentRow->fichier
            ?? null;

        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        DB::table($table)
            ->where('id', $document)
            ->where('dossier_id', $dossier->id)
            ->delete();

        return back()->with('success', 'Document supprimé avec succès.');
    }

    private function documentsTable(): ?string
    {
        foreach (['dossier_documents', 'documents'] as $table) {
            if (Schema::hasTable($table)) {
                return $table;
            }
        }

        return null;
    }

    private function setColumn(string $table, array &$data, string $column, mixed $value): void
    {
        if (Schema::hasColumn($table, $column)) {
            $data[$column] = $value;
        }
    }

    private function documentLabel(string $type): string
    {
        return match ($type) {
            'lettre_dee' => 'Lettre DEE',
            'formulaire' => 'Formulaire ajouté',
            'rapport_auto_evaluation' => 'Rapport d’autoévaluation',
            'annexe' => 'Annexe',
            'rapport_expert' => 'Rapport expert',
            default => ucfirst(str_replace('_', ' ', $type)),
        };
    }
}