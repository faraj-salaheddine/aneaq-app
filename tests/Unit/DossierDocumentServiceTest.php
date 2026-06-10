<?php

namespace Tests\Unit;

use App\Services\DossierDocumentService;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class DossierDocumentServiceTest extends TestCase
{
    #[DataProvider('rapportDocuments')]
    public function test_it_recognizes_rapport_autoevaluation_variants(array|object $document): void
    {
        $this->assertTrue(DossierDocumentService::isRapportAutoevaluation($document));
    }

    public function test_it_does_not_treat_a_dee_letter_as_an_autoevaluation_report(): void
    {
        $this->assertFalse(DossierDocumentService::isRapportAutoevaluation([
            'type_document' => null,
            'file_path' => 'dossiers/115/lettres/lettre-dee.png',
            'status' => 'Déposé',
        ]));
    }

    public function test_establishment_autoevaluation_report_is_hidden_until_dee_confirmation(): void
    {
        $pendingDocument = [
            'type_document' => 'rapport_autoevaluation',
            'uploaded_by_role' => 'etablissement',
            'status' => DossierDocumentService::STATUS_PENDING_DEE,
        ];

        $this->assertTrue(DossierDocumentService::requiresDeeConfirmationForExperts($pendingDocument));
        $this->assertTrue(DossierDocumentService::isPendingDeeConfirmation($pendingDocument));
        $this->assertFalse(DossierDocumentService::isAvailableToExperts($pendingDocument));

        $pendingDocument['status'] = 'Déposé';

        $this->assertFalse(DossierDocumentService::isAvailableToExperts($pendingDocument));

        $pendingDocument['status'] = DossierDocumentService::STATUS_CONFIRMED_DEE;

        $this->assertTrue(DossierDocumentService::isAvailableToExperts($pendingDocument));
    }

    public function test_rejected_establishment_report_is_not_pending_and_not_available(): void
    {
        $document = [
            'type_document' => 'rapport_autoevaluation',
            'uploaded_by_role' => 'etablissement',
            'status' => DossierDocumentService::STATUS_REJECTED_DEE,
        ];

        $this->assertTrue(DossierDocumentService::isRejectedByDee($document));
        $this->assertFalse(DossierDocumentService::isPendingDeeConfirmation($document));
        $this->assertFalse(DossierDocumentService::isAvailableToExperts($document));
    }

    public function test_other_documents_remain_available_to_experts(): void
    {
        $this->assertTrue(DossierDocumentService::isAvailableToExperts([
            'type_document' => 'document_complementaire',
            'uploaded_by_role' => 'etablissement',
            'status' => DossierDocumentService::STATUS_PENDING_DEE,
        ]));

        $this->assertTrue(DossierDocumentService::isAvailableToExperts([
            'type_document' => 'rapport_autoevaluation',
            'uploaded_by_role' => 'DEE',
            'status' => 'Déposé',
        ]));
    }

    public function test_legacy_establishment_report_path_is_also_protected(): void
    {
        $this->assertFalse(DossierDocumentService::isAvailableToExperts([
            'type_document' => 'rapport_autoevaluation',
            'file_path' => 'dossiers/115/etablissement/rapport.pdf',
            'status' => 'Déposé',
        ]));
    }

    public static function rapportDocuments(): array
    {
        return [
            'standard type' => [['type_document' => 'rapport_autoevaluation']],
            'type with extra underscore' => [['type_document' => 'rapport_auto_evaluation']],
            'accented label' => [['titre' => "Rapport d'autoévaluation"]],
            'path fallback' => [(object) ['file_path' => 'dossiers/12/autoevaluation/rapport-final.pdf']],
        ];
    }
}
