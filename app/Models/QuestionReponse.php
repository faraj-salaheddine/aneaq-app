<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionReponse extends Model
{
    protected $table = 'questions_reponses';

    protected $fillable = [
        'dossier_id',
        'user_id',
        'question',
        'reponse',
        'repondu_par',
        'repondu_le',
        'statut',
    ];

    protected $casts = [
        'repondu_le' => 'datetime',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reponduPar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'repondu_par');
    }
}
