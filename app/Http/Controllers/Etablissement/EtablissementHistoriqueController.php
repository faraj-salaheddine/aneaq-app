<?php
namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Dossier;
use App\Models\Etablissement;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EtablissementHistoriqueController extends Controller
{
    public function index()
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();

        $dossierIds = Dossier::where('etablissement_id', $etablissement->id)->pluck('id');

        $logs = ActivityLog::where(function ($q) use ($dossierIds, $etablissement) {
            // Etablissement's own actions
            $q->where('user_id', Auth::id());
            // DEE actions on this établissement's dossiers
            if ($dossierIds->isNotEmpty()) {
                $q->orWhere(function ($q2) use ($dossierIds) {
                    $q2->where('model_type', 'App\Models\Dossier')
                       ->whereIn('model_id', $dossierIds);
                });
            }
            // DEE actions logged directly against this établissement (e.g. dossier deleted)
            $q->orWhere(function ($q3) use ($etablissement) {
                $q3->where('model_type', 'App\Models\Etablissement')
                   ->where('model_id', $etablissement->id);
            });
        })
        ->orderByDesc('created_at')
        ->get()
        ->map(fn($log) => [
            'id'           => $log->id,
            'action'       => $log->action,
            'model_type'   => $log->model_type ?? $log->target_type,
            'model_name'   => $log->model_name ?? $log->target_type,
            'performed_by' => $log->performed_by ?? 'Système',
            'role'         => $log->role,
            'details'      => $log->details ?? $log->description,
            'created_at'   => $log->created_at->format('d/m/Y H:i'),
        ]);

        return Inertia::render('Etablissement/Historique/Index', [
            'etablissement' => $etablissement,
            'logs'          => $logs,
        ]);
    }
}