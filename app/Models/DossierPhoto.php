<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DossierPhoto extends Model
{
    protected $fillable = [
        'dossier_id',
        'file_path',
        'original_name',
        'mime_type',
        'size',
        'uploaded_by',
    ];

    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }
}
