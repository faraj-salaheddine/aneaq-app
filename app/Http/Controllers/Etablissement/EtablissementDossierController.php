<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\CriterePreuve;
use App\Models\Dossier;
use App\Models\DossierDocument;
use App\Models\NotificationAneaq;
use App\Services\DossierDocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EtablissementDossierController extends Controller
{
    use ResolvesActiveEtablissement;

    public function show(): Response|RedirectResponse
    {
        $etablissement = $this->activeEtablissement();
        $dossier = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();

        if (!$dossier) {
            return redirect()->route('etablissement.sans-dossier');
        }

        $documents = $this->allDocuments($dossier);
        $rapportStatus = $this->rapportStatus($dossier);

        return Inertia::render('Etablissement/Dossier/Show', [
            'etablissement' => [
                'id'         => $etablissement->id,
                'nom'        => $etablissement->etablissement
                    ?? $etablissement->etablissement_2
                    ?? $etablissement->nom
                    ?? 'Etablissement',
                'acronyme'   => $etablissement->acronyme,
                'ville'      => $etablissement->ville,
                'universite' => $etablissement->universite,
                'email'      => $etablissement->email,
            ],
            'dossier' => [
                'id'          => $dossier->id,
                'reference'   => $dossier->reference,
                'statut'      => $dossier->statut,
                'campagne'    => $dossier->campagne ?? $dossier->vague ?? null,
                'date_visite' => $dossier->date_visite?->format('d/m/Y H:i'),
                'observation' => $dossier->observation,
                'created_at'  => $dossier->created_at?->format('d/m/Y'),
                'updated_at'  => $dossier->updated_at?->format('d/m/Y'),
            ],
            'timeline'           => $this->buildTimeline($dossier, $etablissement->id),
            'visiteConfirmation' => [
                'statut'      => $dossier->visite_statut_etab,
                'message'     => $dossier->visite_message_etab,
                'date_visite' => $dossier->date_visite?->format('d/m/Y H:i'),
            ],
            'documentsStats'  => [
                'total'                  => count($documents),
                'rapport_autoevaluation' => DossierDocumentService::hasRapportAutoevaluation($dossier),
                'rapport_status'         => $rapportStatus,
            ],
            'documentsRecents'    => array_slice($documents, 0, 4),
            'allDocuments'        => $documents,
            'notifications'       => $this->dossierNotifications($dossier),
        ]);
    }

    /* ── Documents ── */

    private function allDocuments(Dossier $dossier): array
    {
        if (!Schema::hasTable('dossier_documents')) {
            return [];
        }

        return DossierDocument::where('dossier_id', $dossier->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (DossierDocument $d) => [
                'id'     => $d->id,
                'nom'    => $d->original_name ?: 'Document',
                'type'   => $d->type_document ?: 'document',
                'status' => $d->status ?: 'depose',
                'date'   => $d->created_at?->format('d/m/Y H:i'),
                'size'   => $d->file_size ? round($d->file_size / 1024, 1) . ' KB' : null,
            ])
            ->values()
            ->all();
    }

    private function rapportStatus(Dossier $dossier): string
    {
        if (!Schema::hasTable('dossier_documents')) return 'aucun';

        $rapport = DossierDocument::where('dossier_id', $dossier->id)
            ->where('type_document', 'rapport_autoevaluation')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$rapport) return 'aucun';
        return $rapport->status ?: 'depose';
    }

    /* ── Notifications ── */

    private function dossierNotifications(Dossier $dossier): array
    {
        if (!Schema::hasTable('notifications_aneaq')) return [];

        return NotificationAneaq::where('entite_id', $dossier->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'titre'      => $n->titre,
                'message'    => $n->message,
                'lu'         => (bool) $n->lu,
                'created_at' => $n->created_at?->format('d/m/Y H:i'),
            ])
            ->values()
            ->all();
    }

    /* ── Timeline ── */

    private function buildTimeline(Dossier $dossier, int $etablissementId): array
    {
        $steps = [
            [
                'statut' => 'en_attente_formulaire',
                'label'  => 'Sélectionné',
                'href'   => null,
                'cta'    => null,
                'desc'   => 'Votre établissement a été sélectionné pour cette campagne.',
            ],
            [
                'statut' => 'formulaire_complete',
                'label'  => 'Profil complété',
                'href'   => '/etablissement/profil',
                'cta'    => 'Compléter mon profil',
                'desc'   => 'Renseignez les informations de votre établissement.',
            ],
            [
                'statut' => 'annexes_remplies',
                'label'  => 'Remplir les annexes',
                'href'   => '/etablissement/annexes',
                'cta'    => 'Accéder aux annexes',
                'desc'   => 'Déposez les preuves et pièces annexes pour chaque critère.',
            ],
            [
                'statut' => 'visite_planifiee',
                'label'  => 'Visite planifiée',
                'href'   => null,
                'cta'    => null,
                'desc'   => 'La date de visite sera fixée par la DEE.',
            ],
            [
                'statut' => 'valide',
                'label'  => 'Validé',
                'href'   => '/etablissement/rapport-aneaq',
                'cta'    => 'Consulter le rapport ANEAQ',
                'desc'   => 'Votre dossier a été validé par la DEE.',
            ],
        ];

        $mapping = [
            'etablissement selectionne' => 0,
            'selectionne'               => 0,
            'en attente formulaire'     => 0,
            'acces envoye'              => 0,
            'acces_envoye'              => 0,
            'profil complete'           => 1,
            'formulaire complete'       => 1,
            'formulaire complet'        => 1,
            'formulaire soumis'         => 1,
            'rapport depose'            => 2,
            'rapport en attente'        => 2,
            'rapport_en_attente'        => 2,
            'en cours evaluation'       => 2,
            'date de visite planifiee'  => 3,
            'visite planifiee'          => 3,
            'date visite planifiee'     => 3,
            'date_visite_planifiee'     => 3,
            'visite_planifiee'          => 3,
            'valide'                    => 4,
            'rejete'                    => 4,
            'valide definitif'          => 4,
            'valide_definitif'          => 4,
            'cloture'                   => 4,
        ];

        $rawStatus = trim(Str::lower(Str::ascii($dossier->statut ?? '')));

        // Step 0: Sélectionné — always done once dossier exists
        $done0 = true;

        // Step 1: Profil complété — statut has progressed beyond initial selection
        $profilStatuts = [
            'formulaire_complete', 'formulaire complet', 'formulaire soumis',
            'rapport depose', 'rapport_depose', 'rapport en attente', 'rapport_en_attente',
            'en cours evaluation', 'date de visite planifiee', 'visite planifiee',
            'visite_planifiee', 'visite_confirmee', 'valide', 'valide_definitif', 'cloture', 'rejete',
        ];
        $done1 = in_array($rawStatus, $profilStatuts);

        // Step 2: Remplir les annexes — ONLY if CriterePreuve records exist (independent check)
        $done2 = false;
        if (Schema::hasTable('critere_preuves')) {
            $done2 = CriterePreuve::where('etablissement_id', $etablissementId)->exists();
        }

        // Step 3: Visite planifiée — date_visite is set
        $done3 = !empty($dossier->date_visite);

        // Step 4: Validé — dossier statut is final
        $done4 = in_array($rawStatus, ['valide', 'valide_definitif', 'cloture']);

        $doneFlags = [$done0, $done1, $done2, $done3, $done4];

        // Current = first incomplete step (or last if all done)
        $currentIdx = count($steps) - 1;
        foreach ($doneFlags as $i => $done) {
            if (!$done) {
                $currentIdx = $i;
                break;
            }
        }

        return array_map(fn (array $step, int $i) => [
            ...$step,
            'done'    => $doneFlags[$i],
            'current' => $i === $currentIdx,
        ], $steps, array_keys($steps));
    }
}
