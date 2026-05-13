<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification ANEAQ</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; color: #1e293b; }
        .wrapper { max-width: 600px; margin: 40px auto; }
        .header { background: linear-gradient(135deg, #0C447C, #1D9E75); padding: 36px 40px 56px; border-radius: 16px 16px 0 0; text-align: center; }
        .header h1 { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .header p  { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 6px; }
        .body { background: #fff; padding: 40px; margin-top: -20px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 20px; }
        .notif-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0C447C; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
        .notif-type { font-size: 10px; font-weight: 700; color: #0C447C; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .notif-titre { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .notif-msg { font-size: 14px; color: #475569; line-height: 1.7; }
        .btn { display: block; text-align: center; background: linear-gradient(135deg, #0C447C, #1D9E75); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; margin: 28px 0; }
        .divider { height: 1px; background: #f1f5f9; margin: 24px 0; }
        .footer { text-align: center; padding: 20px 40px; }
        .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>🔔 Nouvelle notification</h1>
            <p>Plateforme ANEAQ — Espace Expert</p>
        </div>

        <div class="body">
            <p class="greeting">Bonjour {{ $expertName }},</p>

            <p style="font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 20px;">
                Vous avez reçu une nouvelle notification sur la plateforme ANEAQ.
            </p>

            <div class="notif-box">
                <div class="notif-type">{{ $type }}</div>
                <div class="notif-titre">{{ $titre }}</div>
                @if($message)
                    <div class="notif-msg">{{ $message }}</div>
                @endif
            </div>

            <a href="{{ $actionUrl ?? config('app.url') . '/expert/notifications' }}" class="btn">
                Voir mes notifications →
            </a>

            <div class="divider"></div>

            <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
                Cet email a été envoyé automatiquement suite à une activité sur votre compte expert ANEAQ.
                Merci de ne pas répondre directement à cet email.
            </p>
        </div>

        <div class="footer">
            <p>
                <strong>ANEAQ</strong> — Agence Nationale d'Évaluation et d'Assurance Qualité<br>
                <a href="http://www.aneaq.ma" style="color: #1D9E75;">www.aneaq.ma</a>
            </p>
        </div>
    </div>
</body>
</html>
