<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Notification ANEAQ</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f5f7fb; padding: 30px; margin: 0;">
    <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">

        {{-- Header --}}
        <div style="background: linear-gradient(90deg, #0C447C, #2563eb); color: white; padding: 24px 28px; display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">🔔</div>
            <div>
                <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Nouvelle notification</h1>
                <p style="margin: 4px 0 0; opacity: 0.85; font-size: 13px;">Plateforme ANEAQ — Espace Expert</p>
            </div>
        </div>

        {{-- Body --}}
        <div style="padding: 28px 32px;">
            <p style="font-size: 15px; color: #374151; margin: 0 0 20px;">
                Bonjour <strong>{{ $expertName }}</strong>,
            </p>

            {{-- Notification card --}}
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
                <p style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">{{ $titre }}</p>
                <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.6;">{{ $message }}</p>
            </div>

            <p style="font-size: 14px; color: #64748b; margin: 0 0 24px;">
                Connectez-vous à la plateforme ANEAQ pour consulter les détails et prendre les actions nécessaires.
            </p>

            {{-- CTA button --}}
            <div style="text-align: center; margin-bottom: 28px;">
                <a href="{{ $platformUrl }}"
                   style="display: inline-block; background: #0C447C; color: white; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em;">
                    Accéder à la plateforme →
                </a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 18px;">
                Si vous n'êtes pas concerné par ce message ou pensez l'avoir reçu par erreur, veuillez ignorer cet email.
            </p>
        </div>

        {{-- Footer --}}
        <div style="background: #f8fafc; padding: 14px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                © {{ date('Y') }} <strong>ANEAQ</strong> — Agence Nationale d'Évaluation et d'Assurance Qualité
            </p>
        </div>
    </div>
</body>
</html>
