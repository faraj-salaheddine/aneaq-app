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
                <li><strong>Votre rôle :</strong> {{ $expertRole }}</li>
            </ul>

            @if(!empty($committeeMembers))
                <div style="margin:24px 0; padding:18px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                    <h2 style="margin:0 0 6px; color:#0f172a; font-size:17px;">Composition du comité</h2>
                    <p style="margin:0 0 14px; color:#64748b; font-size:13px; line-height:1.5;">
                        Consultez les autres experts sélectionnés avant d’accepter ou de refuser votre participation.
                    </p>

                    @foreach($committeeMembers as $member)
                        <div style="padding:10px 0; border-top:1px solid #e2e8f0;">
                            <strong style="color:#0f172a; font-size:14px;">{{ $member['name'] }}</strong>
                            <div style="margin-top:3px; color:#64748b; font-size:12px;">
                                {{ $member['role'] }} · {{ $member['status'] }}
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif

            <p>Vos informations de connexion :</p>

            <ul>
                <li><strong>Email :</strong> {{ $loginEmail }}</li>
                @if($plainPassword)
                <li><strong>Mot de passe :</strong> {{ $plainPassword }}</li>
                @else
                <li><strong>Mot de passe :</strong> Utilisez votre mot de passe habituel ANEAQ.</li>
                @endif
            </ul>

            <p>Connectez-vous à votre espace expert pour consulter le groupe, puis accepter ou refuser l’invitation :</p>

            <p>
                <a href="{{ url('/expert/dashboard') }}" style="display:inline-block; background:#4f46e5; color:white; text-decoration:none; padding:12px 20px; border-radius:10px;">
                    Consulter mon invitation
                </a>
            </p>

            <p style="font-size:12px; color:#64748b;">
                Vous pouvez également
                <a href="{{ $confirmationUrl }}" style="color:#4f46e5;">confirmer directement votre participation</a>.
            </p>

            <p style="margin-top:30px;">
                Cordialement,<br>
                <strong>ANEAQ</strong>
            </p>
        </div>
    </div>
</body>
</html>
