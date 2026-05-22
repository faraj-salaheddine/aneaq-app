<?php
namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Dossier;
use App\Models\Etablissement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class EtablissementHistoriqueController extends Controller
{
    public function index()
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
        $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();
        $dossierIds    = Dossier::where('etablissement_id', $etablissement->id)->pluck('id');

        $events = collect();

        // ── 1. ActivityLog entries ────────────────────────────────────────────
        $logs = ActivityLog::where(function ($q) use ($dossierIds, $etablissement) {
            $q->where('user_id', Auth::id());
            if ($dossierIds->isNotEmpty()) {
                $q->orWhere(function ($q2) use ($dossierIds) {
                    $q2->whereIn('model_type', ['App\Models\Dossier', 'Dossier'])
                       ->whereIn('model_id', $dossierIds);
                });
            }
            $q->orWhere(function ($q3) use ($etablissement) {
                $q3->whereIn('model_type', ['App\Models\Etablissement', 'Etablissement'])
                   ->where('model_id', $etablissement->id);
            });
        })->get();

        foreach ($logs as $log) {
            $events->push([
                'id'           => 'log_' . $log->id,
                'action'       => $log->action,
                'label'        => $log->description ?? $log->action,
                'performed_by' => $log->performed_by ?? 'Système',
                'role'         => $log->role,
                'details'      => $log->details ?? $log->description,
                'source'       => 'activity_log',
                'created_at'   => $log->created_at,
            ]);
        }

        if ($dossier) {
            // ── 2. Dossier creation ───────────────────────────────────────────
            $events->push([
                'id'           => 'dossier_created_' . $dossier->id,
                'action'       => 'dossier_cree',
                'label'        => "Dossier {$dossier->reference} créé",
                'performed_by' => 'DEE',
                'role'         => 'dee',
                'details'      => "Référence : {$dossier->reference}",
                'source'       => 'dossier',
                'created_at'   => $dossier->created_at,
            ]);

            // ── 3. Documents déposés ──────────────────────────────────────────
            if (Schema::hasTable('dossier_documents')) {
                $docs = DB::table('dossier_documents')
                    ->whereIn('dossier_id', $dossierIds)
                    ->orderByDesc('created_at')
                    ->get();

                $uploaderCache = [];
                foreach ($docs as $doc) {
                    $uploaderName = $this->resolveUploaderName($doc, $uploaderCache);
                    $type = $doc->type_document ?? $doc->uploaded_by_role ?? 'document';
                    $nom  = $doc->original_name ?? basename($doc->file_path ?? 'document');
                    $action = str_contains(strtolower($type), 'dee') ? 'lettre_dee_deposee' : 'document_depose';

                    $events->push([
                        'id'           => 'doc_' . $doc->id,
                        'action'       => $action,
                        'label'        => "Document déposé : {$nom}",
                        'performed_by' => $uploaderName,
                        'role'         => $doc->uploaded_by_role ?? 'dee',
                        'details'      => "Type : " . ucfirst(str_replace('_', ' ', $type)) . " · Fichier : {$nom}",
                        'source'       => 'document',
                        'created_at'   => $doc->created_at,
                    ]);
                }
            }

            // ── 4. Rapports experts ───────────────────────────────────────────
            if (Schema::hasTable('rapports_experts')) {
                $rapports = DB::table('rapports_experts')
                    ->whereIn('dossier_id', $dossierIds)
                    ->get();

                foreach ($rapports as $r) {
                    $expert = DB::table('experts')->where('id', $r->expert_id)->first();
                    $expertName = $expert ? trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) : 'Expert';
                    $nom = $r->original_name ?? $r->titre ?? 'Rapport expert';

                    // Deposit event
                    $events->push([
                        'id'           => 'rapport_depose_' . $r->id,
                        'action'       => 'rapport_expert_depose',
                        'label'        => "Rapport expert déposé par {$expertName}",
                        'performed_by' => $expertName,
                        'role'         => 'expert',
                        'details'      => "Fichier : {$nom}",
                        'source'       => 'rapport_expert',
                        'created_at'   => $r->created_at,
                    ]);

                    // Validation/rejection event
                    if (in_array($r->statut, ['valide', 'rejete']) && $r->valide_le) {
                        $isValide = $r->statut === 'valide';
                        $valideur = $r->valide_par
                            ? (DB::table('users')->where('id', $r->valide_par)->value('name') ?? 'DEE')
                            : 'DEE';
                        $events->push([
                            'id'           => 'rapport_validated_' . $r->id,
                            'action'       => $isValide ? 'rapport_expert_valide' : 'rapport_expert_rejete',
                            'label'        => $isValide
                                ? "Rapport expert accepté par la DEE"
                                : "Rapport expert refusé par la DEE",
                            'performed_by' => $valideur,
                            'role'         => 'dee',
                            'details'      => $isValide
                                ? "Le rapport de {$expertName} a été validé."
                                : "Le rapport de {$expertName} a été refusé. Motif : " . ($r->motif_rejet ?? '—'),
                            'source'       => 'rapport_expert',
                            'created_at'   => $r->valide_le,
                        ]);
                    }
                }
            }

            // ── 5. Expert assignments ─────────────────────────────────────────
            if (Schema::hasTable('dossier_experts')) {
                $assignments = DB::table('dossier_experts')
                    ->whereIn('dossier_id', $dossierIds)
                    ->get();

                foreach ($assignments as $de) {
                    $expert = DB::table('experts')->where('id', $de->expert_id)->first();
                    $expertName = $expert ? trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) : 'Expert';
                    $role = $de->role_expert === 'chef_comite' ? 'Chef de comité' : 'Expert';

                    $events->push([
                        'id'           => 'expert_assigned_' . $de->id,
                        'action'       => 'expert_affecte',
                        'label'        => "Expert affecté : {$expertName}",
                        'performed_by' => 'DEE',
                        'role'         => 'dee',
                        'details'      => "Rôle : {$role} · Statut : " . $this->labelStatus($de->status ?? ''),
                        'source'       => 'expert',
                        'created_at'   => $de->created_at,
                    ]);

                    if (!empty($de->dee_confirmed_at)) {
                        $events->push([
                            'id'           => 'expert_confirmed_dee_' . $de->id,
                            'action'       => 'expert_confirme_dee',
                            'label'        => "Accès envoyé à l'expert : {$expertName}",
                            'performed_by' => 'DEE',
                            'role'         => 'dee',
                            'details'      => "Email d'invitation envoyé à " . ($expert->email ?? '—'),
                            'source'       => 'expert',
                            'created_at'   => $de->dee_confirmed_at,
                        ]);
                    }

                    if (!empty($de->expert_confirmed_at)) {
                        $events->push([
                            'id'           => 'expert_accepted_' . $de->id,
                            'action'       => 'expert_accepte',
                            'label'        => "Mission acceptée par l'expert : {$expertName}",
                            'performed_by' => $expertName,
                            'role'         => 'expert',
                            'details'      => "{$expertName} a confirmé sa participation.",
                            'source'       => 'expert',
                            'created_at'   => $de->expert_confirmed_at,
                        ]);
                    }
                }
            }

            // ── 6. Visit date set ─────────────────────────────────────────────
            if ($dossier->date_visite) {
                $events->push([
                    'id'           => 'visite_' . $dossier->id,
                    'action'       => 'visite_planifiee',
                    'label'        => "Date de visite planifiée",
                    'performed_by' => 'DEE',
                    'role'         => 'dee',
                    'details'      => "Date de visite : " . \Carbon\Carbon::parse($dossier->date_visite)->format('d/m/Y'),
                    'source'       => 'dossier',
                    'created_at'   => $dossier->updated_at,
                ]);
            }

            // ── 7. Notifications received by établissement ────────────────────
            if (Schema::hasTable('notifications_aneaq')) {
                $notifs = DB::table('notifications_aneaq')
                    ->where('user_id', Auth::id())
                    ->orderByDesc('created_at')
                    ->get();

                foreach ($notifs as $n) {
                    // Skip if we already have a matching activity_log entry (avoid duplicates)
                    $alreadyCovered = $events->contains(fn($e) =>
                        abs(strtotime($e['created_at']) - strtotime($n->created_at)) < 5
                        && str_contains(strtolower($e['label'] ?? ''), strtolower(substr($n->titre ?? '', 0, 20)))
                    );
                    if ($alreadyCovered) continue;

                    $events->push([
                        'id'           => 'notif_' . $n->id,
                        'action'       => $n->type ?? 'notification',
                        'label'        => $n->titre ?? 'Notification',
                        'performed_by' => 'Système',
                        'role'         => 'system',
                        'details'      => $n->message,
                        'source'       => 'notification',
                        'created_at'   => $n->created_at,
                    ]);
                }
            }

            // ── 8. Messages ───────────────────────────────────────────────────
            if (Schema::hasTable('messages_dossier')) {
                $messages = DB::table('messages_dossier')
                    ->whereIn('dossier_id', $dossierIds)
                    ->orderByDesc('created_at')
                    ->get();

                foreach ($messages as $msg) {
                    $sender = DB::table('users')->where('id', $msg->user_id)->first();
                    $senderName = $sender?->name ?? 'Système';
                    $events->push([
                        'id'           => 'msg_' . $msg->id,
                        'action'       => 'message_envoye',
                        'label'        => "Message " . ($msg->role === 'admin_dee' ? 'de la DEE' : ($msg->role === 'expert' ? "de l'expert" : "de l'établissement")),
                        'performed_by' => $senderName,
                        'role'         => $msg->role ?? 'etablissement',
                        'details'      => mb_substr($msg->contenu ?? '', 0, 120) . (mb_strlen($msg->contenu ?? '') > 120 ? '…' : ''),
                        'source'       => 'message',
                        'created_at'   => $msg->created_at,
                    ]);
                }
            }
        }

        // Sort all events newest first, format dates
        $sorted = $events
            ->sortByDesc('created_at')
            ->values()
            ->map(fn($e) => array_merge($e, [
                'created_at' => \Carbon\Carbon::parse($e['created_at'])->format('d/m/Y H:i'),
            ]));

        return Inertia::render('Etablissement/Historique/Index', [
            'etablissement' => $etablissement,
            'logs'          => $sorted,
        ]);
    }

    private function resolveUploaderName($doc, array &$cache): string
    {
        if (!empty($doc->uploaded_by)) {
            if (!isset($cache[$doc->uploaded_by])) {
                $cache[$doc->uploaded_by] = DB::table('users')->where('id', $doc->uploaded_by)->value('name') ?? 'Utilisateur';
            }
            return $cache[$doc->uploaded_by];
        }

        return match (strtolower((string)($doc->uploaded_by_role ?? ''))) {
            'dee'           => 'Administrateur DEE',
            'expert'        => 'Expert',
            'etablissement' => 'Établissement',
            default         => 'Système',
        };
    }

    private function labelStatus(string $status): string
    {
        return match ($status) {
            'en_attente_confirmation_dee'    => 'En attente DEE',
            'en_attente_confirmation_expert' => 'Invitation envoyée',
            'acces_envoye'                   => 'Accès envoyé',
            'accepte_par_expert'             => 'Accepté par expert',
            'confirme_par_expert'            => 'Confirmé',
            'refuse_par_expert'              => 'Refusé par expert',
            default                          => $status,
        };
    }
}
