<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur ANEAQ</title>
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
        .credentials { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .credentials h3 { font-size: 12px; font-weight: 700; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
        .credential-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .credential-row:last-child { border-bottom: none; }
        .credential-label { font-size: 13px; color: #64748b; font-weight: 500; }
        .credential-value { font-size: 13px; color: #0f172a; font-weight: 700; font-family: 'Courier New', monospace; background: #fff; padding: 4px 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
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
            <h1>Bienvenue sur la plateforme ANEAQ</h1>
            <p>Agence Nationale d'Évaluation et d'Assurance Qualité</p>
        </div>

        <div class="body">
            <p class="greeting">Bonjour {{ $expert->prenom }} {{ $expert->nom }},</p>

            <p class="text">
                Nous avons le plaisir de vous informer que votre compte expert a été créé avec succès sur la plateforme numérique de l'ANEAQ. Vous pouvez désormais accéder à votre espace personnel et consulter les dossiers qui vous sont assignés.
            </p>

            <div class="credentials">
                <h3>Vos identifiants de connexion</h3>
                <div class="credential-row">
                    <span class="credential-label">Adresse email</span>
                    <span class="credential-value">{{ $expert->email }}</span>
                </div>
                <div class="credential-row">
                    <span class="credential-label">Mot de passe</span>
                    <span class="credential-value password-value">{{ $password }}</span>
                </div>
            </div>

            <div class="warning">
                <p class="warning-text">
                    ⚠️ <strong>Important :</strong> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion. Ne partagez jamais vos identifiants avec des tiers.
                </p>
            </div>

            <p class="text">
                Si vous avez des questions ou rencontrez des difficultés pour accéder à votre compte, veuillez contacter l'équipe DEE de l'ANEAQ.
            </p>

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