<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationQuantitative extends Model
{
    protected $table = 'evaluations_quantitatives';

    protected $fillable = [
        'dossier_id',
        'expert_id',
        'critere_id',
        'note',
        'commentaire',
        'statut',
        'soumis_le',
    ];

    protected $casts = [
        'note'      => 'integer',
        'soumis_le' => 'datetime',
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

    public function scopeBrouillon($query)
    {
        return $query->where('statut', 'brouillon');
    }

    public function scopeSoumis($query)
    {
        return $query->where('statut', 'soumis');
    }

    // ─── Méthode statique ──────────────────────────────────

    public static function soumettrePourDossier(int $dossierId, int $expertId): int
    {
        return static::where('dossier_id', $dossierId)
                     ->where('expert_id', $expertId)
                     ->where('statut', 'brouillon')
                     ->update([
                         'statut'    => 'soumis',
                         'soumis_le' => now(),
                     ]);
    }
}