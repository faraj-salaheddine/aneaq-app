<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\ActivityLog;

class SIProfileController extends Controller
{
    public function edit()
    {
        return Inertia::render('SI/Profile', [
            'user' => Auth::user(),
        ]);
    }

    public function update(Request $request)
{
    $user = \App\Models\User::find(Auth::id());

    $request->validate([
        'name'     => 'required|string|max:255',
        'email'    => 'required|email|unique:users,email,' . $user->id,
        'password' => 'nullable|min:8|confirmed',
    ]);

    $user->name  = $request->name;
    $user->email = $request->email;

    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    $user->save();

    ActivityLog::create([
    'user_id'      => Auth::id(),
    'action'       => 'Compte modifié',
    'model_type'   => 'User',
    'model_id'     => Auth::id(),
    'model_name'   => $user->name,
    'performed_by' => $user->name,
    'role'         => 'si',
    'details'      => 'Modification du profil SI',
]);

    return back()->with('success', 'Profil mis à jour avec succès.');
}
}