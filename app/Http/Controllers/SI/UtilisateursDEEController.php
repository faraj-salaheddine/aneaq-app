<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UtilisateurDEE;
use App\Services\ActivityLogger;
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
        User::where('role', 'admin_dee')
            ->whereNotIn('id', UtilisateurDEE::pluck('user_id'))
            ->each(function (User $user) {
                $parts = explode(' ', $user->name, 2);
                UtilisateurDEE::create([
                    'user_id'   => $user->id,
                    'nom'       => $parts[0] ?? $user->name,
                    'prenom'    => $parts[1] ?? '',
                    'telephone' => null,
                    'role'      => 'dee',
                ]);
            });

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
        ], [
            'nom.required'      => 'Le nom est obligatoire.',
            'prenom.required'   => 'Le prénom est obligatoire.',
            'email.required'    => "L'adresse email est obligatoire.",
            'email.email'       => "L'adresse email n'est pas valide.",
            'email.unique'      => 'Cette adresse email est déjà utilisée par un autre compte.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min'      => 'Le mot de passe doit contenir au moins 8 caractères.',
            'role.required'     => 'Le rôle est obligatoire.',
            'role.in'           => 'Le rôle sélectionné est invalide.',
        ]);

        $user = User::create([
            'name'     => $request->nom . ' ' . $request->prenom,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'admin_dee',
        ]);

        $utilisateurDEE = UtilisateurDEE::create([
            'user_id'   => $user->id,
            'nom'       => $request->nom,
            'prenom'    => $request->prenom,
            'telephone' => $request->telephone,
            'role'      => $request->role,
        ]);

        Mail::to($user->email)->send(new UtilisateurDEEAccountCreated($utilisateurDEE, $request->password));

        $roleLabel = $request->role === 'chef_dee' ? 'Chef DEE' : 'Administrateur DEE';
        ActivityLogger::log(
            'utilisateur_dee_cree',
            "Compte {$roleLabel} créé pour {$utilisateurDEE->nom} {$utilisateurDEE->prenom} ({$user->email})",
            $utilisateurDEE
        );

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
        ], [
            'nom.required'    => 'Le nom est obligatoire.',
            'prenom.required' => 'Le prénom est obligatoire.',
            'email.required'  => "L'adresse email est obligatoire.",
            'email.email'     => "L'adresse email n'est pas valide.",
            'email.unique'    => 'Cette adresse email est déjà utilisée par un autre compte.',
            'password.min'    => 'Le mot de passe doit contenir au moins 8 caractères.',
            'role.required'   => 'Le rôle est obligatoire.',
            'role.in'         => 'Le rôle sélectionné est invalide.',
        ]);

        $utilisateurDee->update([
            'nom'       => $request->nom,
            'prenom'    => $request->prenom,
            'telephone' => $request->telephone,
            'role'      => $request->role,
        ]);

        $utilisateurDee->user->update([
            'name'  => $request->nom . ' ' . $request->prenom,
            'email' => $request->email,
            'role'  => 'admin_dee',
            ...($request->filled('password') ? ['password' => Hash::make($request->password)] : []),
        ]);

        $password = $request->filled('password') ? $request->password : null;
        Mail::to($utilisateurDee->user->email)->send(new UtilisateurDEEAccountUpdated($utilisateurDee, $password));

        $changes = [];
        if ($request->filled('password')) $changes[] = 'mot de passe';
        $roleLabel = $request->role === 'chef_dee' ? 'Chef DEE' : 'Administrateur DEE';
        $changesStr = count($changes) ? ' (' . implode(', ', $changes) . ' modifié)' : '';

        ActivityLogger::log(
            'utilisateur_dee_modifie',
            "Compte {$roleLabel} modifié — {$utilisateurDee->nom} {$utilisateurDee->prenom}{$changesStr}",
            $utilisateurDee
        );

        return redirect()->route('si.utilisateurs-dee.index')
            ->with('success', 'Modifications enregistrées avec succès.');
    }

    public function destroy(UtilisateurDEE $utilisateurDee)
    {
        $nom    = $utilisateurDee->nom . ' ' . $utilisateurDee->prenom;
        $email  = $utilisateurDee->user->email ?? '—';
        $role   = $utilisateurDee->role === 'chef_dee' ? 'Chef DEE' : 'Administrateur DEE';

        ActivityLogger::log(
            'utilisateur_dee_supprime',
            "Compte {$role} supprimé — {$nom} ({$email})",
            $utilisateurDee
        );

        $utilisateurDee->user->delete();

        return redirect()->route('si.utilisateurs-dee.index')
            ->with('success', 'Utilisateur supprimé avec succès.');
    }
}
