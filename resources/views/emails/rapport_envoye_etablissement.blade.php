<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rapport expert disponible</title></head>
<body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:30px;margin:0;">
<div style="max-width:620px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(90deg,#0C447C,#2563eb);color:white;padding:24px 28px;">
        <h1 style="margin:0;font-size:20px;">📄 Rapport d'évaluation disponible</h1>
        <p style="margin:6px 0 0;opacity:.9;font-size:13px;">Dossier {{ $dossierReference }}</p>
    </div>
    <div style="padding:28px 32px;">
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">Bonjour <strong>{{ $etablissementNom }}</strong>,</p>
        <p style="font-size:14px;color:#64748b;margin:0 0 20px;">
            La DEE vous a transmis le <strong>rapport final</strong> rédigé par <strong>{{ $expertNom }}</strong>
            concernant votre dossier <strong>{{ $dossierReference }}</strong>.
        </p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #2563eb;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
            <p style="font-size:13px;color:#1e40af;margin:0;">
                Vous pouvez consulter et télécharger ce rapport depuis votre espace établissement sur la plateforme ANEAQ.
            </p>
        </div>
        <div style="text-align:center;margin-bottom:24px;">
            <a href="{{ $platformUrl }}" style="display:inline-block;background:#0C447C;color:white;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:700;">
                Accéder à mon espace →
            </a>
        </div>
    </div>
    <div style="background:#f8fafc;padding:14px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">© {{ date('Y') }} <strong>ANEAQ</strong></p>
    </div>
</div>
</body>
</html>
