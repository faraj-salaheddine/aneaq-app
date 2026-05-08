<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CriterePreuve extends Model
{
    protected $fillable = [
        'critere_id',
        'etablissement_id',
        'preuve_index',
        'existe',
        'fichier_path',
        'fichier_nom',
        'commentaire',
    ];

    protected $casts = [
        'existe' => 'boolean',
        'preuve_index' => 'integer',
    ];

    // Appartient à un critère
    public function critere()
    {
        return $this->belongsTo(Critere::class);
    }

    // Appartient à un établissement
    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }
}