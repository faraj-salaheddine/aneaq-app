<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'cin_number',
        'rib',
        'contract_start',
        'contract_end',
        'contract_renewals',
        'car_horsepower',
    ];

    protected $casts = [
        'contract_start'    => 'date',
        'contract_end'      => 'date',
        'contract_renewals' => 'integer',
    ];

    // ══════════════════════════════════════════════════════════
    // RELATIONS EXISTANTES
    // ══════════════════════════════════════════════════════════

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ExpertDocument::class);
    }

    public function documentOfType(string $type)
    {
        return $this->documents()->where('type', $type)->latest()->first();
    }

    // ══════════════════════════════════════════════════════════
    // NOUVELLES RELATIONS — ESPACE EXPERT
    // ══════════════════════════════════════════════════════════

    /**
     * Tous les dossiers liés à cet expert (toutes participations).
     */
    public function dossiers(): BelongsToMany
    {
        return $this->belongsToMany(Dossier::class, 'expert_dossier')
                    ->withPivot([
                        'statut_participation',
                        'date_invitation',
                        'date_reponse',
                        'motif_refus',
                        'role_comite',
                        'affecte_par',
                    ])
                    ->withTimestamps();
    }

    /**
     * Dossiers avec participation confirmée uniquement.
     */
    public function dossiersConfirmes(): BelongsToMany
    {
        return $this->dossiers()
                    ->wherePivot('statut_participation', 'confirme');
    }

    /**
     * Invitations en attente de réponse.
     */
    public function invitationsEnAttente(): BelongsToMany
    {
        return $this->dossiers()
                    ->wherePivot('statut_participation', 'invite');
    }

    /**
     * Évaluations quantitatives saisies par cet expert.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(EvaluationQuantitative::class);
    }

    /**
     * Rapports finaux déposés par cet expert.
     */
    public function rapports(): HasMany
    {
        return $this->hasMany(RapportExpert::class);
    }

    /**
     * Recommandations saisies par cet expert.
     */
    public function recommandations(): HasMany
    {
        return $this->hasMany(MatriceRecommandation::class);
    }

    // ══════════════════════════════════════════════════════════
    // ACCESSEURS
    // ══════════════════════════════════════════════════════════

    /**
     * Nom complet : "Prénom NOM"
     */
    public function getNomCompletAttribute(): string
    {
        return $this->prenom . ' ' . $this->nom;
    }

    /**
     * Initiales pour l'avatar : "NL" pour Najoua Labjar
     */
    public function getInitialesAttribute(): string
    {
        return strtoupper(
            substr($this->prenom ?? '', 0, 1) .
            substr($this->nom ?? '', 0, 1)
        );
    }

    /**
     * Vérifie si le contrat est encore valide aujourd'hui.
     */
    public function getContratActifAttribute(): bool
    {
        if (!$this->contract_end) return false;
        return $this->contract_end->isFuture();
    }
}