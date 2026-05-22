<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Mail\ExpertAccountCreatedMail;
use App\Mail\ExpertNotificationMail;
use App\Models\Dossier;
use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use App\Models\DossierExpert;
use App\Models\Expert;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DossierExpertController extends Controller
{
    public function store(Request $request, Dossier $dossier)
    {
        $validated = $request->validate([
            'expert_id' => ['required', 'exists:experts,id'],
            'role_expert' => ['required', 'string', 'in:expert,chef_comite'],
        ]);

        $expert = Expert::findOrFail($validated['expert_id']);

        if (empty($expert->email)) {
            return back()->withErrors([
                'expert_id' => "Cet expert ne possède pas d'adresse email.",
            ]);
        }

        $alreadyAssigned = DossierExpert::query()
            ->where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->exists();

        if ($alreadyAssigned) {
            return back()->withErrors([
                'expert_id' => 'Cet expert est déjà affecté à ce dossier.',
            ]);
        }

        $payload = [
            'dossier_id' => $dossier->id,
            'expert_id' => $expert->id,
            'role_expert' => $validated['role_expert'],
        ];

        if (Schema::hasColumn('dossier_experts', 'status')) {
            $payload['status'] = 'en_attente_confirmation_dee';
        }

        if (Schema::hasColumn('dossier_experts', 'invitation_token')) {
            $payload['invitation_token'] = null;
        }

        if (Schema::hasColumn('dossier_experts', 'access_sent_at')) {
            $payload['access_sent_at'] = null;
        }

        if (Schema::hasColumn('dossier_experts', 'dee_confirmed_at')) {
            $payload['dee_confirmed_at'] = null;
        }

        if (Schema::hasColumn('dossier_experts', 'expert_confirmed_at')) {
            $payload['expert_confirmed_at'] = null;
        }

        if (Schema::hasColumn('dossier_experts', 'expert_refused_at')) {
            $payload['expert_refused_at'] = null;
        }

        DossierExpert::create($payload);
        ActivityLogger::log('expert_affecte', "Expert {$expert->prenom} {$expert->nom} affecté au dossier {$dossier->reference}", $dossier);

        // Notify expert if they already have an account
        $this->notifyExpert($expert, 'affectation_dossier',
            "Proposition d'affectation — {$dossier->reference}",
            "Vous avez été proposé comme {$this->roleLabel($validated['role_expert'])} pour le dossier {$dossier->reference}. En attente de confirmation DEE.",
            $dossier->id
        );

        return back()->with('success', 'Expert ajouté en attente de confirmation DEE.');
    }

    public function confirm(Request $request, Dossier $dossier, DossierExpert $dossierExpert)
    {
        if ((int) $dossierExpert->dossier_id !== (int) $dossier->id) {
            abort(404);
        }

        $dossierExpert->load('expert');

        $expert = $dossierExpert->expert;

        if (!$expert) {
            return back()->with('error', 'Expert introuvable.');
        }

        if (empty($expert->email)) {
            return back()->with('error', "Cet expert ne possède pas d'adresse email.");
        }

        $token = Str::random(64);
        $isNewUser = false;
        $plainPassword = null;

        $expertName = trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? ''));

        if ($expertName === '') {
            $expertName = $expert->name ?? $expert->nom ?? 'Expert';
        }

        DB::transaction(function () use ($expert, $expertName, $token, $dossierExpert, &$isNewUser, &$plainPassword) {
            $existingUser = User::where('email', $expert->email)->first();
            $isNewUser = !$existingUser;

            // Always generate a new password so the expert receives usable credentials
            $plainPassword = Str::random(10);

            if ($isNewUser) {
                $user = new User();
                $user->name = $expertName;
                $user->email = $expert->email;
            } else {
                $user = $existingUser;
            }

            $user->password = Hash::make($plainPassword);

            if (Schema::hasColumn('users', 'role')) {
                $user->role = 'expert';
            }

            if (Schema::hasColumn('users', 'email_verified_at') && empty($user->email_verified_at)) {
                $user->email_verified_at = now();
            }

            $user->save();

            if (Schema::hasColumn('experts', 'user_id')) {
                $expert->forceFill([
                    'user_id' => $user->id,
                ])->save();
            }

            $payload = [];

            if (Schema::hasColumn('dossier_experts', 'status')) {
                $payload['status'] = 'en_attente_confirmation_expert';
            }

            if (Schema::hasColumn('dossier_experts', 'invitation_token')) {
                $payload['invitation_token'] = $token;
            }

            if (Schema::hasColumn('dossier_experts', 'access_sent_at')) {
                $payload['access_sent_at'] = now();
            }

            if (Schema::hasColumn('dossier_experts', 'dee_confirmed_at')) {
                $payload['dee_confirmed_at'] = now();
            }

            if (Schema::hasColumn('dossier_experts', 'expert_confirmed_at')) {
                $payload['expert_confirmed_at'] = null;
            }

            if (Schema::hasColumn('dossier_experts', 'expert_refused_at')) {
                $payload['expert_refused_at'] = null;
            }

            $dossierExpert->forceFill($payload)->save();
        });

        try {
            $confirmationUrl = route('experts.invitation.confirm', [
                'token' => $token,
            ]);

            // Always send credentials — expert needs fresh password for each dossier assignment
            Mail::to($expert->email)->send(
                new ExpertAccountCreatedMail(
                    expertName: $expertName,
                    loginEmail: $expert->email,
                    plainPassword: $plainPassword,
                    dossierReference: $dossier->reference ?? '—',
                    campaignReference: $dossier->campagne ?? $dossier->campagne_reference ?? '—',
                    confirmationUrl: $confirmationUrl,
                    expertRole: $this->roleLabel($dossierExpert->role_expert),
                )
            );

            ActivityLogger::log('expert_confirme', "Expert {$expertName} confirmé pour le dossier {$dossier->reference}", $dossier);

            // Notify expert — user now exists after transaction
            $expert->refresh();
            $this->notifyExpert($expert, 'affectation_dossier',
                "Invitation à confirmer — {$dossier->reference}",
                "La DEE vous a confirmé comme {$this->roleLabel($dossierExpert->role_expert)} pour le dossier {$dossier->reference}. Veuillez confirmer votre participation via le lien reçu par email.",
                $dossier->id
            );

            $action = $isNewUser ? 'Compte créé' : 'Invitation envoyée';
            $msg = "{$action} pour {$expertName}. Email envoyé à {$expert->email}.";

            if (app()->environment('local') && $isNewUser) {
                $msg .= " [DEV] Mot de passe : {$plainPassword}";
            }

            return back()->with('success', $msg);
        } catch (\Throwable $e) {
            return back()->with(
                'error',
                'Expert accepté et compte créé, mais email non envoyé : ' . $e->getMessage()
            );
        }
    }

    public function renvoyerEmail(Dossier $dossier, DossierExpert $dossierExpert)
    {
        if ((int) $dossierExpert->dossier_id !== (int) $dossier->id) {
            abort(404);
        }

        $dossierExpert->load('expert');
        $expert = $dossierExpert->expert;

        if (!$expert || empty($expert->email)) {
            return back()->with('error', "Cet expert ne possède pas d'adresse email.");
        }

        $expertName = trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) ?: ($expert->name ?? 'Expert');

        // Generate a new token
        $token = Str::random(64);
        if (Schema::hasColumn('dossier_experts', 'invitation_token')) {
            $dossierExpert->forceFill(['invitation_token' => $token])->save();
        }

        // Always generate a new password so the expert receives usable credentials
        $plainPassword = Str::random(10);
        $user = User::where('email', $expert->email)->first();
        if (!$user) {
            $user = User::create([
                'name'              => $expertName,
                'email'             => $expert->email,
                'password'          => Hash::make($plainPassword),
                'role'              => 'expert',
                'email_verified_at' => now(),
            ]);
            if (Schema::hasColumn('experts', 'user_id')) {
                $expert->forceFill(['user_id' => $user->id])->save();
            }
        } else {
            $user->password = Hash::make($plainPassword);
            $user->save();
        }

        try {
            $confirmationUrl = route('experts.invitation.confirm', ['token' => $token]);

            Mail::to($expert->email)->send(
                new ExpertAccountCreatedMail(
                    expertName:        $expertName,
                    loginEmail:        $expert->email,
                    plainPassword:     $plainPassword,
                    dossierReference:  $dossier->reference ?? '—',
                    campaignReference: $dossier->campagne ?? $dossier->campagne_reference ?? '—',
                    confirmationUrl:   $confirmationUrl,
                    expertRole:        $this->roleLabel($dossierExpert->role_expert),
                )
            );

            $msg = "Email renvoyé à {$expert->email}.";
            if (app()->environment('local') && $plainPassword) {
                $msg .= " [DEV] Mot de passe : {$plainPassword}";
            }

            return back()->with('success', $msg);
        } catch (\Throwable $e) {
            return back()->with('error', 'Email non envoyé : ' . $e->getMessage());
        }
    }

    public function refuse(Dossier $dossier, DossierExpert $dossierExpert)
    {
        if ((int) $dossierExpert->dossier_id !== (int) $dossier->id) {
            abort(404);
        }

        $expert = $dossierExpert->expert;

        $this->notifyExpert($expert, 'general',
            "Affectation refusée — {$dossier->reference}",
            "Votre proposition d'affectation pour le dossier {$dossier->reference} a été refusée par la DEE.",
            $dossier->id
        );

        ActivityLogger::log('expert_refuse', "Expert refusé sur le dossier {$dossier->reference}", $dossier);
        $dossierExpert->delete();

        return back()->with('success', 'Expert refusé et supprimé du dossier.');
    }

    public function destroy(Request $request, Dossier $dossier, DossierExpert $dossierExpert)
    {
        if ((int) $dossierExpert->dossier_id !== (int) $dossier->id) {
            abort(404);
        }

        $request->validate([
            'delete_password' => ['required', 'string'],
        ], [
            'delete_password.required' => 'Le mot de passe de suppression est obligatoire.',
        ]);

        $expectedPassword = config('app.dee_delete_password', env('DEE_DELETE_PASSWORD'));

        if (
            !$expectedPassword ||
            !hash_equals((string) $expectedPassword, (string) $request->input('delete_password'))
        ) {
            return back()->withErrors([
                'delete_password' => 'Mot de passe incorrect.',
            ]);
        }

        $expert = $dossierExpert->expert;

        $this->notifyExpert($expert, 'general',
            "Retiré du dossier — {$dossier->reference}",
            "Vous avez été retiré du dossier {$dossier->reference} par la DEE.",
            $dossier->id
        );

        $dossierExpert->delete();

        return back()->with('success', 'Expert supprimé du dossier avec succès.');
    }

    private function notifyExpert(?Expert $expert, string $type, string $titre, string $message, int $dossierId): void
    {
        if (!$expert) return;

        try {
            $userId = $expert->user_id ?? User::where('email', $expert->email)->value('id');
            if (!$userId) return;

            // Platform notification
            NotificationAneaq::envoyer($userId, $type, $titre, $message, 'Dossier', $dossierId);

            // Email notification — brief summary + link to platform
            if (!empty($expert->email)) {
                $expertName = trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) ?: ($expert->name ?? 'Expert');
                Mail::to($expert->email)->send(new ExpertNotificationMail(
                    expertName:  $expertName,
                    titre:       $titre,
                    message:     $message,
                    platformUrl: config('app.url') . '/expert/dashboard',
                ));
            }
        } catch (\Throwable) {}
    }

    private function roleLabel(?string $role): string
    {
        return match ($role) {
            'chef_comite' => 'Chef de comité',
            'expert' => 'Expert',
            default => 'Expert',
        };
    }
}