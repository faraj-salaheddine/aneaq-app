<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Critere extends Model
{
    protected $fillable = [
        'domaine',
        'domaine_label',
        'champ',
        'champ_label',
        'reference',
        'reference_label',
        'critere_num',
        'critere_label',
        'preuves',
    ];

    protected $casts = [
        // Décode automatiquement le JSON en tableau PHP
        'preuves' => 'array',
    ];

    // Un critère a plusieurs réponses de preuves (une par établissement)
    public function criterePreuves()
    {
        return $this->hasMany(CriterePreuve::class);
    }

    // Réponses d'un établissement spécifique pour ce critère
    public function preuvesEtablissement($etablissementId)
    {
        return $this->criterePreuves()
                    ->where('etablissement_id', $etablissementId)
                    ->get()
                    ->keyBy('preuve_index');
    }
}