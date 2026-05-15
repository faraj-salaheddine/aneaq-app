<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 10px; color: #1e293b; background: #fff; }
        .header { background: #0C447C; color: #fff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 16px; font-weight: 700; }
        .header .sub { font-size: 10px; opacity: 0.8; margin-top: 3px; }
        .meta { padding: 10px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; gap: 30px; }
        .meta span { font-size: 9px; color: #64748b; }
        .meta strong { color: #0f172a; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 0; }
        th { background: #1a5fa8; color: #fff; padding: 7px 8px; font-size: 9px; text-align: left; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
        td { padding: 6px 8px; font-size: 9px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafc; }
        .prio-haute   { color: #dc2626; font-weight: 700; }
        .prio-moyenne { color: #d97706; font-weight: 700; }
        .prio-faible  { color: #16a34a; font-weight: 700; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 6px 20px; background: #f1f5f9; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; }
        .no-data { padding: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>

<div class="header">
    <div>
        <div class="h1">ANEAQ — Matrice des recommandations</div>
        <div class="sub">Dossier {{ $dossier->reference }} · {{ $dossier->etablissement?->nom }}</div>
    </div>
    <div style="text-align:right; font-size:9px; opacity:0.8;">
        Généré le {{ now()->format('d/m/Y à H:i') }}
    </div>
</div>

<div class="meta">
    <div><span>Référence</span><br><strong>{{ $dossier->reference }}</strong></div>
    <div><span>Établissement</span><br><strong>{{ $dossier->etablissement?->nom ?? '—' }}</strong></div>
    <div><span>Statut dossier</span><br><strong>{{ ucfirst(str_replace('_', ' ', $dossier->statut)) }}</strong></div>
    <div><span>Total recommandations</span><br><strong>{{ $recommandations->count() }}</strong></div>
    <div><span>Priorité haute</span><br><strong style="color:#dc2626">{{ $recommandations->where('priorite','haute')->count() }}</strong></div>
</div>

@if($recommandations->isEmpty())
    <div class="no-data">Aucune recommandation enregistrée pour ce dossier.</div>
@else
<table>
    <thead>
        <tr>
            <th style="width:7%">Code</th>
            <th style="width:15%">Critère</th>
            <th style="width:10%">Expert</th>
            <th style="width:16%">Constat</th>
            <th style="width:12%">Point fort</th>
            <th style="width:12%">Point faible</th>
            <th style="width:18%">Recommandation</th>
            <th style="width:6%">Priorité</th>
            <th style="width:4%">Statut</th>
        </tr>
    </thead>
    <tbody>
        @foreach($recommandations as $r)
        <tr>
            <td>{{ $r->critere?->code ?? '—' }}</td>
            <td>{{ $r->critere?->libelle ?? '—' }}</td>
            <td>{{ $r->expert ? ($r->expert->prenom . ' ' . $r->expert->nom) : '—' }}</td>
            <td>{{ $r->constat ?? '—' }}</td>
            <td>{{ $r->point_fort ?? '—' }}</td>
            <td>{{ $r->point_faible ?? '—' }}</td>
            <td>{{ $r->recommandation ?? '—' }}</td>
            <td class="prio-{{ $r->priorite }}">{{ ucfirst($r->priorite ?? '—') }}</td>
            <td>{{ ucfirst($r->statut ?? '—') }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

<div class="footer">
    <span>ANEAQ — Confidentiel</span>
    <span>Page <span class="pagenum"></span></span>
</div>

</body>
</html>
