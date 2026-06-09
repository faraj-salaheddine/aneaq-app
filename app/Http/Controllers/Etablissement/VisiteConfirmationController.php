<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\MessageDossier;
use App\Models\NotificationAneaq;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\NotifierDee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VisiteConfirmationController extends Controller
{
    use ResolvesActiveEtablissement;

    public function repondre(Request $request)
    {
        $request->validate([
            'statut'  => 'required|in:accepte,refuse',
            'message' => 'nullable|string|max:1000',
        ]);

        $etablissement = $this->activeEtablissement();
        $dossier = Dossier::where('etablissement_id', $etablissement->id)->latest()->firstOrFail();

        if (empty($dossier->date_visite)) {
            return back()->withErrors(['statut' => 'Aucune date de visite planifiée.']);
        }

        $statut  = $request->statut;
        $message = $request->message;

        // Enregistrer la réponse
        $dossier->visite_statut_etab  = $statut;
        $dossier->visite_message_etab = $message;
        $dossier->save();

        // Message dans le dossier si refus
        if ($statut === 'refuse' && $message) {
            MessageDossier::create([
                'dossier_id'            => $dossier->id,
                'user_id'               => Auth::id(),
                'contenu'               => "🚫 L'établissement a refusé la date de visite.\nMotif : " . $message,
                'role'                  => 'etablissement',
                'lu_par_dee'            => false,
                'lu_par_expert'         => false,
                'lu_par_etablissement'  => true,
            ]);
        }

        // Si refus → annuler la date de visite
        if ($statut === 'refuse') {
            $this->annulerDateVisite($dossier, 'établissement', $message);
        } else {
            // Notifier la DEE de l'acceptation individuelle
            NotifierDee::pourDossier(
                $dossier,
                'visite',
                "Visite acceptée — {$dossier->reference}",
                "L'établissement a accepté la date de visite du dossier {$dossier->reference}."
            );

            ActivityLogger::log('visite_acceptee_etab', "Établissement a accepté la date de visite — {$dossier->reference}", $dossier);

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

    private function annulerDateVisite(Dossier $dossier, string $parQui, ?string $motif): void
    {
        $ancienneDate = $dossier->date_visite?->format('d/m/Y');

        // Annuler la date (garder visite_statut_etab/message pour que la DEE voie le motif)
        $dossier->date_visite = null;
        $dossier->statut      = 'rapport_depose';
        $dossier->save();

        // Réinitialiser les confirmations experts (l'établissement a refusé, les experts n'ont plus à répondre)
        DossierExpert::where('dossier_id', $dossier->id)
            ->update(['visite_statut' => null, 'visite_message' => null]);

        $motifTxt = $motif ? " Motif : {$motif}" : '';

        // Notifier la DEE
        NotifierDee::pourDossier(
            $dossier,
            'visite',
            "Date de visite annulée — {$dossier->reference}",
            "La date de visite du {$ancienneDate} a été annulée par {$parQui}.{$motifTxt}"
        );

        // Notifier les experts
        $dossierExperts = DossierExpert::where('dossier_id', $dossier->id)
            ->whereNotNull('expert_id')
            ->with('expert')
            ->get();

        foreach ($dossierExperts as $de) {
            $expertUserId = $de->expert?->user_id;
            if ($expertUserId) {
                NotificationAneaq::envoyer(
                    $expertUserId,
                    'visite',
                    "Date de visite annulée — {$dossier->reference}",
                    "La date de visite du {$ancienneDate} a été annulée par {$parQui}.{$motifTxt}",
                    'Dossier',
                    $dossier->id
                );
            }
        }

        ActivityLogger::log('visite_annulee', "Date de visite annulée par {$parQui} — {$dossier->reference}", $dossier);
    }
}
