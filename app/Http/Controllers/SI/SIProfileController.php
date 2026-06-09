<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SIProfileController extends Controller
{
    public function edit()
    {
        return Inertia::render('SI/Profile/Edit', [
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:8|confirmed',
        ]);

        $changes = [];
        if ($user->name  !== $request->name)  $changes[] = 'nom modifié';
        if ($user->email !== $request->email) $changes[] = 'email modifié';
        if ($request->filled('password'))      $changes[] = 'mot de passe modifié';

        $user->name  = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        $changesStr = count($changes) ? implode(', ', $changes) : 'aucune modification détectée';
        ActivityLogger::log(
            'profil_si_modifie',
            "Profil SI mis à jour — {$user->name} : {$changesStr}",
            $user
        );

        return redirect()->route('si.profile')->with('success', 'Profil mis à jour avec succès.');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        ActivityLogger::log('compte_supprime', "Compte SI supprimé — {$user->name} ({$user->email})", $user);

        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
