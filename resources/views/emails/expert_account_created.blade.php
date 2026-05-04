<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Accès expert ANEAQ</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f5f7fb; padding:30px;">
    <div style="max-width:700px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(90deg,#4338ca,#0ea5e9); color:white; padding:24px 28px;">
            <h1 style="margin:0; font-size:24px;">ANEAQ - Accès expert</h1>
            <p style="margin:8px 0 0 0; opacity:0.9;">Invitation à participer au dossier d’évaluation</p>
        </div>

        <div style="padding:28px;">
            <p>Bonjour <strong>{{ $expertName }}</strong>,</p>

            <p>Vous avez été affecté comme expert dans le cadre du dossier suivant :</p>

            <ul>
                <li><strong>Référence dossier :</strong> {{ $dossierReference }}</li>
                <li><strong>Campagne :</strong> {{ $campaignReference }}</li>
            </ul>

            <p>Vos informations de connexion :</p>

            <ul>
                <li><strong>Email :</strong> {{ $loginEmail }}</li>
                <li><strong>Mot de passe :</strong> {{ $plainPassword }}</li>
            </ul>

            <p>Cliquez sur le lien ci-dessous pour confirmer votre participation :</p>

            <p>
                <a href="{{ $confirmationUrl }}" style="display:inline-block; background:#4f46e5; color:white; text-decoration:none; padding:12px 20px; border-radius:10px;">
                    Confirmer ma participation
                </a>
            </p>

            <p style="margin-top:30px;">
                Cordialement,<br>
                <strong>ANEAQ</strong>
            </p>
        </div>
    </div>
</body>
</html>