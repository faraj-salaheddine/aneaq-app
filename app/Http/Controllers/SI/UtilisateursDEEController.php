<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UtilisateursDEEController extends Controller
{
    public function index()
    {
        return Inertia::render('SI/UtilisateursDEE', [
            'dee' => User::whereIn('role', ['dee', 'chef_dee'])->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8',
            'role'     => 'required|in:dee,chef_dee',
        ]);

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'role'     => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('si.utilisateurs-dee.index');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role'  => 'required|in:dee,chef_dee',
        ]);

        $user->update([
            'name'  => $request->name,
            'email' => $request->email,
            'role'  => $request->role,
            ...($request->filled('password') ? ['password' => Hash::make($request->password)] : []),
        ]);

        return redirect()->route('si.utilisateurs-dee.index');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('si.utilisateurs-dee.index');
    }
}