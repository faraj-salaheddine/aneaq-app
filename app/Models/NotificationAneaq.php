<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationAneaq extends Model
{
    protected $table = 'notifications_aneaq';

    protected $fillable = [
        'user_id',
        'type',
        'titre',
        'message',
        'entite_type',
        'entite_id',
        'lu',
        'lu_le',
    ];

    protected $casts = [
        'lu'    => 'boolean',
        'lu_le' => 'datetime',
    ];

    // ─── Relations ─────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Scopes ────────────────────────────────────────────

    public function scopeNonLues($query)
    {
        return $query->where('lu', false);
    }

    public function scopePourUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ─── Méthodes ──────────────────────────────────────────

    public function marquerLu(): void
    {
        if (!$this->lu) {
            $this->update(['lu' => true, 'lu_le' => now()]);
        }
    }

    /**
     * Crée et envoie une notification à un utilisateur.
     */
    public static function envoyer(
        int    $userId,
        string $type,
        string $titre,
        string $message,
        string $entiteType = null,
        int    $entiteId   = null
    ): self {
        return static::create([
            'user_id'     => $userId,
            'type'        => $type,
            'titre'       => $titre,
            'message'     => $message,
            'entite_type' => $entiteType,
            'entite_id'   => $entiteId,
        ]);
    }
}