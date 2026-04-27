<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dossier extends Model
{
    protected $fillable = [
        'etablissement_id',
        'vague',
        'statut',
        'date_visite',
        'observations',
        'created_by',
    ];

    protected $casts = [
        'date_visite' => 'date',
    ];

    // ─── Relations ─────────────────────────────────────────

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function experts(): BelongsToMany
    {
        return $this->belongsToMany(Expert::class, 'expert_dossier')
                    ->withPivot([
                        'statut_participation',
                        'date_invitation',
                        'date_reponse',
                        'motif_refus',
                        'role_comite',
                        'affecte_par',
                    ])
                    ->withTimestamps();
    }

    public function expertsConfirmes(): BelongsToMany
    {
        return $this->experts()
                    ->wherePivot('statut_participation', 'confirme');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(EvaluationQuantitative::class);
    }

    public function rapportsExperts(): HasMany
    {
        return $this->hasMany(RapportExpert::class);
    }

    public function recommandations(): HasMany
    {
        return $this->hasMany(MatriceRecommandation::class);
    }
}