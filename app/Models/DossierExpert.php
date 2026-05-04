<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DossierExpert extends Model
{
    protected $fillable = [
        'dossier_id',
        'expert_id',
        'role_expert',
        'status',
        'invitation_token',
        'access_sent_at',
        'dee_confirmed_at',
        'expert_confirmed_at',
    ];

    protected $casts = [
        'access_sent_at' => 'datetime',
        'dee_confirmed_at' => 'datetime',
        'expert_confirmed_at' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function expert(): BelongsTo
    {
        return $this->belongsTo(Expert::class);
    }
}