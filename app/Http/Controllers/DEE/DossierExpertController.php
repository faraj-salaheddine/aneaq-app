<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Mail\ExpertAccountCreatedMail;
use App\Models\Dossier;
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

        DossierExpert::create([
            'dossier_id' => $dossier->id,
            'expert_id' => $expert->id,
            'role_expert' => $validated['role_expert'],
            'status' => 'en_attente_confirmation_dee',
            'invitation_token' => null,
            'access_sent_at' => null,
            'dee_confirmed_at' => null,
            'expert_confirmed_at' => null,
        ]);

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
            $expertName = $expert->nom ?? $expert->name ?? 'Expert';
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

            $user->save();

            $dossierExpert->update([
                'status' => 'acces_envoye',
                'invitation_token' => $token,
                'access_sent_at' => now(),
                'dee_confirmed_at' => now(),
            ]);
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
                    dossierReference: $dossier->reference,
                    campaignReference: $dossier->campagne ?? '—',
                    confirmationUrl: $confirmationUrl,
                    expertRole: $this->roleLabel($dossierExpert->role_expert),
                )
            );

            return back()->with('success', 'Expert accepté, compte créé et email envoyé avec succès.');
        } catch (\Throwable $e) {
            return back()->with(
                'error',
                'Expert accepté, mais email non envoyé : ' . $e->getMessage()
            );
        }
    }

    public function refuse(Dossier $dossier, DossierExpert $dossierExpert)
    {
        if ((int) $dossierExpert->dossier_id !== (int) $dossier->id) {
            abort(404);
        }

        $dossierExpert->delete();

        return back()->with('success', 'Expert refusé et supprimé du dossier.');
    }

    public function destroy(Dossier $dossier, DossierExpert $dossierExpert)
    {
        if ((int) $dossierExpert->dossier_id !== (int) $dossier->id) {
            abort(404);
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