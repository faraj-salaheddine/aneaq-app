<?php

namespace App\Http\Middleware;

use App\Models\Dossier;
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
                if ($user?->role !== 'etablissement' || !$user->etablissement_id) return null;
                return Dossier::where('etablissement_id', $user->etablissement_id)->latest()->value('id');
            },

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'status' => fn () => $request->session()->get('status'),
            ],
        ]);
    }
}