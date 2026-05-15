<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditTrailController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')
            ->orderByDesc('created_at');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('description', 'like', "%{$s}%")
                  ->orWhere('performed_by', 'like', "%{$s}%")
                  ->orWhere('model_name', 'like', "%{$s}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->paginate(25)->withQueryString();

        $actions = ActivityLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        $roles = ActivityLog::select('role')
            ->whereNotNull('role')
            ->distinct()
            ->pluck('role');

        return Inertia::render('DEE/AuditTrail', [
            'logs'    => $logs,
            'actions' => $actions,
            'roles'   => $roles,
            'filters' => $request->only(['action', 'role', 'search', 'date_from', 'date_to']),
        ]);
    }
}
