<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 9px; color: #1e293b; background: #fff; }

        .cover { background: #0C447C; color: #fff; padding: 36px 28px; }
        .cover h1 { font-size: 19px; font-weight: 700; margin-bottom: 7px; }
        .cover .sub { font-size: 10px; opacity: 0.85; }
        .cover .gen { display: inline-block; margin-top: 10px; background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.25); padding: 3px 10px; border-radius: 99px; font-size: 8px; }

        .expert-block { margin: 12px 16px 0; border: 1px solid #d1fae5; }
        .expert-head { background: #059669; color: #fff; padding: 8px 13px; }
        .expert-head .nm { font-size: 11px; font-weight: 700; }
        .expert-head .mt { font-size: 8px; opacity: .88; margin-top: 2px; }

        .pills { width: 100%; border-collapse: collapse; border-bottom: 1px solid #e2e8f0; }
        .pills td { width: 25%; text-align: center; padding: 6px 4px; border-right: 1px solid #e2e8f0; }
        .pills td:last-child { border-right: none; }
        .pv { font-size: 14px; font-weight: 800; }
        .pl { font-size: 7px; margin-top: 1px; }
        .pa { color: #dc2626; background: #fee2e2; }
        .pn { color: #ea580c; background: #ffedd5; }
        .pac{ color: #ca8a04; background: #fef9c3; }
        .pc { color: #16a34a; background: #dcfce7; }

        .section-wrap { margin: 10px 13px 10px; }
        .section-head { width: 100%; border-collapse: collapse; background: #f1f5f9; border: 1px solid #e2e8f0; margin-bottom: 6px; }
        .section-head td { padding: 6px 10px; vertical-align: middle; }
        .section-title { font-size: 10px; font-weight: 700; color: #0C447C; }
        .score-badge { font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 4px; color: #fff; }
        .sub-text { font-size: 7.5px; color: #64748b; margin-bottom: 6px; }

        .two-col { width: 100%; border-collapse: collapse; }
        .two-col td { vertical-align: top; }

        .domain-tbl { width: 100%; border-collapse: collapse; font-size: 8px; }
        .domain-tbl th { background: #e2e8f0; color: #475569; padding: 4px 8px; text-align: left; font-size: 7.5px; }
        .domain-tbl td { padding: 4px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .domain-tbl tr:nth-child(even) td { background: #f8fafc; }
        .code-tag { font-family: monospace; font-weight: 800; color: #1c5fdc; }

        .swot-wrap { margin-top: 7px; }
        .swot-lbl  { font-size: 7.5px; font-weight: 700; color: #64748b; margin-bottom: 3px; }
        .swot-tbl  { width: 100%; border-collapse: collapse; }
        .swot-tbl td { width: 25%; vertical-align: top; padding: 5px 6px; font-size: 7.5px; border: 1px solid #e2e8f0; }
        .swot-hd   { font-weight: 700; margin-bottom: 2px; font-size: 7.5px; }
        .sf { background: #f0fdf4; color: #15803d; }
        .sfw{ background: #fff1f2; color: #be123c; }
        .so { background: #eff6ff; color: #1d4ed8; }
        .sm { background: #fff7ed; color: #c2410c; }

        .chart-title { font-size: 8px; font-weight: 700; color: #475569; text-align: center; margin-bottom: 4px; }

        .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 4px 16px; background: #f1f5f9; border-top: 1px solid #e2e8f0; font-size: 7px; color: #94a3b8; }
        .ft { display: table; width: 100%; }
        .fl { display: table-cell; text-align: left; }
        .fr { display: table-cell; text-align: right; }
        .pb { page-break-after: always; }
    </style>
</head>
<body>

@php
/* ── Helpers ── */
$scoreColor = fn($s) => $s >= 67 ? '#0e7c5b' : ($s >= 34 ? '#b35c00' : '#c0344a');
$xe = fn($s) => htmlspecialchars((string)$s, ENT_XML1 | ENT_COMPAT, 'UTF-8');

$conformityStats = function (array $notes): array {
    $valid = array_filter($notes, fn($n) => $n !== null && $n !== '');
    $total = count($notes);
    return [
        'score'     => $total > 0 ? (int) round((array_sum(array_map('intval', $valid)) / ($total * 3)) * 100) : 0,
        'evaluated' => count($valid),
        'total'     => $total,
    ];
};

$buildSummary = function (array $grouped) use ($conformityStats): array {
    $domains = array_map(function ($dom) use ($conformityStats) {
        $references = [];
        $elements   = [];
        $domNotes   = [];
        foreach ($dom['champs'] as $ch) {
            $chNotes = [];
            foreach ($ch['references'] as $ref) {
                $rNotes = [];
                foreach ($ref['criteres'] as $cr) {
                    foreach ($cr['preuves'] as $pv) {
                        $rNotes[] = $pv['note'] ?? null;
                    }
                }
                $references[] = array_merge(['code' => $ref['reference'], 'label' => $ref['reference_label'], 'notes' => $rNotes], $conformityStats($rNotes));
                $chNotes      = array_merge($chNotes, $rNotes);
            }
            $elements[] = array_merge(['code' => $ch['champ'], 'label' => $ch['champ_label'], 'notes' => $chNotes], $conformityStats($chNotes));
            $domNotes   = array_merge($domNotes, $chNotes);
        }
        return array_merge([
            'code'       => $dom['domaine'],
            'label'      => $dom['domaine_label'],
            'swot'       => $dom['swot'] ?? null,
            'elements'   => $elements,
            'references' => $references,
            'notes'      => $domNotes,
        ], $conformityStats($domNotes));
    }, $grouped);
    $all = array_merge(...array_map(fn($d) => $d['notes'], $domains));
    return array_merge(['domains' => $domains], $conformityStats($all));
};

/* ── Radar SVG ── */
$radarSvg = function (array $data, int $w = 260, int $h = 255, bool $codeOnly = false) use ($xe): string {
    $n = count($data);
    if ($n < 3) return '';
    $cx = $w / 2; $cy = $h / 2;
    $r  = min($cx, $cy) * 0.52;
    $lr = min($cx, $cy) * 0.88;

    $ang = [];
    for ($i = 0; $i < $n; $i++) $ang[] = -M_PI / 2 + ($i / $n) * 2 * M_PI;

    $p2 = fn($v) => round($v, 2);
    $svg = '<svg width="' . $w . '" height="' . $h . '" xmlns="http://www.w3.org/2000/svg">';

    for ($l = 1; $l <= 5; $l++) {
        $rr = ($l / 5) * $r; $pts = [];
        for ($i = 0; $i < $n; $i++) $pts[] = $p2($cx + $rr * cos($ang[$i])) . ',' . $p2($cy + $rr * sin($ang[$i]));
        $fill = $l % 2 === 0 ? '#f8fafc' : 'none';
        $svg .= '<polygon points="' . implode(' ', $pts) . '" fill="' . $fill . '" stroke="#cbd5e1" stroke-width="0.5"/>';
        $svg .= '<text x="' . $p2($cx + 2) . '" y="' . $p2($cy - $rr - 2) . '" font-size="6" fill="#94a3b8">' . ($l * 20) . '%</text>';
    }
    for ($i = 0; $i < $n; $i++) {
        $svg .= '<line x1="' . $cx . '" y1="' . $cy . '" x2="' . $p2($cx + $r * cos($ang[$i])) . '" y2="' . $p2($cy + $r * sin($ang[$i])) . '" stroke="#cbd5e1" stroke-width="0.5"/>';
    }

    $dpts = [];
    foreach ($data as $i => $it) {
        $v = min(1.0, ($it['score'] ?? 0) / 100);
        $dpts[] = $p2($cx + $v * $r * cos($ang[$i])) . ',' . $p2($cy + $v * $r * sin($ang[$i]));
    }
    $svg .= '<polygon points="' . implode(' ', $dpts) . '" fill="#1c5fdc" fill-opacity="0.15" stroke="#1c5fdc" stroke-width="2"/>';

    foreach ($data as $i => $it) {
        $v  = min(1.0, ($it['score'] ?? 0) / 100);
        $px = $p2($cx + $v * $r * cos($ang[$i]));
        $py = $p2($cy + $v * $r * sin($ang[$i]));
        $svg .= '<circle cx="' . $px . '" cy="' . $py . '" r="2.5" fill="#1c5fdc"/>';

        $lx = $p2($cx + $lr * cos($ang[$i]));
        $ly = $p2($cy + $lr * sin($ang[$i]));
        $anchor = $lx < $cx - 6 ? 'end' : ($lx > $cx + 6 ? 'start' : 'middle');
        $raw = $codeOnly ? ($it['code'] ?? '') : ($it['label'] ?? $it['code'] ?? '');
        $lbl = mb_strlen($raw) > 26 ? mb_substr($raw, 0, 24) . '…' : $raw;
        $svg .= '<text x="' . $lx . '" y="' . ($ly + 3) . '" text-anchor="' . $anchor . '" font-size="8" fill="#475569" font-weight="bold">' . $xe($lbl) . '</text>';
    }
    $svg .= '</svg>';
    return $svg;
};

/* ── Bar Chart SVG ── */
$barSvg = function (array $data, int $w = 360, int $h = 195) use ($xe, $scoreColor): string {
    $n = count($data);
    if ($n === 0) return '';
    $colors = ['#1c5fdc','#0e7c5b','#b35c00','#5046a8','#c0344a','#0f766e','#7c3aed','#475569','#0369a1','#166534'];
    $pL = 26; $pR = 8; $pT = 17; $pB = 26;
    $cW = $w - $pL - $pR; $cH = $h - $pT - $pB;
    $gap = $cW / $n;
    $bW  = max(7, min(20, $gap * 0.62));

    $p2 = fn($v) => round($v, 2);
    $svg = '<svg width="' . $w . '" height="' . $h . '" xmlns="http://www.w3.org/2000/svg">';

    for ($l = 0; $l <= 4; $l++) {
        $y = $p2($pT + $cH * (1 - $l / 4));
        $svg .= '<line x1="' . $pL . '" y1="' . $y . '" x2="' . ($pL + $cW) . '" y2="' . $y . '" stroke="#e2e8f0" stroke-width="0.5"/>';
        $svg .= '<text x="' . ($pL - 3) . '" y="' . ($y + 3) . '" text-anchor="end" font-size="6.5" fill="#94a3b8">' . ($l * 25) . '%</text>';
    }

    foreach ($data as $i => $it) {
        $score = $it['score'] ?? 0;
        $bH    = $p2(max(2, ($score / 100) * $cH));
        $bX    = $p2($pL + $i * $gap + ($gap - $bW) / 2);
        $bY    = $p2($pT + $cH - $bH);
        $clr   = $colors[$i % count($colors)];
        $lx    = $p2($bX + $bW / 2);

        $svg .= '<rect x="' . $bX . '" y="' . $bY . '" width="' . $bW . '" height="' . $bH . '" fill="' . $clr . '" rx="2"/>';
        $svg .= '<text x="' . $lx . '" y="' . ($bY - 2) . '" text-anchor="middle" font-size="7" fill="' . $clr . '" font-weight="bold">' . $score . '%</text>';
        $svg .= '<text x="' . $lx . '" y="' . ($pT + $cH + 11) . '" text-anchor="middle" font-size="7" fill="#64748b" font-weight="bold">' . $xe($it['code'] ?? '') . '</text>';
    }
    $svg .= '</svg>';
    return $svg;
};

/* DomPDF ne rend pas le SVG inline — on encode en base64 pour un <img> */
$svgImg = function (string $svg, int $w, int $h): string {
    return '<img src="data:image/svg+xml;base64,' . base64_encode($svg) . '" width="' . $w . '" height="' . $h . '" style="display:block;"/>';
};
@endphp

<!-- Cover -->
<div class="cover">
    <div style="font-size:10px;opacity:.7;margin-bottom:5px;">ANEAQ — Agence Nationale d'Évaluation et d'Assurance Qualité</div>
    <h1>Évaluation des Annexes</h1>
    <div class="sub">{{ $dossier->etablissement?->nom ?? $dossier->reference }}</div>
    <div class="sub" style="margin-top:3px;">Dossier : {{ $dossier->reference }}</div>
    <div class="gen">Généré le {{ now()->format('d/m/Y à H:i') }}</div>
</div>

@if(empty($evaluationsAnnexes))
<div style="padding:24px 16px;color:#64748b;">Aucune évaluation des annexes soumise pour ce dossier.</div>
@else

@foreach($evaluationsAnnexes as $evaluation)
@php $sum = $buildSummary($evaluation['grouped']); @endphp

<div class="expert-block">
    <div class="expert-head">
        <div class="nm">{{ $evaluation['expert_nom'] }}</div>
        <div class="mt">Soumis le {{ $evaluation['soumis_le'] }} &nbsp;·&nbsp; {{ $evaluation['total'] }} preuves évaluées</div>
    </div>

    {{-- Note distribution --}}
    <table class="pills">
        <tr>
            <td class="pa"><div class="pv">{{ $evaluation['stats'][0] ?? 0 }}</div><div class="pl">Absent</div></td>
            <td class="pn"><div class="pv">{{ $evaluation['stats'][1] ?? 0 }}</div><div class="pl">Non conforme</div></td>
            <td class="pac"><div class="pv">{{ $evaluation['stats'][2] ?? 0 }}</div><div class="pl">Acceptable</div></td>
            <td class="pc"><div class="pv">{{ $evaluation['stats'][3] ?? 0 }}</div><div class="pl">Conforme</div></td>
        </tr>
    </table>

    {{-- ── Global conformity ── --}}
    <div class="section-wrap">
        <table class="section-head">
            <tr>
                <td><span class="section-title">Conformité globale</span></td>
                <td style="text-align:right;width:70px;">
                    <span class="score-badge" style="background:{{ $scoreColor($sum['score']) }};">{{ $sum['score'] }}%</span>
                </td>
            </tr>
        </table>
        <div class="sub-text">Points obtenus / note maximale de toutes les preuves du dossier. {{ $sum['evaluated'] }}/{{ $sum['total'] }} preuves évaluées.</div>

        <table class="two-col">
            <tr>
                <td style="width:48%;padding-right:10px;vertical-align:top;">
                    <div class="chart-title">Score de conformité par domaine</div>
                    <table class="domain-tbl">
                        <thead><tr><th>Domaine</th><th style="text-align:right;">Score</th></tr></thead>
                        <tbody>
                            @foreach($sum['domains'] as $d)
                            <tr>
                                <td><span class="code-tag">{{ $d['code'] }}</span> — {{ $d['label'] }}</td>
                                <td style="text-align:right;font-weight:800;color:{{ $scoreColor($d['score']) }};">{{ $d['score'] }}%</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </td>
                <td style="width:52%;vertical-align:top;">
                    <div class="chart-title">Score de conformité par domaine</div>
                    {!! $svgImg($radarSvg($sum['domains'], 260, 240, true), 260, 240) !!}
                </td>
            </tr>
        </table>
    </div>

    {{-- ── Per domain ── --}}
    @foreach($sum['domains'] as $dom)
    <div class="section-wrap" style="margin-top:8px;">
        <table class="section-head">
            <tr>
                <td><span class="section-title">Domaine {{ $dom['code'] }} : {{ $dom['label'] }}</span></td>
                <td style="text-align:right;width:70px;">
                    <span class="score-badge" style="background:{{ $scoreColor($dom['score']) }};">{{ $dom['score'] }}%</span>
                </td>
            </tr>
        </table>
        <div class="sub-text">{{ $dom['evaluated'] }}/{{ $dom['total'] }} preuves évaluées dans ce domaine</div>

        @php $hasElementRadar = count($dom['elements']) >= 3; @endphp

        <table class="two-col">
            <tr>
                @if($hasElementRadar)
                <td style="width:46%;vertical-align:top;padding-right:8px;">
                    <div class="chart-title">Taux de conformité par élément</div>
                    {!! $svgImg($radarSvg($dom['elements'], 240, 225, false), 240, 225) !!}
                </td>
                <td style="width:54%;vertical-align:top;">
                    <div class="chart-title">Taux de conformité par référence</div>
                    {!! $svgImg($barSvg($dom['references'], 355, 195), 355, 195) !!}
                </td>
                @else
                <td style="width:100%;vertical-align:top;">
                    <div class="chart-title">Taux de conformité par référence</div>
                    {!! $svgImg($barSvg($dom['references'], 520, 195), 520, 195) !!}
                </td>
                @endif
            </tr>
        </table>

        @if(!empty($dom['swot']))
        @php $sw = $dom['swot']; @endphp
        <div class="swot-wrap">
            <div class="swot-lbl">Analyse SWOT</div>
            <table class="swot-tbl">
                <tr>
                    <td class="sf"><div class="swot-hd">Forces</div>{{ $sw['forces'] ?: '—' }}</td>
                    <td class="sfw"><div class="swot-hd">Faiblesses</div>{{ $sw['faiblesses'] ?: '—' }}</td>
                    <td class="so"><div class="swot-hd">Opportunités</div>{{ $sw['opportunites'] ?: '—' }}</td>
                    <td class="sm"><div class="swot-hd">Menaces</div>{{ $sw['menaces'] ?: '—' }}</td>
                </tr>
            </table>
        </div>
        @endif
    </div>
    @endforeach
</div>

@if(!$loop->last)<div class="pb"></div>@endif
@endforeach

@endif

<div class="footer">
    <div class="ft">
        <span class="fl">ANEAQ — Document confidentiel — {{ $dossier->reference }}</span>
        <span class="fr">Page <span class="pagenum"></span></span>
    </div>
</div>

</body>
</html>
