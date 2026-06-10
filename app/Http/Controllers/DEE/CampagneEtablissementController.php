<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Mail\EtablissementAccountCreatedMail;
use App\Models\CampagneEtablissement;
use App\Models\CampagneEvaluation;
use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\NotificationAneaq;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CampagneEtablissementController extends Controller
{
    public function attach(Request $request, CampagneEvaluation $campagneEvaluation)
    {
        $validated = $request->validate([
            'etablissement_id' => ['nullable', 'exists:etablissements,id'],
            'etablissement_ids' => ['nullable', 'array'],
            'etablissement_ids.*' => ['exists:etablissements,id'],
        ]);

        $ids = [];

        if (!empty($validated['etablissement_id'])) {
            $ids[] = (int) $validated['etablissement_id'];
        }

        if (!empty($validated['etablissement_ids'])) {
            $ids = array_merge($ids, array_map('intval', $validated['etablissement_ids']));
        }

        $ids = array_values(array_unique($ids));

        if (count($ids) === 0) {
            return back()->with('error', 'Aucun établissement sélectionné.');
        }

        $added = 0;

        foreach ($ids as $etablissementId) {
            $etablissement = Etablissement::find($etablissementId);

            if (!$etablissement) {
                continue;
            }

            $exists = CampagneEtablissement::query()
                ->where('campagne_evaluation_id', $campagneEvaluation->id)
                ->where('etablissement_id', $etablissement->id)
                ->exists();

            if ($exists) {
                continue;
            }

            $campagneEtablissement = new CampagneEtablissement();

            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'campagne_evaluation_id', $campagneEvaluation->id);
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'etablissement_id', $etablissement->id);
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'email', $this->read($etablissement, ['email'], null));
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'statut', 'en_attente_confirmation_dee');
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'status', 'en_attente_confirmation_dee');

            if (auth()->check()) {
                $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'selected_by', auth()->id());
                $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'created_by', auth()->id());
            }

            $campagneEtablissement->save();
            $added++;
        }

        if ($added === 0) {
            return back()->with('error', 'Les établissements sélectionnés sont déjà rattachés à cette vague.');
        }

        return back()->with('success', $added . ' établissement(s) ajouté(s) à la vague avec succès.');
    }

    public function confirm(
        Request $request,
        CampagneEvaluation $campagneEvaluation,
        CampagneEtablissement $campagneEtablissement
    ) {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'message_lettre' => ['nullable', 'string'],
            'lettre_dee' => ['nullable', 'file', 'mimes:pdf,doc,docx,png,jpg,jpeg', 'max:10240'],
        ]);

        if ((int) $campagneEtablissement->campagne_evaluation_id !== (int) $campagneEvaluation->id) {
            abort(404);
        }

        $etablissement = Etablissement::findOrFail($campagneEtablissement->etablissement_id);

        // Check if this email is already used by a different establishment
        if ($this->hasColumn('etablissements', 'email')) {
            $emailUsedByOther = Etablissement::query()
                ->where('email', $validated['email'])
                ->where('id', '!=', $etablissement->id)
                ->first();

            if ($emailUsedByOther) {
                $otherName = $this->read($emailUsedByOther, ['nom', 'etablissement_2', 'etablissement', 'name'], 'un autre établissement');

                return back()->withErrors([
                    'email' => "Cet email est déjà associé à l'établissement « {$otherName} ».",
                ]);
            }
        }

        $isNewUser   = false;
        $mailPayload = null; // filled inside transaction, used outside

        DB::transaction(function () use ($request, $validated, $campagneEvaluation, $campagneEtablissement, $etablissement, &$isNewUser, &$mailPayload) {
            $password = Str::random(10);

            $user = User::query()
                ->where('email', $validated['email'])
                ->first();

            $isNewUser = !$user;

            if ($isNewUser) {
                $user = new User();
                $user->name = $this->etablissementName($etablissement);
                $user->email = $validated['email'];
            }

            // Always reset the password so the email credentials are always valid
            $user->password = Hash::make($password);

            if ($this->hasColumn('users', 'role')) {
                $user->role = 'etablissement';
            }

            if ($this->hasColumn('users', 'type')) {
                $user->type = 'etablissement';
            }

            if ($this->hasColumn('users', 'email_verified_at') && empty($user->email_verified_at)) {
                $user->email_verified_at = now();
            }

            $user->save();

            if ($this->hasColumn('etablissements', 'user_id')) {
                $etablissement->user_id = $user->id;
            }

            if ($this->hasColumn('etablissements', 'email')) {
                $etablissement->email = $validated['email'];
            }

            $etablissement->save();

            $dossier = $this->createOrGetDossier(
                $campagneEvaluation,
                $campagneEtablissement,
                $etablissement
            );

            if ($request->hasFile('lettre_dee')) {
                $this->storeLettreInDossier($request->file('lettre_dee'), $dossier);
            }

            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'email', $validated['email']);
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'statut', 'acces_envoye');
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'status', 'acces_envoye');
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'access_sent_at', now());
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'email_envoye_at', now());
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'compte_genere_at', now());
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'dossier_id', $dossier->id);
            $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'dossier_reference', $this->read($dossier, ['reference'], null));

            if ($request->hasFile('lettre_dee')) {
                $this->setIfColumn($campagneEtablissement, 'campagne_etablissements', 'lettre_envoyee_at', now());
            }

            $campagneEtablissement->save();

            $messageLettre = trim((string) $request->input('message_lettre', ''));

            if ($messageLettre === '') {
                $messageLettre = null;
            }

            // Store mail data to send AFTER the transaction commits (so DB rollback doesn't happen on SMTP failure)
            $mailPayload = [
                'to'             => $validated['email'],
                'etab_nom'       => $this->etablissementName($etablissement),
                'password'       => $password,
                'dossier_ref'    => $this->read($dossier, ['reference'], null),
                'campagne_ref'   => $this->read($campagneEvaluation, ['reference'], null),
                'message_lettre' => $messageLettre,
            ];
        });

        // Send email outside the transaction so SMTP errors don't rollback DB changes
        $mailError = null;
        if ($mailPayload) {
            try {
                Mail::to($mailPayload['to'])->send(
                    new EtablissementAccountCreatedMail(
                        $mailPayload['etab_nom'],
                        $mailPayload['to'],
                        $mailPayload['password'],
                        $mailPayload['dossier_ref'],
                        $mailPayload['campagne_ref'],
                        $mailPayload['message_lettre']
                    )
                );
                Log::info('EMAIL ETABLISSEMENT ENVOYE AVEC SUCCES', $mailPayload);
            } catch (\Throwable $e) {
                $mailError = $e->getMessage();
                Log::error('ECHEC ENVOI EMAIL ETABLISSEMENT', ['error' => $mailError, 'to' => $mailPayload['to']]);
            }
        }

        if ($mailError) {
            $msg = 'Compte établissement ' . ($isNewUser ? 'créé' : 'mis à jour') . ' et dossier assigné avec succès. ⚠️ L\'email n\'a pas pu être envoyé (erreur SMTP). Vérifiez les paramètres email dans Paramètres.';
            return back()->with('success', $msg);
        }

        $msg = 'Compte établissement ' . ($isNewUser ? 'créé' : 'mis à jour') . ', dossier assigné et email envoyé avec succès.';

        return back()->with('success', $msg);
    }

    public function refuse(
        CampagneEvaluation $campagneEvaluation,
        CampagneEtablissement $campagneEtablissement
    ) {
        if ((int) $campagneEtablissement->campagne_evaluation_id !== (int) $campagneEvaluation->id) {
            abort(404);
        }

        $campagneEtablissement->delete();

        return back()->with('success', 'Établissement retiré de la vague avec succès.');
    }

    private function createOrGetDossier(
        CampagneEvaluation $campagneEvaluation,
        CampagneEtablissement $campagneEtablissement,
        Etablissement $etablissement
    ): Dossier {
        if (
            $this->hasColumn('campagne_etablissements', 'dossier_id')
            && !empty($campagneEtablissement->dossier_id)
        ) {
            $existingDossier = Dossier::find($campagneEtablissement->dossier_id);

            if ($existingDossier) {
                return $existingDossier;
            }
        }

        $reference = $this->makeDossierReference($campagneEvaluation, $etablissement);

        if ($this->hasColumn('dossiers', 'reference')) {
            $existingDossier = Dossier::query()
                ->where('reference', $reference)
                ->first();

            if ($existingDossier) {
                return $existingDossier;
            }
        }

        $query = Dossier::query();
        $canSearch = false;

        if ($this->hasColumn('dossiers', 'campagne_evaluation_id')) {
            $query->where('campagne_evaluation_id', $campagneEvaluation->id);
            $canSearch = true;
        }

        if ($this->hasColumn('dossiers', 'campagne_id')) {
            $query->where('campagne_id', $campagneEvaluation->id);
            $canSearch = true;
        }

        if ($this->hasColumn('dossiers', 'etablissement_id')) {
            $query->where('etablissement_id', $etablissement->id);
            $canSearch = true;
        }

        if ($canSearch) {
            $existingDossier = $query->first();

            if ($existingDossier) {
                return $existingDossier;
            }
        }

        $etablissementNom = $this->etablissementName($etablissement);
        $dossierNom = 'Dossier ' . $reference . ' - ' . $etablissementNom;

        $dossier = new Dossier();

        $this->setIfColumn($dossier, 'dossiers', 'reference', $reference);

        $this->setIfColumn($dossier, 'dossiers', 'nom', $dossierNom);
        $this->setIfColumn($dossier, 'dossiers', 'name', $dossierNom);
        $this->setIfColumn($dossier, 'dossiers', 'titre', $dossierNom);
        $this->setIfColumn($dossier, 'dossiers', 'title', $dossierNom);

        $this->setIfColumn($dossier, 'dossiers', 'campagne_evaluation_id', $campagneEvaluation->id);
        $this->setIfColumn($dossier, 'dossiers', 'campagne_id', $campagneEvaluation->id);
        $this->setIfColumn($dossier, 'dossiers', 'campagne_etablissement_id', $campagneEtablissement->id);
        $this->setIfColumn($dossier, 'dossiers', 'etablissement_id', $etablissement->id);

        $this->setIfColumn($dossier, 'dossiers', 'etablissement_nom', $etablissementNom);
        $this->setIfColumn($dossier, 'dossiers', 'nom_etablissement', $etablissementNom);
        $this->setIfColumn($dossier, 'dossiers', 'universite', $this->read($etablissement, ['universite'], null));
        $this->setIfColumn($dossier, 'dossiers', 'ville', $this->read($etablissement, ['ville'], null));
        $this->setIfColumn($dossier, 'dossiers', 'type', $this->etablissementType($etablissement));

        $this->setIfColumn($dossier, 'dossiers', 'statut', 'en_attente_formulaire');
        $this->setIfColumn($dossier, 'dossiers', 'status', 'en_attente_formulaire');

        if (auth()->check()) {
            $this->setIfColumn($dossier, 'dossiers', 'created_by', auth()->id());
            $this->setIfColumn($dossier, 'dossiers', 'user_id', auth()->id());
        }

        $dossier->save();

        ActivityLogger::log('dossier_cree', "Dossier {$dossier->reference} créé pour l'établissement", $dossier);

        // Notify the établissement user that their dossier has been created
        if ($etablissement->user_id) {
            NotificationAneaq::envoyer(
                $etablissement->user_id,
                'info',
                'Dossier d\'évaluation créé',
                "Un dossier d'évaluation ({$dossier->reference}) vous a été affecté. Vous pouvez maintenant compléter votre formulaire.",
                'Dossier',
                $dossier->id
            );
        }

        return $dossier;
    }

    private function storeLettreInDossier($file, Dossier $dossier): ?string
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();

        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        $safeName = Str::slug($baseName);

        if ($safeName === '') {
            $safeName = 'lettre-dee';
        }

        $fileName = now()->format('YmdHis') . '_' . $safeName . '.' . $extension;

        $path = $file->storeAs(
            'dossiers/' . $dossier->id . '/lettres',
            $fileName,
            'public'
        );

        $table = null;

        if (Schema::hasTable('dossier_documents')) {
            $table = 'dossier_documents';
        } elseif (Schema::hasTable('documents')) {
            $table = 'documents';
        }

        if (!$table) {
            Log::warning('Aucune table documents trouvée pour stocker la lettre DEE.', [
                'dossier_id' => $dossier->id,
                'path' => $path,
            ]);

            return $path;
        }

        $data = [];

        $this->addInsertColumn($data, $table, 'dossier_id', $dossier->id);
        $this->addInsertColumn($data, $table, 'nom', $originalName);
        $this->addInsertColumn($data, $table, 'name', $originalName);
        $this->addInsertColumn($data, $table, 'titre', 'Lettre DEE');
        $this->addInsertColumn($data, $table, 'title', 'Lettre DEE');
        $this->addInsertColumn($data, $table, 'type', 'lettre_dee');
        $this->addInsertColumn($data, $table, 'document_type', 'lettre_dee');
        $this->addInsertColumn($data, $table, 'fichier', $path);
        $this->addInsertColumn($data, $table, 'path', $path);
        $this->addInsertColumn($data, $table, 'file_path', $path);
        $this->addInsertColumn($data, $table, 'mime_type', $file->getClientMimeType());
        $this->addInsertColumn($data, $table, 'taille', $file->getSize());
        $this->addInsertColumn($data, $table, 'size', $file->getSize());

        if (auth()->check()) {
            $this->addInsertColumn($data, $table, 'created_by', auth()->id());
            $this->addInsertColumn($data, $table, 'user_id', auth()->id());
        }

        $this->addInsertColumn($data, $table, 'created_at', now());
        $this->addInsertColumn($data, $table, 'updated_at', now());

        if (!empty($data)) {
            DB::table($table)->insert($data);
        }

        return $path;
    }

    private function makeDossierReference(
        CampagneEvaluation $campagneEvaluation,
        Etablissement $etablissement
    ): string {
        $annee = $this->read($campagneEvaluation, ['annee'], now()->year);

        return 'DOS-' . $annee . '-' . $campagneEvaluation->id . '-' . $etablissement->id;
    }

    private function etablissementName(Etablissement $etablissement): string
    {
        return (string) $this->read(
            $etablissement,
            ['nom', 'name', 'etablissement', 'etablissement_2', 'acronyme'],
            'Établissement'
        );
    }

    private function etablissementType(Etablissement $etablissement): ?string
    {
        return $this->read(
            $etablissement,
            ['type', 'vocation', 'domaine_connaissances', 'evaluation'],
            null
        );
    }

    private function read($model, array $columns, $default = null)
    {
        foreach ($columns as $column) {
            $value = null;

            if (method_exists($model, 'getAttribute')) {
                $value = $model->getAttribute($column);
            } elseif (isset($model->{$column})) {
                $value = $model->{$column};
            }

            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return $default;
    }

    private function hasColumn(string $table, string $column): bool
    {
        return Schema::hasTable($table) && Schema::hasColumn($table, $column);
    }

    private function setIfColumn($model, string $table, string $column, $value): void
    {
        if ($this->hasColumn($table, $column)) {
            $model->{$column} = $value;
        }
    }

    private function addInsertColumn(array &$data, string $table, string $column, $value): void
    {
        if ($this->hasColumn($table, $column)) {
            $data[$column] = $value;
        }
    }
}