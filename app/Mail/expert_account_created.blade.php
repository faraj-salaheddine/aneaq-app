<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Accès ANEAQ</title>
</head>
<body style="margin:0; padding:0; background:#f4f7fb; font-family:Arial, sans-serif; color:#0f172a;">
    <div style="max-width:720px; margin:0 auto; padding:32px;">
        <div style="background:#ffffff; border-radius:18px; padding:32px; border:1px solid #e2e8f0;">
            <h1 style="margin:0 0 16px; color:#1d4ed8; font-size:24px;">
                Accès à la plateforme ANEAQ
            </h1>

            <p style="font-size:15px; line-height:1.7;">
                Bonjour,
            </p>

            <p style="font-size:15px; line-height:1.7;">
                La Division de l’Évaluation des Établissements vous transmet vos accès à la plateforme ANEAQ
                pour le suivi de votre dossier d’évaluation.
            </p>

            <div style="margin:24px 0; padding:20px; border-radius:14px; background:#eff6ff;">
                <p style="margin:0 0 8px; font-size:14px;">
                    <strong>Établissement :</strong> {{ $etablissementName }}
                </p>

                <p style="margin:0 0 8px; font-size:14px;">
                    <strong>Vague :</strong> {{ $campaignReference }}
                </p>

                <p style="margin:0; font-size:14px;">
                    <strong>Dossier :</strong> {{ $dossierReference }}
                </p>
            </div>

            <div style="margin:24px 0; padding:20px; border-radius:14px; background:#f8fafc; border:1px solid #e2e8f0;">
                <p style="margin:0 0 10px; font-size:14px;">
                    <strong>Email :</strong> {{ $loginEmail }}
                </p>

                <p style="margin:0; font-size:14px;">
                    <strong>Mot de passe :</strong> {{ $plainPassword }}
                </p>
            </div>

            <p style="font-size:15px; line-height:1.7;">
                La lettre officielle de la DEE est jointe à cet email.
            </p>

            <p style="font-size:15px; line-height:1.7;">
                Cordialement,<br>
                <strong>Division de l’Évaluation des Établissements - ANEAQ</strong>
            </p>
        </div>
    </div>
</body>
</html>