<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Etablissement extends Model
{
    use HasFactory;

    protected $fillable = [
        'acronyme',
        'domaine_connaissances',
        'evaluation',
        'etablissement',
        'etablissement_2',
        'ville',
        'universite',
    ];
}