<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SwotDomaine extends Model
{
    protected $table = 'swot_domaines';

    protected $fillable = [
        'dossier_id',
        'expert_id',
        'domaine',
        'domaine_label',
        'forces',
        'faiblesses',
        'opportunites',
        'menaces',
        'statut',
    ];

    public function dossier(): BelongsTo { return $this->belongsTo(Dossier::class); }
    public function expert(): BelongsTo  { return $this->belongsTo(Expert::class); }
}
