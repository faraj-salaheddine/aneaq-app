<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Mail\ExpertNotificationMail;
use App\Models\Dossier;
use App\Models\Expert;
use App\Models\NotificationAneaq;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\DossierDocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
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

        $label = $this->documentLabel($validated['type']);

        $this->setColumn($table, $data, 'dossier_id', $dossier->id);
        // type columns — cover every naming variant across tables
        $this->setColumn($table, $data, 'type', $validated['type']);
        $this->setColumn($table, $data, 'document_type', $validated['type']);
        $this->setColumn($table, $data, 'type_document', $validated['type']);
        $this->setColumn($table, $data, 'titre', $label);
        $this->setColumn($table, $data, 'nom', $label);
        $this->setColumn($table, $data, 'name', $label);

        $this->setColumn($table, $data, 'path', $path);
        $this->setColumn($table, $data, 'file_path', $path);
        $this->setColumn($table, $data, 'fichier', $path);

        $this->setColumn($table, $data, 'original_name', $file->getClientOriginalName());
        $this->setColumn($table, $data, 'filename', $file->getClientOriginalName());
        $this->setColumn($table, $data, 'mime_type', $file->getClientMimeType());
        $this->setColumn($table, $data, 'size', $file->getSize());

        $this->setColumn($table, $data, 'uploaded_by', Auth::id());
        $this->setColumn($table, $data, 'created_by', Auth::id());
        // role columns — cover every naming variant
        $this->setColumn($table, $data, 'uploaded_by_role', 'DEE');
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

    public function accepterRapportAutoevaluation(Dossier $dossier)
    {
        $table = $this->documentsTable();

        if (!$table) {
            return back()->with('error', 'Table des documents introuvable.');
        }

        $documents = DB::table($table)
            ->where('dossier_id', $dossier->id)
            ->get()
            ->filter(fn (object $document) => DossierDocumentService::requiresDeeConfirmationForExperts($document));

        if ($documents->isEmpty()) {
            return back()->with('error', "Aucun rapport d'autoévaluation déposé par l'établissement.");
        }

        $pendingIds = $documents
            ->filter(fn (object $document) => DossierDocumentService::isPendingDeeConfirmation($document))
            ->pluck('id')
            ->values();

        if ($pendingIds->isEmpty()) {
            return back()->with('error', "Aucun rapport d'autoévaluation en attente de décision DEE.");
        }

        if (!Schema::hasColumn($table, 'status') && !Schema::hasColumn($table, 'statut')) {
            return back()->with('error', 'Le statut des documents ne peut pas être mis à jour.');
        }

        $payload = [];
        $this->setColumn($table, $payload, 'status', DossierDocumentService::STATUS_ACCEPTED_DEE);
        $this->setColumn($table, $payload, 'statut', DossierDocumentService::STATUS_ACCEPTED_DEE);
        $this->setColumn($table, $payload, 'updated_at', now());

        DB::table($table)
            ->where('dossier_id', $dossier->id)
            ->whereIn('id', $pendingIds)
            ->update($payload);

        ActivityLogger::log(
            'rapport_autoevaluation_accepte',
            "Rapport d'autoévaluation accepté par la DEE pour le dossier {$dossier->reference}",
            $dossier
        );

        return back()->with('success', "Rapport d'autoévaluation accepté. Vous pouvez maintenant l'envoyer aux experts.");
    }

    public function confirmRapportAutoevaluation(Dossier $dossier)
    {
        $table = $this->documentsTable();

        if (!$table) {
            return back()->with('error', 'Table des documents introuvable.');
        }

        $documents = DB::table($table)
            ->where('dossier_id', $dossier->id)
            ->get()
            ->filter(fn (object $document) => DossierDocumentService::requiresDeeConfirmationForExperts($document));

        if ($documents->isEmpty()) {
            return back()->with('error', "Aucun rapport d'autoévaluation déposé par l'établissement.");
        }

        $pendingIds = $documents
            ->filter(fn (object $document) =>
                DossierDocumentService::isPendingDeeConfirmation($document) ||
                DossierDocumentService::isAcceptedByDee($document)
            )
            ->pluck('id')
            ->values();

        if ($pendingIds->isEmpty()) {
            return back()->with('success', "Le rapport d'autoévaluation est déjà confirmé et disponible pour les experts.");
        }

        if (!Schema::hasColumn($table, 'status') && !Schema::hasColumn($table, 'statut')) {
            return back()->with('error', 'Le statut des documents ne peut pas être mis à jour.');
        }

        $payload = [];
        $this->setColumn($table, $payload, 'status', DossierDocumentService::STATUS_CONFIRMED_DEE);
        $this->setColumn($table, $payload, 'statut', DossierDocumentService::STATUS_CONFIRMED_DEE);
        $this->setColumn($table, $payload, 'updated_at', now());

        DB::table($table)
            ->where('dossier_id', $dossier->id)
            ->whereIn('id', $pendingIds)
            ->update($payload);

        $this->notifyConfirmedExperts($dossier);

        $documents
            ->pluck('uploaded_by')
            ->filter()
            ->unique()
            ->each(function (int $userId) use ($dossier) {
                try {
                    NotificationAneaq::envoyer(
                        $userId,
                        'document',
                        "Rapport confirmé par la DEE — {$dossier->reference}",
                        "Votre rapport d'autoévaluation a été confirmé par la DEE et transmis aux experts.",
                        'Dossier',
                        $dossier->id
                    );
                } catch (\Throwable) {
                    // Notification failure must not block confirmation.
                }
            });

        ActivityLogger::log(
            'rapport_autoevaluation_confirme',
            "Rapport d'autoévaluation confirmé et transmis aux experts pour le dossier {$dossier->reference}",
            $dossier
        );

        return back()->with('success', "Rapport d'autoévaluation confirmé et envoyé aux experts.");
    }

    public function rejectRapportAutoevaluation(Request $request, Dossier $dossier)
    {
        $validated = $request->validate([
            'motif' => ['required', 'string', 'min:5', 'max:2000'],
        ], [
            'motif.required' => 'Le motif du refus est obligatoire.',
            'motif.min' => 'Le motif doit contenir au moins :min caractères.',
        ]);

        $table = $this->documentsTable();

        if (!$table) {
            return back()->with('error', 'Table des documents introuvable.');
        }

        $documents = DB::table($table)
            ->where('dossier_id', $dossier->id)
            ->get()
            ->filter(fn (object $document) => DossierDocumentService::requiresDeeConfirmationForExperts($document));

        if ($documents->isEmpty()) {
            return back()->with('error', "Aucun rapport d'autoévaluation déposé par l'établissement.");
        }

        $pendingIds = $documents
            ->filter(fn (object $document) => DossierDocumentService::isPendingDeeConfirmation($document))
            ->pluck('id')
            ->values();

        if ($pendingIds->isEmpty()) {
            return back()->with('error', "Aucun rapport d'autoévaluation en attente de décision DEE.");
        }

        if (!Schema::hasColumn($table, 'status') && !Schema::hasColumn($table, 'statut')) {
            return back()->with('error', 'Le statut des documents ne peut pas être mis à jour.');
        }

        $payload = [];
        $this->setColumn($table, $payload, 'status', DossierDocumentService::STATUS_REJECTED_DEE);
        $this->setColumn($table, $payload, 'statut', DossierDocumentService::STATUS_REJECTED_DEE);
        $this->setColumn($table, $payload, 'motif_rejet', $validated['motif']);
        $this->setColumn($table, $payload, 'observation', $validated['motif']);
        $this->setColumn($table, $payload, 'updated_at', now());

        DB::table($table)
            ->where('dossier_id', $dossier->id)
            ->whereIn('id', $pendingIds)
            ->update($payload);

        $this->notifyEstablishmentForCorrection($dossier, $documents, $validated['motif']);

        ActivityLogger::log(
            'rapport_autoevaluation_refuse',
            "Rapport d'autoévaluation refusé par la DEE pour correction — dossier {$dossier->reference}. Motif : {$validated['motif']}",
            $dossier
        );

        return back()->with('success', "Rapport d'autoévaluation refusé. L'établissement a été notifié pour correction.");
    }

    public function voir(Request $request, Dossier $dossier, $document)
    {
        $table = $this->documentsTable();
        $row   = $table ? DB::table($table)->where('id', $document)->where('dossier_id', $dossier->id)->first() : null;

        abort_if(!$row, 404);

        $path = $row->file_path ?? $row->path ?? $row->fichier ?? null;
        abort_if(!$path, 404);

        if (Storage::disk('public')->exists($path)) {
            $fullPath = Storage::disk('public')->path($path);
        } elseif (Storage::disk('local')->exists($path)) {
            $fullPath = Storage::disk('local')->path($path);
        } else {
            abort(404);
        }

        $mime     = mime_content_type($fullPath);
        $filename = $row->original_name ?? $row->filename ?? basename($path);

        return response()->file($fullPath, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    public function telecharger(Request $request, Dossier $dossier, $document)
    {
        $table = $this->documentsTable();
        $row   = $table ? DB::table($table)->where('id', $document)->where('dossier_id', $dossier->id)->first() : null;

        abort_if(!$row, 404);

        $path = $row->file_path ?? $row->path ?? $row->fichier ?? null;
        abort_if(!$path, 404);

        if (Storage::disk('public')->exists($path)) {
            $fullPath = Storage::disk('public')->path($path);
        } elseif (Storage::disk('local')->exists($path)) {
            $fullPath = Storage::disk('local')->path($path);
        } else {
            abort(404);
        }

        $filename = $row->original_name ?? $row->filename ?? basename($path);

        return response()->download($fullPath, $filename);
    }

    public function destroy(Request $request, Dossier $dossier, $document)
    {
        request()->validate([
            'delete_password' => ['required', 'string'],
        ], [
            'delete_password.required' => 'Le mot de passe de suppression est obligatoire.',
        ]);

        $expectedPassword = config('app.dee_delete_password', env('DEE_DELETE_PASSWORD'));

        if (!$expectedPassword || !hash_equals((string) $expectedPassword, (string) request()->input('delete_password'))) {
            return back()->withErrors([
                'delete_password' => 'Mot de passe incorrect.',
            ]);
        }


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

        if ($path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            } elseif (Storage::disk('local')->exists($path)) {
                Storage::disk('local')->delete($path);
            }
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

    private function notifyConfirmedExperts(Dossier $dossier): void
    {
        if (
            !Schema::hasTable('dossier_experts')
            || !Schema::hasTable('experts')
            || !Schema::hasColumn('experts', 'user_id')
        ) {
            return;
        }

        $assignments = DB::table('dossier_experts')
            ->where('dossier_id', $dossier->id);

        if (Schema::hasColumn('dossier_experts', 'status')) {
            $assignments->whereIn('status', [
                'accepte_par_expert',
                'confirme_par_expert',
                'comite_confirme',
            ]);
        }

        $expertIds = $assignments->pluck('expert_id')->filter()->unique();

        if ($expertIds->isEmpty()) {
            return;
        }

        DB::table('experts')
            ->whereIn('id', $expertIds)
            ->get(['id', 'user_id', 'nom', 'prenom', 'email'])
            ->filter(fn ($e) => $e->user_id)
            ->unique('user_id')
            ->each(function (object $expert) use ($dossier) {
                $expertName = trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) ?: 'Expert';

                // In-app notification
                try {
                    NotificationAneaq::envoyer(
                        $expert->user_id,
                        'document',
                        "Rapport d'autoévaluation disponible — {$dossier->reference}",
                        "La DEE a confirmé le rapport d'autoévaluation. Il est maintenant disponible dans votre dossier expert.",
                        'Dossier',
                        $dossier->id
                    );
                } catch (\Throwable) {}

                // Email notification
                $emailTo = $expert->email
                    ?? User::find($expert->user_id)?->email;

                if ($emailTo) {
                    try {
                        Mail::to($emailTo)->send(new ExpertNotificationMail(
                            expertName: $expertName,
                            titre: "Rapport d'autoévaluation disponible — {$dossier->reference}",
                            notificationMessage: "La DEE a confirmé et transmis le rapport d'autoévaluation pour le dossier {$dossier->reference}. "
                                . "Ce document est maintenant disponible dans votre espace expert pour consultation avant la visite.",
                            platformUrl: config('app.url') . '/expert/dossiers',
                        ));
                    } catch (\Throwable) {
                        // Email failure must not block confirmation.
                    }
                }
            });
    }

    private function notifyEstablishmentForCorrection(Dossier $dossier, $documents, string $motif): void
    {
        $userIds = collect($documents)
            ->pluck('uploaded_by')
            ->filter()
            ->unique()
            ->values();

        if (
            Schema::hasTable('etablissements')
            && Schema::hasColumn('etablissements', 'user_id')
            && $dossier->etablissement_id
        ) {
            $etablissementUserId = DB::table('etablissements')
                ->where('id', $dossier->etablissement_id)
                ->value('user_id');

            if ($etablissementUserId) {
                $userIds->push($etablissementUserId);
            }
        }

        $userIds
            ->filter()
            ->unique()
            ->each(function (int $userId) use ($dossier, $motif) {
                try {
                    NotificationAneaq::envoyer(
                        $userId,
                        'document',
                        "Rapport d'autoévaluation à corriger — {$dossier->reference}",
                        "La DEE a refusé votre rapport d'autoévaluation. Motif : {$motif}. Merci de déposer une version corrigée.",
                        'Dossier',
                        $dossier->id
                    );
                } catch (\Throwable) {
                    // Notification failure must not block the rejection workflow.
                }
            });
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
