<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expert extends Model
{
    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'date_naissance',
        'ville',
        'pays',
        'telephone',
        'email',
        'diplomes_obtenus',
        'specialite',
        'annee',
        'fonction_actuelle',
        'universite_ou_departement_ministeriel',
        'type_etablissement',
        'etablissement',
        'date_recrutement',
        'grade',
        'responsabilite',
        'etablissement_et_annee_responsabilite',
        // New fields
        'cin_number',
        'rib',
        'contract_start',
        'contract_end',
        'contract_renewals',
        'car_horsepower',
    ];

    // ── Relationships ──

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(ExpertDocument::class);
    }

    public function documentOfType(string $type)
    {
        return $this->documents()->where('type', $type)->latest()->first();
    }
}