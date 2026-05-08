<?php
namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Etablissement;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EtablissementHistoriqueController extends Controller
{
    public function index()
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();

        $logs = ActivityLog::where('user_id', Auth::id())
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