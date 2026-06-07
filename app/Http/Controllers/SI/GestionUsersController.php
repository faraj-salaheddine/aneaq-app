<?php

namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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

        $action = $user->is_active ? 'compte_active' : 'compte_desactive';
        $label  = $user->is_active ? 'activé' : 'désactivé';
        ActivityLogger::log(
            $action,
            "Compte de {$user->name} ({$user->email}) {$label}",
            $user
        );

        return back()->with('success', $user->is_active
            ? "Compte de {$user->name} activé."
            : "Compte de {$user->name} désactivé.");
    }

    public function resetPassword(User $user)
    {
        $newPassword = Str::random(12);
        $user->update(['password' => Hash::make($newPassword)]);

        ActivityLogger::log(
            'mot_de_passe_reinitialise',
            "Mot de passe réinitialisé pour {$user->name} ({$user->email})",
            $user
        );

        return back()->with('success', "Nouveau mot de passe pour {$user->name} : {$newPassword}");
    }

    public function sendPasswordEmail(Request $request, User $user)
    {
        $request->validate(['password' => 'required|string']);

        $password = $request->password;

        Mail::send([], [], function ($message) use ($user, $password) {
            $message->to($user->email, $user->name)
                ->subject('Votre nouveau mot de passe — ANEAQ')
                ->html(
                    '<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">'
                    . '<h2 style="color:#0C447C;margin-bottom:8px">Réinitialisation de votre mot de passe</h2>'
                    . '<p style="color:#475569;font-size:15px">Bonjour <strong>' . htmlspecialchars($user->name) . '</strong>,</p>'
                    . '<p style="color:#475569;font-size:15px">Votre mot de passe a été réinitialisé par l\'administrateur ANEAQ. Voici votre nouveau mot de passe :</p>'
                    . '<div style="background:#fff;border:2px solid #0C447C22;border-radius:10px;padding:20px;text-align:center;margin:24px 0">'
                    . '<span style="font-family:monospace;font-size:24px;font-weight:700;letter-spacing:3px;color:#0C447C">' . htmlspecialchars($password) . '</span>'
                    . '</div>'
                    . '<p style="color:#94a3b8;font-size:13px">Nous vous recommandons de changer ce mot de passe dès votre prochaine connexion.</p>'
                    . '<p style="color:#94a3b8;font-size:13px;margin-top:24px">Plateforme ANEAQ — Système d\'Évaluation</p>'
                    . '</div>'
                );
        });

        ActivityLogger::log(
            'mot_de_passe_envoye_email',
            "Nouveau mot de passe envoyé par email à {$user->name} ({$user->email})",
            $user
        );

        return back()->with('success', "Mot de passe envoyé à {$user->email}");
    }
}
