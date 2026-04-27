<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\NotificationAneaq;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationExpertController extends Controller
{
    public function index(): Response
    {
        $notifications = NotificationAneaq::where('user_id', Auth::id())
            ->latest()
            ->paginate(20);

        $nonLues = NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)
            ->count();

        return Inertia::render('Expert/Notifications/Index', [
            'notifications' => $notifications,
            'nonLues'       => $nonLues,
        ]);
    }

    public function marquerLu(NotificationAneaq $notification)
    {
        abort_if($notification->user_id !== Auth::id(), 403);

        $notification->update([
            'lu'    => true,
            'lu_le' => now(),
        ]);

        return back();
    }

    public function toutMarquerLu()
    {
        NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)
            ->update([
                'lu'    => true,
                'lu_le' => now(),
            ]);

        return back()->with('success', 'Toutes les notifications sont marquées comme lues.');
    }
}