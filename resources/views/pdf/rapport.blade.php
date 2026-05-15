<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1e293b; background: #fff; }
        .cover { background: linear-gradient(135deg, #0C447C, #1a5fa8); color: #fff; padding: 40px 30px; min-height: 140px; }
        .cover h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
        .cover .sub { font-size: 12px; opacity: 0.85; }
        .cover .badge { display: inline-block; margin-top: 12px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 99px; font-size: 10px; }
        .section { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; }
        .section h2 { font-size: 13px; font-weight: 700; color: #0C447C; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
        .kpi-row { display: flex; gap: 16px; margin-bottom: 16px; }
        .kpi { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; text-align: center; }
        .kpi .val { font-size: 22px; font-weight: 800; color: #0C447C; }
        .kpi .lbl { font-size: 9px; color: #94a3b8; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; }
        th { background: #0C447C; color: #fff; padding: 6px 8px; text-align: left; font-size: 9px; }
        td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafc; }
        .prio-haute   { color: #dc2626; font-weight: 700; }
        .prio-moyenne { color: #d97706; font-weight: 700; }
        .prio-faible  { color: #16a34a; font-weight: 700; }
        .note-bar { display: inline-block; background: #e2e8f0; border-radius: 99px; width: 60px; height: 6px; vertical-align: middle; position: relative; overflow: hidden; }
        .note-fill { height: 100%; background: #1D9E75; border-radius: 99px; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 5px 20px; background: #f1f5f9; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>

<!-- Cover -->
<div class="cover">
    <div style="font-size:11px; opacity:0.7; margin-bottom:6px;">ANEAQ — Agence Nationale d'Evaluation et d'Assurance Qualité</div>
    <h1>Rapport d'évaluation</h1>
    <div class="sub">{{ $dossier->etablissement?->nom ?? $dossier->reference }}</div>
    <div class="sub" style="margin-top:4px;">Dossier : {{ $dossier->reference }}</div>
    <div class="badge">Généré le {{ now()->format('d/m/Y à H:i') }}</div>
</div>

<!-- KPIs -->
<div class="section">
    <h2>Synthèse</h2>
    <div class="kpi-row">
        <div class="kpi">
            <div class="val">{{ $evaluations->count() }}</div>
            <div class="lbl">Évaluations soumises</div>
        </div>
        <div class="kpi">
            <div class="val">{{ $rapports->count() }}</div>
            <div class="lbl">Rapports déposés</div>
        </div>
        <div class="kpi">
            <div class="val">{{ $rapports->where('statut','valide')->count() }}</div>
            <div class="lbl">Rapports validés</div>
        </div>
        <div class="kpi">
            <div class="val">{{ $recommandations->count() }}</div>
            <div class="lbl">Recommandations</div>
        </div>
        <div class="kpi">
            <div class="val" style="color:#dc2626">{{ $recommandations->where('priorite','haute')->count() }}</div>
            <div class="lbl">Priorité haute</div>
        </div>
    </div>
</div>

<!-- Notes moyennes par critère -->
@if($notesMoyennes->count() > 0)
<div class="section">
    <h2>Notes moyennes par critère</h2>
    <table>
        <thead>
            <tr>
                <th>Code</th>
                <th>Critère</th>
                <th>Note moyenne (/5)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($evaluations->unique('critere_id') as $eval)
            @php $moy = $notesMoyennes[$eval->critere_id] ?? 0; @endphp
            <tr>
                <td>{{ $eval->critere?->code ?? '—' }}</td>
                <td>{{ $eval->critere?->libelle ?? '—' }}</td>
                <td>
                    {{ $moy }}/5
                    <span class="note-bar"><span class="note-fill" style="width:{{ ($moy/5)*100 }}%"></span></span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<!-- Recommandations -->
@if($recommandations->count() > 0)
<div class="section page-break">
    <h2>Matrice des recommandations</h2>
    <table>
        <thead>
            <tr>
                <th style="width:8%">Code</th>
                <th style="width:18%">Critère</th>
                <th style="width:12%">Expert</th>
                <th style="width:20%">Recommandation</th>
                <th style="width:12%">Point fort</th>
                <th style="width:12%">Point faible</th>
                <th style="width:7%">Priorité</th>
                <th style="width:7%">Statut</th>
            </tr>
        </thead>
        <tbody>
            @foreach($recommandations as $r)
            <tr>
                <td>{{ $r->critere?->code ?? '—' }}</td>
                <td>{{ $r->critere?->libelle ?? '—' }}</td>
                <td>{{ $r->expert ? ($r->expert->prenom . ' ' . $r->expert->nom) : '—' }}</td>
                <td>{{ $r->recommandation ?? '—' }}</td>
                <td>{{ $r->point_fort ?? '—' }}</td>
                <td>{{ $r->point_faible ?? '—' }}</td>
                <td class="prio-{{ $r->priorite }}">{{ ucfirst($r->priorite ?? '—') }}</td>
                <td>{{ ucfirst($r->statut ?? '—') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<div class="footer">
    <span>ANEAQ — Document confidentiel — {{ $dossier->reference }}</span>
    <span>Page <span class="pagenum"></span></span>
</div>

</body>
</html>
