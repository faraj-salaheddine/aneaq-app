<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Inertia\Inertia;

class HistoriqueController extends Controller
{
    public function index()
    {
        $logs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($log) => [
                'id'           => $log->id,
                'action'       => $log->action,
                'model_type'   => $log->model_type,
                'model_id'     => $log->model_id,
                'model_name'   => $log->model_name,
                'performed_by' => $log->performed_by,
                'role'         => $log->role,
                'details'      => $log->details,
                'created_at'   => $log->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('SI/Historique', [
            'logs' => $logs,
        ]);
    }
}