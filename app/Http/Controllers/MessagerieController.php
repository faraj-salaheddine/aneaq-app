<?php

namespace App\Http\Controllers;

use App\Models\Dossier;
use App\Models\MessageDossier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessagerieController extends Controller
{
    public function index(Dossier $dossier)
    {
        $user = Auth::user();
        $role = $user->role;

        // Marquer les messages comme lus selon le rôle
        $champLu = match($role) {
            'admin_dee'    => 'lu_par_dee',
            'expert'       => 'lu_par_expert',
            'etablissement'=> 'lu_par_etablissement',
            default        => null,
        };

        if ($champLu) {
            MessageDossier::where('dossier_id', $dossier->id)
                ->where($champLu, false)
                ->update([$champLu => true]);
        }

        $messages = MessageDossier::where('dossier_id', $dossier->id)
            ->with('user:id,name,role')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'contenu'    => $m->contenu,
                'role'       => $m->role,
                'auteur'     => $m->user?->name ?? 'Inconnu',
                'est_moi'    => $m->user_id === $user->id,
                'created_at' => $m->created_at?->format('d/m/Y H:i'),
            ]);

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, Dossier $dossier)
    {
        $request->validate(['contenu' => 'required|string|max:2000']);

        $user = Auth::user();

        MessageDossier::create([
            'dossier_id' => $dossier->id,
            'user_id'    => $user->id,
            'contenu'    => $request->contenu,
            'role'       => $user->role,
        ]);

        return response()->json(['ok' => true]);
    }

    public function nonLus(Dossier $dossier)
    {
        $user  = Auth::user();
        $champ = match($user->role) {
            'admin_dee'    => 'lu_par_dee',
            'expert'       => 'lu_par_expert',
            'etablissement'=> 'lu_par_etablissement',
            default        => 'lu_par_dee',
        };

        $count = MessageDossier::where('dossier_id', $dossier->id)
            ->where($champ, false)
            ->where('user_id', '!=', $user->id)
            ->count();

        return response()->json(['count' => $count]);
    }
}
