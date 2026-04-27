<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CritereEvaluation extends Model
{
    protected $table = 'criteres_evaluation';

    protected $fillable = [
        'parent_id',
        'code',
        'libelle',
        'poids',
        'ordre',
    ];

    protected $casts = [
        'poids' => 'decimal:2',
    ];

    // ─── Relations ─────────────────────────────────────────

    /**
     * Axe parent (null si c'est un axe racine)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(CritereEvaluation::class, 'parent_id');
    }

    /**
     * Critères enfants (si c'est un axe)
     */
    public function enfants(): HasMany
    {
        return $this->hasMany(CritereEvaluation::class, 'parent_id')
                    ->orderBy('ordre');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(EvaluationQuantitative::class, 'critere_id');
    }

    public function recommandations(): HasMany
    {
        return $this->hasMany(MatriceRecommandation::class, 'critere_id');
    }

    // ─── Scopes ────────────────────────────────────────────

    /**
     * Seulement les axes racines (sans parent)
     */
    public function scopeAxes($query)
    {
        return $query->whereNull('parent_id')->orderBy('ordre');
    }

    /**
     * Seulement les critères feuilles (avec parent)
     */
    public function scopeCriteres($query)
    {
        return $query->whereNotNull('parent_id')->orderBy('ordre');
    }
}