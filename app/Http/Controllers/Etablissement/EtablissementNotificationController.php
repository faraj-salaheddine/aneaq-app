<?php
namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Etablissement;
use App\Models\NotificationAneaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EtablissementNotificationController extends Controller
{
    use ResolvesActiveEtablissement;
    public function index()
    {
        $etablissement = $this->activeEtablissement();

        $notifications = NotificationAneaq::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($n) => [
                'id'         => $n->id,
                'message'    => $n->message,
                'type'       => $n->type ?? 'info',
                'lu'         => $n->lu,
                'created_at' => $n->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Etablissement/Notifications/Index', [
            'etablissement' => $etablissement,
            'notifications' => $notifications,
            'nonLues'       => $notifications->where('lu', false)->count(),
        ]);
    }

    public function marquerLu(NotificationAneaq $notification)
    {
        abort_if($notification->user_id !== Auth::id(), 403);
        $notification->update(['lu' => true]);
        return back();
    }

    public function toutMarquerLu()
    {
        NotificationAneaq::where('user_id', Auth::id())->update(['lu' => true]);
        return back()->with('success', 'Toutes les notifications marquées comme lues.');
    }
}