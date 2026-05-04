<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dossier extends Model
{
    protected $fillable = [
        'campagne_evaluation_id',
        'reference',
        'campagne',
        'nom',
        'description',
        'observation',
        'statut',
        'etablissement_id',
        'created_by',
        'date_visite',
    ];

    protected $casts = [
        'date_visite' => 'date',
    ];

    public function campagneEvaluation(): BelongsTo
    {
        return $this->belongsTo(CampagneEvaluation::class, 'campagne_evaluation_id');
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class, 'etablissement_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function expertAssignments(): HasMany
    {
        return $this->hasMany(DossierExpert::class, 'dossier_id');
    }

    public function experts(): BelongsToMany
    {
        return $this->belongsToMany(
            Expert::class,
            'dossier_experts',
            'dossier_id',
            'expert_id'
        )->withTimestamps();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DossierDocument::class, 'dossier_id');
    }
}