<?php

namespace App\Exports;

use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\Expert;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class DossierExpertsExport
{
    private static array $ROLE_LABELS = [
        'expert'      => 'Expert',
        'chef_comite' => 'Coordonnateur expert',
    ];

    private static array $STATUS_LABELS = [
        'en_attente_confirmation_dee'    => 'En attente confirmation DEE',
        'en_attente_confirmation_expert' => 'Accès envoyé',
        'acces_envoye'                   => 'Accès envoyé',
        'confirme_par_expert'            => 'Confirmé',
        'confirme_par_dee'               => 'Confirmé par DEE',
        'refuse_par_expert'              => 'Refusé par expert',
        'pending_confirmation'           => 'En attente confirmation DEE',
    ];

    private static array $STATUS_COLORS = [
        'en_attente_confirmation_dee'    => 'FFFBBF24', // amber
        'pending_confirmation'           => 'FFFBBF24',
        'en_attente_confirmation_expert' => 'FF2563EB', // blue
        'acces_envoye'                   => 'FF2563EB',
        'confirme_par_expert'            => 'FF16A34A', // green
        'confirme_par_dee'               => 'FF16A34A',
        'refuse_par_expert'              => 'FFDC2626', // red
    ];

    private static array $ROLE_COLORS = [
        'chef_comite' => 'FF7C3AED', // violet
        'expert'      => 'FF0C447C', // blue
    ];

    public function download(Dossier $dossier): void
    {
        $items = DossierExpert::query()
            ->where('dossier_id', $dossier->id)
            ->get();

        $expertIds  = $items->pluck('expert_id')->filter()->unique()->all();
        $expertsMap = Expert::whereIn('id', $expertIds)->get()->keyBy('id');

        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Experts Dossier');

        // — Header —
        $headers = ['Prénom', 'Nom', 'Email', 'Spécialité', 'Établissement', 'Ville', 'Rôle', 'Statut'];

        foreach ($headers as $i => $header) {
            $col = $this->col($i);
            $sheet->setCellValue("{$col}1", $header);
        }

        $lastCol = $this->col(count($headers) - 1);

        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 11],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF0C447C']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(22);

        // — Data rows —
        foreach ($items as $rowIndex => $item) {
            $rowNum = $rowIndex + 2;
            $expert = $expertsMap->get($item->expert_id);

            $prenom      = $expert?->prenom ?? $expert?->first_name ?? '—';
            $nom         = $expert?->nom ?? $expert?->last_name ?? $expert?->name ?? '—';
            $email       = $expert?->email ?? '—';
            $specialite  = $expert?->specialite ?? '—';
            $etab        = $expert?->etablissement ?? '—';
            $ville       = $expert?->ville ?? '—';
            $roleRaw     = $item->role_expert ?? $item->role ?? 'expert';
            $statusRaw   = $item->status ?? $item->statut ?? 'en_attente_confirmation_dee';
            $roleLabel   = self::$ROLE_LABELS[$roleRaw] ?? ucfirst(str_replace('_', ' ', $roleRaw));
            $statusLabel = self::$STATUS_LABELS[$statusRaw] ?? ucfirst(str_replace('_', ' ', $statusRaw));
            $roleColor   = self::$ROLE_COLORS[$roleRaw] ?? 'FF0C447C';
            $statusColor = self::$STATUS_COLORS[$statusRaw] ?? 'FFcbd5e1';

            $data = [$prenom, $nom, $email, $specialite, $etab, $ville, $roleLabel, $statusLabel];

            foreach ($data as $i => $value) {
                $sheet->setCellValue("{$this->col($i)}{$rowNum}", $value ?? '');
            }

            // Alternating row background
            if ($rowIndex % 2 === 0) {
                $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF8FAFC']],
                ]);
            }

            // Role cell color
            $roleColLetter = $this->col(6); // G = Rôle
            $sheet->getStyle("{$roleColLetter}{$rowNum}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $roleColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Status cell color
            $statusColLetter = $this->col(7); // H = Statut
            $sheet->getStyle("{$statusColLetter}{$rowNum}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $statusColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }

        foreach (range(0, count($headers) - 1) as $i) {
            $sheet->getColumnDimension($this->col($i))->setAutoSize(true);
        }

        $reference = $dossier->reference ?? $dossier->id;
        $filename  = "dossier_{$reference}_experts_" . now()->format('Y-m-d') . '.xlsx';
        $writer    = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"{$filename}\"");
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }

    private function col(int $i): string
    {
        if ($i < 26) {
            return chr(65 + $i);
        }
        return chr(64 + intdiv($i, 26)) . chr(65 + ($i % 26));
    }
}
