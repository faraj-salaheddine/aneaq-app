<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageDossier extends Model
{
    protected $table = 'messages_dossier';

    protected $fillable = ['dossier_id', 'user_id', 'contenu', 'role', 'lu_par_dee', 'lu_par_expert', 'lu_par_etablissement'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dossier()
    {
        return $this->belongsTo(Dossier::class);
    }
}
