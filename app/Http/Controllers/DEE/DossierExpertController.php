<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Mail\ExpertAccountCreatedMail;
use App\Models\Dossier;
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

        $plainPassword = Str::random(10);
        $token = Str::random(64);

        $expertName = trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? ''));

        if ($expertName === '') {
            $expertName = $expert->name ?? $expert->nom ?? 'Expert';
        }

        DB::transaction(function () use ($expert, $expertName, $plainPassword, $token, $dossierExpert) {
            $user = User::firstOrNew([
                'email' => $expert->email,
            ]);

            $user->name = $expertName;
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
            return back()->with('success', 'Expert accepté, compte créé et email envoyé avec succès.');
        } catch (\Throwable $e) {
            return back()->with(
                'error',
                'Expert accepté et compte créé, mais email non envoyé : ' . $e->getMessage()
            );
        }
    }

    public function refuse(Dossier $dossier, DossierExpert $dossierExpert)
    {
        if ((int) $dossierExpert->dossier_id !== (int) $dossier->id) {
            abort(404);
        }

        $expert = $dossierExpert->expert;
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

        $dossierExpert->delete();

        return back()->with('success', 'Expert supprimé du dossier avec succès.');
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