<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ExpertProfilController extends Controller
{
    public function show()
    {
        return $this->edit();
    }

    public function edit()
    {
        $user = Auth::user();
        $expert = $this->findExpertForUser($user);

        return Inertia::render('Expert/Profil/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'expert' => [
                'id' => $expert->id ?? null,
                'nom' => $expert->nom ?? $this->extractNom($user->name),
                'prenom' => $expert->prenom ?? $this->extractPrenom($user->name),
                'email' => $expert->email ?? $user->email,
                'telephone' => $expert->telephone ?? '',
                'grade' => $expert->grade ?? '',
                'specialite' => $expert->specialite ?? '',
                'etablissement' => $expert->etablissement ?? '',
                'ville' => $expert->ville ?? '',
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $expert = $this->findExpertForUser($user);

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['nullable', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'telephone' => ['nullable', 'string', 'max:50'],
            'grade' => ['nullable', 'string', 'max:255'],
            'specialite' => ['nullable', 'string', 'max:255'],
            'etablissement' => ['nullable', 'string', 'max:255'],
            'ville' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ], [
            'nom.required' => 'Le nom est obligatoire.',
            'email.required' => "L'email est obligatoire.",
            'email.email' => "L'email est invalide.",
            'email.unique' => 'Cet email est déjà utilisé.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        DB::transaction(function () use ($validated, $user, $expert) {
            $fullName = trim(($validated['prenom'] ?? '') . ' ' . $validated['nom']);

            $userPayload = [
                'name' => $fullName ?: $validated['nom'],
                'email' => $validated['email'],
            ];

            if (!empty($validated['password'])) {
                $userPayload['password'] = Hash::make($validated['password']);
            }

            User::where('id', $user->id)->update($userPayload);

            if ($expert && Schema::hasTable('experts')) {
                $expertPayload = [];

                $columns = [
                    'nom',
                    'prenom',
                    'email',
                    'telephone',
                    'grade',
                    'specialite',
                    'etablissement',
                    'ville',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('experts', $column)) {
                        $expertPayload[$column] = $validated[$column] ?? null;
                    }
                }

                if (Schema::hasColumn('experts', 'name')) {
                    $expertPayload['name'] = $fullName ?: $validated['nom'];
                }

                if (Schema::hasColumn('experts', 'user_id')) {
                    $expertPayload['user_id'] = $user->id;
                }

                if (!empty($expertPayload)) {
                    DB::table('experts')
                        ->where('id', $expert->id)
                        ->update($expertPayload);
                }
            }
        });

        return redirect('/expert/dashboard')
            ->with('success', 'Profil expert modifié avec succès.');
    }

    private function findExpertForUser($user)
    {
        if (!$user || !Schema::hasTable('experts')) {
            return null;
        }

        $query = DB::table('experts');

        $query->where(function ($subQuery) use ($user) {
            $hasCondition = false;

            if (Schema::hasColumn('experts', 'user_id')) {
                $subQuery->where('user_id', $user->id);
                $hasCondition = true;
            }

            if (Schema::hasColumn('experts', 'email')) {
                if ($hasCondition) {
                    $subQuery->orWhere('email', $user->email);
                } else {
                    $subQuery->where('email', $user->email);
                }
            }
        });

        return $query->first();
    }

    private function extractPrenom(?string $name): string
    {
        if (!$name) {
            return '';
        }

        $parts = preg_split('/\s+/', trim($name));

        return $parts[0] ?? '';
    }

    private function extractNom(?string $name): string
    {
        if (!$name) {
            return '';
        }

        $parts = preg_split('/\s+/', trim($name));

        if (count($parts) <= 1) {
            return $name;
        }

        array_shift($parts);

        return implode(' ', $parts);
    }
}