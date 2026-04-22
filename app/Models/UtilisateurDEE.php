<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UtilisateurDEE extends Model
{
    protected $table = 'utilisateurs_dee';

    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'telephone',
        'role',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}