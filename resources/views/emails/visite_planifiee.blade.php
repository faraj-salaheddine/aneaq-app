<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Date de visite planifiée</title></head>
<body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:30px;margin:0;">
<div style="max-width:620px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(90deg,#0C447C,#7c3aed);color:white;padding:24px 28px;">
        <h1 style="margin:0;font-size:20px;">📅 Date de visite planifiée</h1>
        <p style="margin:6px 0 0;opacity:.9;font-size:13px;">Dossier {{ $dossierReference }}</p>
    </div>
    <div style="padding:28px 32px;">
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">Bonjour <strong>{{ $destinataireNom }}</strong>,</p>
        <p style="font-size:14px;color:#64748b;margin:0 0 20px;">
            La DEE a planifié une date de visite pour le dossier <strong>{{ $dossierReference }}</strong>.
        </p>
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-left:4px solid #7c3aed;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
            <p style="font-size:13px;color:#5b21b6;margin:0 0 6px;font-weight:700;">📅 Date de visite</p>
            <p style="font-size:18px;color:#4c1d95;margin:0;font-weight:800;">{{ $dateVisite }}</p>
        </div>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
            <p style="font-size:13px;color:#92400e;margin:0;">
                ⚠️ Veuillez vous connecter à la plateforme pour <strong>accepter ou refuser</strong> cette date de visite.
                En cas de refus, merci de préciser le motif via la messagerie du dossier.
            </p>
        </div>
        <div style="text-align:center;margin-bottom:24px;">
            <a href="{{ $platformUrl }}" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;">
                Répondre sur la plateforme →
            </a>
        </div>
    </div>
    <div style="background:#f8fafc;padding:14px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">© {{ date('Y') }} <strong>ANEAQ</strong> — Plateforme d'évaluation</p>
    </div>
</div>
</body>
</html>
