<?php

namespace App\Services;

use App\Models\Dossier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DossierDocumentService
{
    public const STATUS_PENDING_DEE = 'en_attente_confirmation_dee';

    public const STATUS_ACCEPTED_DEE = 'accepte_par_dee';

    public const STATUS_CONFIRMED_DEE = 'confirme_par_dee';

    public const STATUS_REJECTED_DEE = 'rejete_par_dee';

    private const TABLES = ['dossier_documents', 'documents'];

    private const IDENTIFYING_COLUMNS = [
        'type_document',
        'document_type',
        'type',
        'titre',
        'title',
        'nom',
        'name',
        'original_name',
        'filename',
        'file_name',
        'file_path',
        'path',
        'fichier',
    ];

    private const ROLE_COLUMNS = [
        'uploaded_by_role',
        'depose_par',
        'source',
    ];

    private const STATUS_COLUMNS = [
        'status',
        'statut',
    ];

    private const PATH_COLUMNS = [
        'file_path',
        'path',
        'fichier',
    ];

    public static function hasRapportAutoevaluation(Dossier|int $dossier): bool
    {
        $dossierId = $dossier instanceof Dossier ? $dossier->id : $dossier;

        foreach (self::TABLES as $table) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'dossier_id')) {
                continue;
            }

            $columns = array_values(array_filter(
                self::IDENTIFYING_COLUMNS,
                fn (string $column) => Schema::hasColumn($table, $column)
            ));

            if ($columns === []) {
                continue;
            }

            $hasRapport = DB::table($table)
                ->where('dossier_id', $dossierId)
                ->get($columns)
                ->contains(fn (object $document) => self::isRapportAutoevaluation($document));

            if ($hasRapport) {
                return true;
            }
        }

        return false;
    }

    public static function isRapportAutoevaluation(array|object $document): bool
    {
        $values = is_array($document) ? $document : (array) $document;

        $text = implode(' ', array_filter(
            array_map(fn (string $column) => $values[$column] ?? null, self::IDENTIFYING_COLUMNS),
            fn ($value) => is_scalar($value) && trim((string) $value) !== ''
        ));

        $normalized = preg_replace(
            '/[^a-z0-9]+/',
            '',
            Str::lower(Str::ascii($text))
        ) ?? '';

        return str_contains($normalized, 'autoevaluation');
    }

    public static function requiresDeeConfirmationForExperts(array|object $document): bool
    {
        if (!self::isRapportAutoevaluation($document)) {
            return false;
        }

        $values = is_array($document) ? $document : (array) $document;
        $role = self::normalize(self::firstValue($values, self::ROLE_COLUMNS));
        $path = self::normalize(self::firstValue($values, self::PATH_COLUMNS));

        return $role === 'etablissement' || str_contains($path, 'etablissement');
    }

    public static function isPendingDeeConfirmation(array|object $document): bool
    {
        if (!self::requiresDeeConfirmationForExperts($document)) {
            return false;
        }

        $values = is_array($document) ? $document : (array) $document;
        $status = self::normalize(self::firstValue($values, self::STATUS_COLUMNS));

        return in_array($status, [
            'enattenteconfirmationdee',
            'depose',
        ], true);
    }

    public static function isAcceptedByDee(array|object $document): bool
    {
        if (!self::requiresDeeConfirmationForExperts($document)) {
            return false;
        }

        $values = is_array($document) ? $document : (array) $document;
        $status = self::normalize(self::firstValue($values, self::STATUS_COLUMNS));

        return $status === 'acceptepardee';
    }

    public static function isRejectedByDee(array|object $document): bool
    {
        if (!self::requiresDeeConfirmationForExperts($document)) {
            return false;
        }

        $values = is_array($document) ? $document : (array) $document;
        $status = self::normalize(self::firstValue($values, self::STATUS_COLUMNS));

        return in_array($status, [
            'rejetepardee',
            'refusepardee',
            'rejete',
            'refuse',
        ], true);
    }

    public static function isAvailableToExperts(array|object $document): bool
    {
        if (!self::requiresDeeConfirmationForExperts($document)) {
            return true;
        }

        $values = is_array($document) ? $document : (array) $document;
        $status = self::normalize(self::firstValue($values, self::STATUS_COLUMNS));

        return in_array($status, [
            'confirmepardee',
            'validepardee',
            'valide',
        ], true);
    }

    private static function firstValue(array $values, array $columns): mixed
    {
        foreach ($columns as $column) {
            if (isset($values[$column]) && trim((string) $values[$column]) !== '') {
                return $values[$column];
            }
        }

        return null;
    }

    private static function normalize(mixed $value): string
    {
        return preg_replace(
            '/[^a-z0-9]+/',
            '',
            Str::lower(Str::ascii((string) $value))
        ) ?? '';
    }
}
