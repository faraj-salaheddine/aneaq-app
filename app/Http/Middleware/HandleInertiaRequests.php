<?php

namespace App\Http\Middleware;

use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\NotificationAneaq;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ] : null,
            ],

            'locale' => session('locale', 'fr'),

            'etablissement_dossier_id' => function () use ($user) {
                if ($user?->role !== 'etablissement') return null;
                $etablissement = Etablissement::where('user_id', $user->id)->first();
                if (!$etablissement) return null;
                return Dossier::where('etablissement_id', $etablissement->id)->latest()->value('id');
            },

            'notifs_non_lues' => function () use ($user) {
                if ($user?->role !== 'etablissement') return 0;
                return NotificationAneaq::where('user_id', $user->id)->where('lu', false)->count();
            },

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
        ]);
    }
}