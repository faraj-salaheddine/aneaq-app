<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampagneEtablissement extends Model
{
    protected $fillable = [
        'campagne_evaluation_id',
        'etablissement_id',
        'status',
        'statut',
        'email',
        'access_sent_at',
        'dossier_id',
        'dossier_reference',
        'created_by',
    ];

    public function campagne()
    {
        return $this->belongsTo(CampagneEvaluation::class, 'campagne_evaluation_id');
    }

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class, 'etablissement_id');
    }
}