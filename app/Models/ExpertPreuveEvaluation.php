<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpertPreuveEvaluation extends Model
{
    protected $table = 'expert_preuve_evaluations';

    protected $fillable = [
        'dossier_id',
        'expert_id',
        'critere_id',
        'preuve_index',
        'note',
        'observation',
        'statut',
        'soumis_le',
    ];

    protected $casts = [
        'note'      => 'integer',
        'soumis_le' => 'datetime',
    ];

    public static array $NOTE_LABELS = [
        0 => 'Absent',
        1 => 'Non conforme',
        2 => 'Acceptable',
        3 => 'Conforme',
    ];

    public function noteLabel(): string
    {
        return self::$NOTE_LABELS[$this->note] ?? 'Non évalué';
    }

    public function dossier(): BelongsTo  { return $this->belongsTo(Dossier::class); }
    public function expert(): BelongsTo   { return $this->belongsTo(Expert::class); }
    public function critere(): BelongsTo  { return $this->belongsTo(Critere::class); }
}
