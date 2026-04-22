<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UtilisateurDEE;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Mail\UtilisateurDEEAccountCreated;
use Illuminate\Support\Facades\Mail;
use App\Mail\UtilisateurDEEAccountUpdated;

class UtilisateursDEEController extends Controller
{
    public function index()
    {
        return Inertia::render('SI/UtilisateursDEE/Index', [
            'dee' => UtilisateurDEE::with('user')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('SI/UtilisateursDEE/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom'       => 'required|string|max:255',
            'prenom'    => 'required|string|max:255',
            'email'     => 'required|email|unique:users',
            'password'  => 'required|min:8',
            'telephone' => 'nullable|string|max:20',
            'role'      => 'required|in:dee,chef_dee',
        ]);

        // 1. Create user account
        $user = User::create([
            'name'     => $request->nom . ' ' . $request->prenom,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        // 2. Create DEE profile
        $utilisateurDEE = UtilisateurDEE::create([
            'user_id'   => $user->id,
            'nom'       => $request->nom,
            'prenom'    => $request->prenom,
            'telephone' => $request->telephone,
            'role'      => $request->role,
        ]);

        // 3. Send welcome email
        Mail::to($user->email)->send(new UtilisateurDEEAccountCreated($utilisateurDEE, $request->password));

        return redirect()->route('si.utilisateurs-dee.index')
            ->with('success', 'Utilisateur DEE créé avec succès.');
    }

    public function edit(UtilisateurDEE $utilisateurDee)
    {
        return Inertia::render('SI/UtilisateursDEE/Edit', [
            'utilisateur' => $utilisateurDee->load('user'),
        ]);
    }

    public function update(Request $request, UtilisateurDEE $utilisateurDee)
{
    $request->validate([
        'nom'       => 'required|string|max:255',
        'prenom'    => 'required|string|max:255',
        'email'     => 'required|email|unique:users,email,' . $utilisateurDee->user_id,
        'telephone' => 'nullable|string|max:20',
        'role'      => 'required|in:dee,chef_dee',
        'password'  => 'nullable|min:8',
    ]);

    // Update DEE profile
    $utilisateurDee->update([
        'nom'       => $request->nom,
        'prenom'    => $request->prenom,
        'telephone' => $request->telephone,
        'role'      => $request->role,
    ]);

    // Update user account
    $utilisateurDee->user->update([
        'name'  => $request->nom . ' ' . $request->prenom,
        'email' => $request->email,
        'role'  => $request->role,
        ...($request->filled('password') ? ['password' => Hash::make($request->password)] : []),
    ]);

    // Send update email
    $password = $request->filled('password') ? $request->password : null;
    Mail::to($utilisateurDee->user->email)->send(new UtilisateurDEEAccountUpdated($utilisateurDee, $password));

    return redirect()->route('si.utilisateurs-dee.index')
        ->with('success', 'Modifications enregistrées avec succès.');
}

    public function destroy(UtilisateurDEE $utilisateurDee)
    {
        $utilisateurDee->user->delete();

        return redirect()->route('si.utilisateurs-dee.index')
            ->with('success', 'Utilisateur supprimé avec succès.');
    }
}