<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    protected $table = 'etablissements';

    protected $fillable = [
        'user_id',
        'etablissement',
        'etablissement_2',
        'ville',
        'universite',
        'email',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dossiers()
    {
        return $this->hasMany(Dossier::class);
    }

    public function onboarding()
    {
        return $this->hasOne(EtablissementOnboarding::class);
    }
}