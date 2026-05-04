<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EtablissementOnboarding extends Model
{
    use HasFactory;

    protected $fillable = [
        'etablissement_id',
        'dossier_id',
        'adresse',
        'site_web',
        'telephone',
        'responsable_nom',
        'responsable_fonction',
        'responsable_email',
        'responsable_telephone',
        'statut',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function dossier()
    {
        return $this->belongsTo(Dossier::class);
    }
}
