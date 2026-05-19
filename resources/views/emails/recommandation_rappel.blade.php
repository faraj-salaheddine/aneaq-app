<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rappel recommandations</title></head>
<body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:30px;margin:0;">
<div style="max-width:620px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(90deg,#7c3aed,#a855f7);color:white;padding:24px 28px;">
        <h1 style="margin:0;font-size:20px;">🔔 Rappel — Recommandations en attente</h1>
        <p style="margin:6px 0 0;opacity:.9;font-size:13px;">Dossier {{ $dossierReference }}</p>
    </div>
    <div style="padding:28px 32px;">
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">Bonjour <strong>{{ $etablissementNom }}</strong>,</p>

        @if($type === 'personnalise' && $messagePersonnalise)
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-left:4px solid #7c3aed;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
            <p style="font-size:12px;font-weight:700;color:#6d28d9;margin:0 0 8px;text-transform:uppercase;">Message de la DEE</p>
            <p style="font-size:14px;color:#374151;margin:0;line-height:1.6;">{{ $messagePersonnalise }}</p>
        </div>
        @else
        <p style="font-size:14px;color:#64748b;margin:0 0 20px;">
            Dans le cadre du suivi de votre dossier <strong>{{ $dossierReference }}</strong>, la DEE vous rappelle que
            <strong>{{ $nombreEnCours }} recommandation(s)</strong> sont toujours en attente de mise en œuvre.
        </p>
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
            <p style="font-size:13px;color:#6d28d9;margin:0;">
                Merci de mettre à jour vos délais de réalisation et de déposer les preuves correspondantes sur la plateforme ANEAQ.
            </p>
        </div>
        @endif

        <div style="text-align:center;margin-bottom:24px;">
            <a href="{{ $platformUrl }}" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;">
                Mettre à jour sur la plateforme →
            </a>
        </div>
    </div>
    <div style="background:#f8fafc;padding:14px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">© {{ date('Y') }} <strong>ANEAQ</strong></p>
    </div>
</div>
</body>
</html>
