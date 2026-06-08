<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class Dossier extends Model
{
    protected $fillable = [
        'campagne_evaluation_id',
        'reference',
        'campagne',
        'nom',
        'description',
        'observation',
        'statut',
        'etablissement_id',
        'created_by',
        'date_visite',
        'visite_statut_etab',
        'visite_message_etab',
        'annexes_envoyees_experts_at',
    ];

    protected $casts = [
        'date_visite'                 => 'date',
        'annexes_envoyees_experts_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::deleting(function (Dossier $dossier) {
            // Clean up document files from disk (DB rows cascade automatically)
            foreach (['dossier_documents', 'documents'] as $docTable) {
                if (Schema::hasTable($docTable)) {
                    DB::table($docTable)->where('dossier_id', $dossier->id)->get()
                        ->each(function ($doc) {
                            $path = $doc->file_path ?? $doc->path ?? $doc->fichier ?? null;
                            if ($path) {
                                Storage::disk('public')->exists($path) && Storage::disk('public')->delete($path);
                                Storage::disk('local')->exists($path) && Storage::disk('local')->delete($path);
                            }
                        });
                }
            }

            // Clean up rapport expert files from disk
            if (Schema::hasTable('rapports_experts')) {
                DB::table('rapports_experts')->where('dossier_id', $dossier->id)->get()
                    ->each(function ($r) {
                        $path = $r->fichier ?? $r->file_path ?? null;
                        if ($path && Storage::disk('public')->exists($path)) {
                            Storage::disk('public')->delete($path);
                        }
                    });
            }

            // Clean up photo files from disk
            if (Schema::hasTable('dossier_photos')) {
                DB::table('dossier_photos')->where('dossier_id', $dossier->id)->get()
                    ->each(function ($photo) {
                        $path = $photo->file_path ?? null;
                        if ($path && Storage::disk('public')->exists($path)) {
                            Storage::disk('public')->delete($path);
                        }
                    });
            }

            // Remove the CampagneEtablissement record linked to this dossier
            if (!empty($dossier->campagne_etablissement_id) && Schema::hasTable('campagne_etablissements')) {
                DB::table('campagne_etablissements')
                    ->where('id', $dossier->campagne_etablissement_id)
                    ->delete();
            }
        });
    }

    public function campagneEvaluation(): BelongsTo
    {
        return $this->belongsTo(CampagneEvaluation::class, 'campagne_evaluation_id');
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(Etablissement::class, 'etablissement_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function expertAssignments(): HasMany
    {
        return $this->hasMany(DossierExpert::class, 'dossier_id');
    }

    public function experts(): BelongsToMany
    {
        return $this->belongsToMany(
            Expert::class,
            'dossier_experts',
            'dossier_id',
            'expert_id'
        )->withTimestamps();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DossierDocument::class, 'dossier_id');
    }
}