<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Accès à la plateforme ANEAQ</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:900px;margin:0 auto;padding:32px 24px;">

        <div style="font-size:12px;font-weight:800;letter-spacing:0.30em;color:#2563eb;text-transform:uppercase;margin-bottom:12px;">
            ANEAQ
        </div>

        <h1 style="margin:0 0 24px 0;font-size:26px;color:#0f172a;">
            Sélection à l’évaluation institutionnelle
        </h1>

        <div style="background:linear-gradient(135deg,#13255c,#223983);border-radius:24px;padding:34px 36px;color:white;">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#bfdbfe;">
                Notification officielle
            </div>

            <h2 style="margin:18px 0 0;font-size:30px;line-height:1.3;color:#ffffff;">
                Votre établissement a été sélectionné
            </h2>

            <p style="margin:22px 0 0;font-size:16px;line-height:1.8;color:#e0e7ff;">
                Bonjour, votre établissement
                <strong>{{ $etablissementName ?? 'Établissement' }}</strong>
                a été sélectionné dans le cadre de l’évaluation institutionnelle de l’ANEAQ.
            </p>
        </div>

        @if(!empty($messageLettre))
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;padding:28px 30px;margin-top:24px;">
                <div style="font-size:12px;font-weight:800;letter-spacing:0.20em;color:#2563eb;text-transform:uppercase;margin-bottom:14px;">
                    Message officiel DEE
                </div>

                <div style="font-size:16px;line-height:1.9;color:#334155;white-space:pre-line;">
                    {{ $messageLettre }}
                </div>
            </div>
        @else
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:24px;padding:20px 24px;margin-top:24px;">
                <div style="font-size:14px;line-height:1.7;color:#9a3412;">
                    Aucun message DEE n’a été saisi.
                </div>
            </div>
        @endif

        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;padding:28px 30px;margin-top:24px;">
            <h2 style="margin:0 0 22px 0;font-size:22px;color:#0f172a;">
                Informations de connexion
            </h2>

            <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:18px;padding:18px 22px;">
                <p style="margin:0 0 14px 0;font-size:15px;color:#334155;">
                    <strong>Email :</strong>
                    <a href="mailto:{{ $loginEmail ?? $email ?? '—' }}" style="color:#2563eb;text-decoration:underline;">
                        {{ $loginEmail ?? $email ?? '—' }}
                    </a>
                </p>

                <p style="margin:0 0 14px 0;font-size:15px;color:#334155;">
                    <strong>Mot de passe temporaire :</strong>
                    {{ $plainPassword ?? $password ?? '—' }}
                </p>

                @if(!empty($dossierReference))
                    <p style="margin:0 0 14px 0;font-size:15px;color:#334155;">
                        <strong>Référence du dossier :</strong>
                        {{ $dossierReference }}
                    </p>
                @endif

                @if(!empty($campaignReference))
                    <p style="margin:0;font-size:15px;color:#334155;">
                        <strong>Référence de la vague :</strong>
                        {{ $campaignReference }}
                    </p>
                @endif
            </div>

            <p style="margin:28px 0 0;font-size:16px;line-height:1.8;color:#334155;">
                Nous vous invitons à vous connecter à la plateforme et à modifier votre mot de passe après la première connexion.
                Vous pourrez ensuite compléter le premier formulaire, renseigner le responsable du comité d’autoévaluation
                et déposer les annexes demandées.
            </p>

            <p style="margin:28px 0 0;font-size:14px;line-height:1.8;color:#64748b;">
                Cordialement,<br>
                Division de l’Évaluation des Établissements - ANEAQ
            </p>
        </div>

        <div style="background:#0f1f4d;color:white;border-radius:0 0 24px 24px;margin-top:24px;padding:24px;text-align:center;">
            <div style="font-size:20px;font-weight:800;">
                ANEAQ
            </div>

            <div style="font-size:12px;margin-top:10px;color:#dbeafe;">
                Agence Nationale d’Évaluation et d’Assurance Qualité de l’Enseignement Supérieur et de la Recherche Scientifique.
            </div>
        </div>
    </div>
</body>
</html>