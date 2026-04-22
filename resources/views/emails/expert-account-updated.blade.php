<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour de votre compte expert ANEAQ</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; color: #1e293b; }
        .wrapper { max-width: 600px; margin: 40px auto; }
        .header { background: linear-gradient(135deg, #0C447C, #1D9E75); padding: 40px 40px 60px; border-radius: 16px 16px 0 0; text-align: center; }
        .header h1 { color: #fff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
        .header p { color: rgba(255,255,255,0.75); font-size: 14px; margin-top: 6px; }
        .body { background: #fff; padding: 40px; margin-top: -20px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
        .text { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .info-box h3 { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 13px; color: #64748b; font-weight: 500; }
        .info-value { font-size: 13px; color: #0f172a; font-weight: 700; font-family: 'Courier New', monospace; background: #fff; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
        .password-value { color: #1D9E75; font-size: 15px; letter-spacing: 0.05em; }
        .warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 20px 0; }
        .warning-text { font-size: 13px; color: #92400e; line-height: 1.5; }
        .btn { display: block; text-align: center; background: linear-gradient(135deg, #0C447C, #1D9E75); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 700; margin: 28px 0; }
        .divider { height: 1px; background: #f1f5f9; margin: 24px 0; }
        .footer { text-align: center; padding: 24px 40px; }
        .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>Mise à jour de votre compte expert</h1>
            <p>Agence Nationale d'Évaluation et d'Assurance Qualité</p>
        </div>

        <div class="body">
            <p class="greeting">Bonjour {{ $expert->prenom }} {{ $expert->nom }},</p>

            <p class="text">
                Nous vous informons que les informations de votre compte expert sur la plateforme ANEAQ ont été mises à jour par un administrateur.
            </p>

            <div class="info-box">
                <h3>Vos informations mises à jour</h3>
                <div class="info-row">
                    <span class="info-label">Nom complet</span>
                    <span class="info-value">{{ $expert->nom }} {{ $expert->prenom }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Adresse email</span>
                    <span class="info-value">{{ $expert->email }}</span>
                </div>
                @if($expert->telephone)
                <div class="info-row">
                    <span class="info-label">Téléphone</span>
                    <span class="info-value">{{ $expert->telephone }}</span>
                </div>
                @endif
                @if($expert->specialite)
                <div class="info-row">
                    <span class="info-label">Spécialité</span>
                    <span class="info-value">{{ $expert->specialite }}</span>
                </div>
                @endif
                @if($expert->ville)
                <div class="info-row">
                    <span class="info-label">Ville</span>
                    <span class="info-value">{{ $expert->ville }}</span>
                </div>
                @endif
                @if($password)
                <div class="info-row">
                    <span class="info-label">Nouveau mot de passe</span>
                    <span class="info-value password-value">{{ $password }}</span>
                </div>
                @endif
            </div>

            @if($password)
            <div class="warning">
                <p class="warning-text">
                    ⚠️ <strong>Important :</strong> Votre mot de passe a été modifié. Utilisez le nouveau mot de passe ci-dessus pour vous connecter. Nous vous recommandons de le changer dès votre prochaine connexion.
                </p>
            </div>
            @else
            <div class="warning">
                <p class="warning-text">
                    ℹ️ <strong>Note :</strong> Si vous n'êtes pas à l'origine de ces modifications ou si vous avez des questions, veuillez contacter l'équipe DEE de l'ANEAQ.
                </p>
            </div>
            @endif

            <a href="{{ config('app.url') }}" class="btn">Accéder à la plateforme →</a>

            <div class="divider"></div>

            <p class="text" style="font-size: 13px; color: #94a3b8;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
            </p>
        </div>

        <div class="footer">
            <p>
                <strong>ANEAQ</strong> — 05 Avenue Abou Inane Hassan, Rabat — Maroc<br>
                <a href="http://www.aneaq.ma" style="color: #1D9E75;">www.aneaq.ma</a>
            </p>
        </div>
    </div>
</body>
</html>