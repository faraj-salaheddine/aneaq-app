<?php

namespace App\Exports;

use App\Models\CampagneEtablissement;
use App\Models\CampagneEvaluation;
use App\Models\Dossier;
use App\Models\Etablissement;
use Illuminate\Support\Facades\Schema;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class CampagneEtablissementsExport
{
    private static array $STATUS_LABELS = [
        'en_attente_confirmation_dee' => 'En attente confirmation DEE',
        'acces_envoye'                => 'Accès envoyé',
        'compte_etablissement_cree'   => 'Accès envoyé',
        'refuse'                      => 'Refusé',
    ];

    private static array $STATUS_COLORS = [
        'en_attente_confirmation_dee' => 'FFFBBF24', // amber
        'acces_envoye'                => 'FF16A34A', // green
        'compte_etablissement_cree'   => 'FF16A34A', // green
        'refuse'                      => 'FFDC2626', // red
    ];

    public function download(CampagneEvaluation $campagne): void
    {
        $items = CampagneEtablissement::query()
            ->where('campagne_evaluation_id', $campagne->id)
            ->get();

        $etablissementIds = $items->pluck('etablissement_id')->filter()->unique()->all();
        $etablissements   = Etablissement::whereIn('id', $etablissementIds)->get()->keyBy('id');

        $dossierIds = $items->pluck('dossier_id')->filter()->unique()->all();
        $dossiers   = $dossierIds
            ? Dossier::whereIn('id', $dossierIds)->get()->keyBy('id')
            : collect();

        // Also load dossiers linked via campagne_evaluation_id (in case dossier_id not set on pivot)
        $dossiersByEtab = Schema::hasColumn('dossiers', 'campagne_evaluation_id')
            ? Dossier::where('campagne_evaluation_id', $campagne->id)
                ->get()
                ->keyBy('etablissement_id')
            : collect();

        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Établissements Vague');

        // — Header row —
        $headers = [
            'Établissement', 'Acronyme', 'Type', 'Université / Tutelle',
            'Ville', 'Email', 'Statut', 'Date envoi accès', 'Référence dossier',
        ];

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
            $etab   = $etablissements->get($item->etablissement_id);

            $status       = (string) ($item->statut ?? $item->status ?? 'en_attente_confirmation_dee');
            $statusLabel  = self::$STATUS_LABELS[$status] ?? ucfirst(str_replace('_', ' ', $status));
            $statusColor  = self::$STATUS_COLORS[$status] ?? 'FFcbd5e1';

            $dossier = $dossiers->get($item->dossier_id)
                ?? $dossiersByEtab->get($item->etablissement_id);

            $nom       = $this->etabName($etab);
            $acronyme  = $etab?->acronyme ?? '—';
            $type      = $this->etabType($etab);
            $universite = $etab?->universite ?? $etab?->universite_nom ?? '—';
            $ville     = $etab?->ville ?? '—';
            $email     = $item->email ?? $etab?->email ?? '—';
            $sentAt    = $item->access_sent_at
                ? \Carbon\Carbon::parse($item->access_sent_at)->format('d/m/Y H:i')
                : '—';
            $dossierRef = $dossier?->reference ?? '—';

            $data = [$nom, $acronyme, $type, $universite, $ville, $email, $statusLabel, $sentAt, $dossierRef];

            foreach ($data as $i => $value) {
                $sheet->setCellValue("{$this->col($i)}{$rowNum}", $value ?? '');
            }

            // Alternating row background
            if ($rowIndex % 2 === 0) {
                $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF8FAFC']],
                ]);
            }

            // Color the status cell
            $statusColLetter = $this->col(6); // column G = "Statut"
            $sheet->getStyle("{$statusColLetter}{$rowNum}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $statusColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
        }

        foreach (range(0, count($headers) - 1) as $i) {
            $sheet->getColumnDimension($this->col($i))->setAutoSize(true);
        }

        $reference = $campagne->reference ?? $campagne->id;
        $filename  = "vague_{$reference}_etablissements_" . now()->format('Y-m-d') . '.xlsx';
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

    private function etabName(?Etablissement $e): string
    {
        if (!$e) return '—';
        foreach (['etablissement_2', 'etablissement', 'nom', 'name'] as $col) {
            $v = $e->$col ?? null;
            if ($v) return $v;
        }
        return "Établissement #{$e->id}";
    }

    private function etabType(?Etablissement $e): string
    {
        if (!$e) return '—';
        foreach (['type_etablissement', 'type', 'vocation'] as $col) {
            $v = $e->$col ?? null;
            if ($v) return $v;
        }
        return '—';
    }
}
