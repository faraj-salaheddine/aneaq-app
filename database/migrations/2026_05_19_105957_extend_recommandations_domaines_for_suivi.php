<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('recommandations_domaines')) {
            Schema::create('recommandations_domaines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('dossier_id')->constrained('dossiers')->onDelete('cascade');
                $table->unsignedBigInteger('expert_id');
                $table->string('domaine_code', 10)->nullable();
                $table->text('recommandation');
                $table->enum('urgence', ['rouge', 'orange', 'vert'])->default('vert');
                $table->timestamps();
                $table->index(['expert_id', 'dossier_id']);
            });
        }

        Schema::table('recommandations_domaines', function (Blueprint $table) {
            if (!Schema::hasColumn('recommandations_domaines', 'statut')) {
                $table->enum('statut', [
                    'brouillon', 'soumise_dee', 'renvoyee_expert',
                    'validee_dee', 'envoyee_etablissement', 'en_cours', 'cloturee',
                ])->default('brouillon')->after('urgence');
            }
            if (!Schema::hasColumn('recommandations_domaines', 'commentaire_dee')) {
                $table->text('commentaire_dee')->nullable()->after('statut');
            }
            if (!Schema::hasColumn('recommandations_domaines', 'commentaire_revision')) {
                $table->text('commentaire_revision')->nullable()->after('commentaire_dee');
            }
            if (!Schema::hasColumn('recommandations_domaines', 'date_soumission_dee')) {
                $table->timestamp('date_soumission_dee')->nullable();
            }
            if (!Schema::hasColumn('recommandations_domaines', 'date_validation_dee')) {
                $table->timestamp('date_validation_dee')->nullable();
            }
            if (!Schema::hasColumn('recommandations_domaines', 'date_envoi_etablissement')) {
                $table->timestamp('date_envoi_etablissement')->nullable();
            }
            if (!Schema::hasColumn('recommandations_domaines', 'delai_etablissement')) {
                $table->date('delai_etablissement')->nullable();
            }
            if (!Schema::hasColumn('recommandations_domaines', 'reponse_etablissement')) {
                $table->text('reponse_etablissement')->nullable();
            }
            if (!Schema::hasColumn('recommandations_domaines', 'date_reponse_etablissement')) {
                $table->timestamp('date_reponse_etablissement')->nullable();
            }
            if (!Schema::hasColumn('recommandations_domaines', 'date_cloture')) {
                $table->timestamp('date_cloture')->nullable();
            }
            if (!Schema::hasColumn('recommandations_domaines', 'cloture_par_id')) {
                $table->unsignedBigInteger('cloture_par_id')->nullable();
            }
        });

        if (!Schema::hasTable('recommandation_rappels')) {
            Schema::create('recommandation_rappels', function (Blueprint $table) {
                $table->id();
                $table->foreignId('dossier_id')->constrained('dossiers')->onDelete('cascade');
                $table->enum('type', ['standard', 'personnalise'])->default('standard');
                $table->text('message_personnalise')->nullable();
                $table->unsignedBigInteger('envoye_par_id')->nullable();
                $table->timestamp('envoye_le')->useCurrent();
                $table->timestamps();
                $table->index('dossier_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('recommandation_rappels');
        if (Schema::hasTable('recommandations_domaines')) {
            Schema::table('recommandations_domaines', function (Blueprint $table) {
                foreach (['statut','commentaire_dee','commentaire_revision','date_soumission_dee',
                    'date_validation_dee','date_envoi_etablissement','delai_etablissement',
                    'reponse_etablissement','date_reponse_etablissement','date_cloture','cloture_par_id'] as $col) {
                    if (Schema::hasColumn('recommandations_domaines', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
