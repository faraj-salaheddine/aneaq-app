<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DossierDocument extends Model
{
    use HasFactory;

    protected $table = 'dossier_documents';

    protected $fillable = [
        'dossier_id',
        'type_document',
        'file_path',
        'original_name',
        'observation',
        'uploaded_by',
        'uploaded_by_role',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function dossier()
    {
        return $this->belongsTo(Dossier::class, 'dossier_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}