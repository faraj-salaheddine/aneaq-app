<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\DossierPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DossierPhotoController extends Controller
{
    public function store(Request $request, Dossier $dossier)
    {
        $request->validate([
            'photo' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:10240'],
        ]);

        $file = $request->file('photo');

        $path = $file->store('dossiers/' . $dossier->id . '/photos', 'public');

        DossierPhoto::create([
            'dossier_id'    => $dossier->id,
            'file_path'     => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type'     => $file->getClientMimeType(),
            'size'          => $file->getSize(),
            'uploaded_by'   => Auth::id(),
        ]);

        return back()->with('success', 'Photo ajoutée avec succès.');
    }

    public function destroy(Request $request, Dossier $dossier, DossierPhoto $photo)
    {
        $request->validate([
            'delete_password' => ['required', 'string'],
        ], [
            'delete_password.required' => 'Le mot de passe de suppression est obligatoire.',
        ]);

        $expectedPassword = config('app.dee_delete_password', env('DEE_DELETE_PASSWORD'));

        if (!$expectedPassword || !hash_equals((string) $expectedPassword, (string) $request->input('delete_password'))) {
            return back()->withErrors([
                'delete_password' => 'Mot de passe incorrect.',
            ]);
        }

        if ($photo->dossier_id !== $dossier->id) {
            return back()->with('error', 'Photo introuvable.');
        }

        if (Storage::disk('public')->exists($photo->file_path)) {
            Storage::disk('public')->delete($photo->file_path);
        }

        $photo->delete();

        return back()->with('success', 'Photo supprimée avec succès.');
    }
}
