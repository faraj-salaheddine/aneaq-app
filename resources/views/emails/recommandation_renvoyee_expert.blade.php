<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Recommandation à réviser</title></head>
<body style="font-family:Arial,sans-serif;background:#f5f7fb;padding:30px;margin:0;">
<div style="max-width:620px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(90deg,#d97706,#f59e0b);color:white;padding:24px 28px;">
        <h1 style="margin:0;font-size:20px;">⚠️ Recommandation à réviser</h1>
        <p style="margin:6px 0 0;opacity:.9;font-size:13px;">Dossier {{ $dossierReference }}</p>
    </div>
    <div style="padding:28px 32px;">
        <p style="font-size:15px;color:#374151;margin:0 0 20px;">Bonjour <strong>{{ $expertName }}</strong>,</p>
        <p style="font-size:14px;color:#64748b;">La DEE vous demande de réviser la recommandation suivante :</p>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:10px;padding:16px 20px;margin:16px 0;">
            <p style="font-size:13px;color:#92400e;margin:0;font-style:italic;">{{ $recommandation }}</p>
        </div>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #ef4444;border-radius:10px;padding:16px 20px;margin:16px 0 24px;">
            <p style="font-size:12px;font-weight:700;color:#991b1b;margin:0 0 6px;text-transform:uppercase;letter-spacing:.05em;">Commentaire DEE</p>
            <p style="font-size:14px;color:#374151;margin:0;">{{ $commentaireDee }}</p>
        </div>
        <div style="text-align:center;margin-bottom:24px;">
            <a href="{{ $platformUrl }}" style="display:inline-block;background:#d97706;color:white;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;">
                Réviser sur la plateforme →
            </a>
        </div>
    </div>
    <div style="background:#f8fafc;padding:14px 32px;border-top:1px solid #e5e7eb;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">© {{ date('Y') }} <strong>ANEAQ</strong></p>
    </div>
</div>
</body>
</html>
