<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatriceRecommandation extends Model
{
    protected $table = 'matrices_recommandations';

    protected $fillable = [
        'dossier_id',
        'expert_id',
        'critere_id',
        'constat',
        'point_fort',
        'point_faible',
        'recommandation',
        'priorite',
        'statut',
    ];

    // ─── Relations ─────────────────────────────────────────

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function expert(): BelongsTo
    {
        return $this->belongsTo(Expert::class);
    }

    public function critere(): BelongsTo
    {
        return $this->belongsTo(CritereEvaluation::class, 'critere_id');
    }

    // ─── Scopes ────────────────────────────────────────────

    public function scopeSoumis($query)
    {
        return $query->where('statut', 'soumis');
    }

    public function scopePriorite($query, string $priorite)
    {
        return $query->where('priorite', $priorite);
    }
}