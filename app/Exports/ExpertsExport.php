<?php
namespace App\Exports;

use App\Models\Expert;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ExpertsExport
{
    public function download()
    {
        $experts = Expert::all();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Experts ANEAQ');

        $headers = [
            'Nom', 'Prénom', 'Email', 'Téléphone', 'Spécialité',
            'Grade', 'Fonction actuelle', 'Établissement',
            'Type établissement', 'Ville', 'Pays', 'Numéro CIN',
            'Début contrat', 'Fin contrat', 'Renouvellements', 'Puissance (CV)',
        ];

        foreach ($headers as $i => $header) {
            $col = chr(65 + $i);
            $sheet->setCellValue("{$col}1", $header);
        }

        $lastCol = chr(65 + count($headers) - 1);

        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF0C447C']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        foreach (range('A', $lastCol) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        foreach ($experts as $row => $e) {
            $rowNum = $row + 2;
            $data = [
                $e->nom, $e->prenom, $e->email, $e->telephone,
                $e->specialite, $e->grade, $e->fonction_actuelle,
                $e->etablissement, $e->type_etablissement, $e->ville,
                $e->pays, $e->cin_number, $e->contract_start,
                $e->contract_end, $e->contract_renewals, $e->car_horsepower,
            ];
            foreach ($data as $i => $value) {
                $col = chr(65 + $i);
                $sheet->setCellValue("{$col}{$rowNum}", $value ?? '');
            }

            if ($row % 2 === 0) {
                $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF8FAFC']],
                ]);
            }
        }

        $filename = 'experts_aneaq_' . now()->format('Y-m-d') . '.xlsx';
        $writer = new Xlsx($spreadsheet);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"{$filename}\"");
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }
}