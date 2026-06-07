<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\Etablissement;
use App\Models\MessageDossier;
use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use App\Services\NotifierDee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VisiteConfirmationController extends Controller
{
    public function repondre(Request $request, Dossier $dossier)
    {
        $request->validate([
            'statut'  => 'required|in:accepte,refuse',
            'message' => 'nullable|string|max:1000',
        ]);

        // Vérifier que l'expert est bien affecté à ce dossier
        $user   = Auth::user();
        $expert = $this->findExpert($user);
        if (!$expert) abort(403);

        $dossierExpert = DossierExpert::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->firstOrFail();

        if (empty($dossier->date_visite)) {
            return back()->withErrors(['statut' => 'Aucune date de visite planifiée.']);
        }

        $statut  = $request->statut;
        $message = $request->message;

        $dossierExpert->visite_statut  = $statut;
        $dossierExpert->visite_message = $message;
        $dossierExpert->save();

        // Message dans le dossier si refus
        if ($statut === 'refuse' && $message) {
            MessageDossier::create([
                'dossier_id'            => $dossier->id,
                'user_id'               => Auth::id(),
                'contenu'               => "🚫 L'expert " . trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) . " a refusé la date de visite.\nMotif : " . $message,
                'role'                  => 'expert',
                'lu_par_dee'            => false,
                'lu_par_expert'         => true,
                'lu_par_etablissement'  => false,
            ]);
        }

        if ($statut === 'refuse') {
            $this->annulerDateVisite($dossier, $expert, $message);
        } else {
            NotifierDee::pourDossier(
                $dossier,
                'visite',
                "Visite acceptée par expert — {$dossier->reference}",
                "L'expert " . trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) . " a accepté la date de visite."
            );

            ActivityLogger::log('visite_acceptee_expert', "Expert a accepté la date de visite — {$dossier->reference}", $dossier);

            // Vérifier si tout le monde a accepté
            $this->checkTousAcceptes($dossier);
        }

        $msg = $statut === 'accepte'
            ? 'Vous avez accepté la date de visite.'
            : 'Vous avez refusé la date de visite. La DEE a été notifiée.';

        return back()->with('success', $msg);
    }

    private function checkTousAcceptes(Dossier $dossier): void
    {
        if (($dossier->visite_statut_etab ?? null) !== 'accepte') return;

        $confirmedStatuts = ['accepte_par_expert', 'confirme_par_expert', 'comite_confirme'];

        $totalConfirmed = DossierExpert::where('dossier_id', $dossier->id)
            ->whereIn('status', $confirmedStatuts)
            ->count();

        if ($totalConfirmed > 0) {
            $hasUnconfirmed = DossierExpert::where('dossier_id', $dossier->id)
                ->whereIn('status', $confirmedStatuts)
                ->where(function ($q) {
                    $q->where('visite_statut', '!=', 'accepte')->orWhereNull('visite_statut');
                })
                ->exists();

            if ($hasUnconfirmed) return;
        }

        // Tout le monde a accepté !
        $dossier->statut = 'visite_confirmee';
        $dossier->save();

        NotifierDee::pourDossier(
            $dossier,
            'visite',
            "✅ Visite confirmée par tous — {$dossier->reference}",
            "L'établissement et tous les experts ont accepté la date de visite."
        );

        ActivityLogger::log('visite_confirmee_tous', "Visite confirmée par tous — {$dossier->reference}", $dossier);
    }

    private function findExpert($user)
    {
        if (!$user || !Schema::hasTable('experts')) return null;

        $query = DB::table('experts');
        $query->where(function ($q) use ($user) {
            $hasCondition = false;
            if (Schema::hasColumn('experts', 'user_id')) {
                $q->where('user_id', $user->id);
                $hasCondition = true;
            }
            if (Schema::hasColumn('experts', 'email')) {
                $hasCondition ? $q->orWhere('email', $user->email) : $q->where('email', $user->email);
            }
        });

        return $query->first();
    }

    private function annulerDateVisite(Dossier $dossier, $expert, ?string $motif): void
    {
        $expertNom    = trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? ''));
        $ancienneDate = $dossier->date_visite?->format('d/m/Y');
        $motifTxt     = $motif ? " Motif : {$motif}" : '';

        // Annuler la date (garder visite_statut_etab/message pour que la DEE voie le motif)
        $dossier->date_visite = null;
        $dossier->statut      = 'rapport_depose';
        $dossier->save();

        // Réinitialiser les confirmations des autres experts (garder celle du refusant)
        DossierExpert::where('dossier_id', $dossier->id)
            ->where('expert_id', '!=', $expert->id)
            ->update(['visite_statut' => null, 'visite_message' => null]);

        // Notifier la DEE
        NotifierDee::pourDossier(
            $dossier,
            'visite',
            "Date de visite annulée — {$dossier->reference}",
            "La date de visite du {$ancienneDate} a été annulée par l'expert {$expertNom}.{$motifTxt}"
        );

        // Notifier l'établissement
        $etablissement = Etablissement::find($dossier->etablissement_id);
        if ($etablissement?->user_id) {
            NotificationAneaq::envoyer(
                $etablissement->user_id,
                'visite',
                "Date de visite annulée — {$dossier->reference}",
                "La date de visite du {$ancienneDate} a été annulée par l'expert {$expertNom}.{$motifTxt}",
                'Dossier',
                $dossier->id
            );
        }

        // Notifier les autres experts
        DossierExpert::where('dossier_id', $dossier->id)
            ->where('expert_id', '!=', $expert->id)
            ->whereNotNull('expert_id')
            ->with('expert')
            ->get()
            ->each(function ($de) use ($dossier, $ancienneDate, $expertNom, $motifTxt) {
                $uid = $de->expert?->user_id;
                if ($uid) {
                    NotificationAneaq::envoyer(
                        $uid,
                        'visite',
                        "Date de visite annulée — {$dossier->reference}",
                        "La date de visite du {$ancienneDate} a été annulée par l'expert {$expertNom}.{$motifTxt}",
                        'Dossier',
                        $dossier->id
                    );
                }
            });

        ActivityLogger::log('visite_annulee', "Date de visite annulée par expert {$expertNom} — {$dossier->reference}", $dossier);
    }
}
