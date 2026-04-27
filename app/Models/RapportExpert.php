<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RapportExpert extends Model
{
    protected $table = 'rapports_experts';

    protected $fillable = [
        'dossier_id',
        'expert_id',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'statut',
        'motif_rejet',
        'valide_le',
        'valide_par',
    ];

    protected $casts = [
        'valide_le' => 'datetime',
        'file_size' => 'integer',
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

    public function validePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    // ─── Accesseur taille formatée ─────────────────────────

    public function getTailleFormatteeAttribute(): string
    {
        $kb = $this->file_size / 1024;
        if ($kb < 1024) {
            return round($kb, 1) . ' Ko';
        }
        return round($kb / 1024, 1) . ' Mo';
    }

    // ─── Scopes ────────────────────────────────────────────

    public function scopeValide($query)
    {
        return $query->where('statut', 'valide');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'depose');
    }
}