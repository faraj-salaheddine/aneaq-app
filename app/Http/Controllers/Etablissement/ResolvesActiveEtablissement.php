<?php

namespace App\Http\Controllers\Etablissement;

use App\Models\Dossier;
use App\Models\Etablissement;
use Illuminate\Support\Facades\Auth;

trait ResolvesActiveEtablissement
{
    /**
     * Return the etablissement with the most recent dossier for the logged-in user.
     * Falls back to the latest etablissement (by id) if none has a dossier.
     * Aborts 404 if the user has no linked etablissement at all.
     */
    protected function activeEtablissement(): Etablissement
    {
        $all = Etablissement::where('user_id', Auth::id())->orderByDesc('id')->get();

        abort_if($all->isEmpty(), 404);

        $best    = null;
        $bestDos = null;

        foreach ($all as $etab) {
            $dos = Dossier::where('etablissement_id', $etab->id)->latest()->first();
            if ($dos && (!$bestDos || $dos->created_at > $bestDos->created_at)) {
                $best    = $etab;
                $bestDos = $dos;
            }
        }

        return $best ?? $all->first();
    }
}
