<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampagneEvaluation extends Model
{
    protected $fillable = [
        'reference',
        'annee',
        'vocation',
        'observation',
        'statut',
        'status',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function campagneEtablissements()
    {
        return $this->hasMany(CampagneEtablissement::class, 'campagne_evaluation_id');
    }

    public function etablissements()
    {
        return $this->belongsToMany(
            Etablissement::class,
            'campagne_etablissements',
            'campagne_evaluation_id',
            'etablissement_id'
        );
    }

    public function dossiers()
    {
        return $this->hasMany(Dossier::class, 'campagne_evaluation_id');
    }
}