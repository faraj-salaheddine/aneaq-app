<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\DossierExpert;

class ExpertInvitationController extends Controller
{
    public function confirm(string $token)
    {
        $dossierExpert = DossierExpert::where('invitation_token', $token)->firstOrFail();

        if (!$dossierExpert->expert_confirmed_at) {
            $dossierExpert->update([
                'status' => 'confirme_par_expert',
                'expert_confirmed_at' => now(),
                'invitation_token' => null,
            ]);
        }

        return redirect()->route('login')->with(
            'status',
            "Votre confirmation a été enregistrée. L'administrateur DEE peut maintenant suivre votre affectation."
        );
    }
}