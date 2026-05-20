<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etablissement extends Model
{
    protected $table = 'etablissements';

    protected $fillable = [
        'user_id',
        'acronyme',
        'domaine_connaissances',
        'evaluation',
        'etablissement',
        'etablissement_2',
        'ville',
        'universite',
        'email',
        'nom',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dossiers()
    {
        return $this->hasMany(Dossier::class);
    }

    // Dans Etablissement.php, ajouter parmi les autres relations
public function criterePreuves()
{
    return $this->hasMany(CriterePreuve::class);
}

    public function onboarding()
    {
        return $this->hasOne(EtablissementOnboarding::class);
    }
}