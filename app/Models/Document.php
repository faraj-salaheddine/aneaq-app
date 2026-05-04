<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'type_document',
        'file_path',
        'original_name',
        'uploaded_by',
        'observation',
    ];

    public function dossier()
    {
        return $this->belongsTo(Dossier::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
