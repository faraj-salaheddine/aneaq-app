<?php

namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GestionUsersController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%");
            }))
            ->when($request->role, fn ($q, $r) => $q->where('role', $r))
            ->orderBy('name');

        $users = $query->paginate(20)->withQueryString();

        return Inertia::render('SI/Users/Index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function toggle(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);

        return back()->with('success', $user->is_active
            ? "Compte de {$user->name} activé."
            : "Compte de {$user->name} désactivé.");
    }

    public function resetPassword(User $user)
    {
        $newPassword = Str::random(12);
        $user->update(['password' => Hash::make($newPassword)]);

        return back()->with('success', "Nouveau mot de passe pour {$user->name} : {$newPassword}");
    }
}
