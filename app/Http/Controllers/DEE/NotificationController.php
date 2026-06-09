<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\NotificationAneaq;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = NotificationAneaq::where('user_id', Auth::id())
            ->latest()
            ->paginate(30)
            ->through(fn (NotificationAneaq $notification) => [
                'id'          => $notification->id,
                'type'        => $notification->type,
                'titre'       => $notification->titre,
                'message'     => $notification->message,
                'lu'          => $notification->lu,
                'created_at'  => $notification->created_at?->format('d/m/Y H:i'),
                'dossier_url' => strtolower((string) $notification->entite_type) === 'dossier' && $notification->entite_id
                    ? route('dee.dossiers.show', $notification->entite_id)
                    : null,
            ]);

        $nonLues = NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)
            ->count();

        return Inertia::render('DEE/Notifications/Index', [
            'notifications' => $notifications,
            'nonLues'       => $nonLues,
        ]);
    }

    public function marquerLu(NotificationAneaq $notification): RedirectResponse
    {
        abort_if($notification->user_id !== Auth::id(), 403);

        $notification->marquerLu();

        return back();
    }

    public function toutMarquerLu(): RedirectResponse
    {
        NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)
            ->update([
                'lu'    => true,
                'lu_le' => now(),
            ]);

        return back()->with('success', 'Toutes les notifications sont marquées comme lues.');
    }

    public function vider(): RedirectResponse
    {
        NotificationAneaq::where('user_id', Auth::id())->delete();

        return back()->with('success', 'Toutes les notifications ont été supprimées.');
    }
}
