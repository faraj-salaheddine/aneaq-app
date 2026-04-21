<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpertDocument extends Model
{
    protected $fillable = [
        'expert_id', 'type', 'file_path', 'original_name', 'mime_type', 'file_size'
    ];

    public function expert()
    {
        return $this->belongsTo(Expert::class);
    }
}
