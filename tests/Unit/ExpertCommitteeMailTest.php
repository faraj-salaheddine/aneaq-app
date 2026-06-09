<?php

namespace Tests\Unit;

use App\Mail\ExpertAccountCreatedMail;
use App\Mail\ExpertNotificationMail;
use Tests\TestCase;

class ExpertCommitteeMailTest extends TestCase
{
    private array $committeeMembers = [
        [
            'name' => 'Mina Aadil',
            'role' => 'Chef de comité',
            'status' => 'Invitation à confirmer',
        ],
        [
            'name' => 'Ahmed Aamouche',
            'role' => 'Expert',
            'status' => 'En attente de confirmation DEE',
        ],
    ];

    public function test_account_email_displays_committee_before_expert_response(): void
    {
        $html = (new ExpertAccountCreatedMail(
            expertName: 'Mina Aadil',
            loginEmail: 'mina@example.test',
            plainPassword: 'secret',
            dossierReference: 'DOS-2024-68-326',
            campaignReference: 'Campagne 2026',
            confirmationUrl: 'https://example.test/confirm',
            expertRole: 'Chef de comité',
            committeeMembers: $this->committeeMembers,
        ))->render();

        $this->assertStringContainsString('Composition du comité', $html);
        $this->assertStringContainsString('Ahmed Aamouche', $html);
        $this->assertStringContainsString('accepter ou refuser', $html);
    }

    public function test_notification_email_displays_current_committee(): void
    {
        $html = (new ExpertNotificationMail(
            expertName: 'Mina Aadil',
            titre: 'Proposition d’affectation',
            notificationMessage: 'Une affectation vous est proposée.',
            platformUrl: 'https://example.test/expert/dashboard',
            committeeMembers: $this->committeeMembers,
        ))->render();

        $this->assertStringContainsString('Composition du comité', $html);
        $this->assertStringContainsString('Mina Aadil', $html);
        $this->assertStringContainsString('Ahmed Aamouche', $html);
    }
}
