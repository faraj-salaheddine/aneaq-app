<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invitation Expert ANEAQ</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(12,68,124,.12);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0C447C 0%,#1a6abf 100%);padding:36px 40px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.65);">Agence Nationale d'Évaluation et d'Assurance Qualité</p>
                <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-.3px;">ANEAQ</h1>
              </td>
              <td align="right">
                <span style="display:inline-block;padding:6px 16px;border-radius:30px;background:rgba(255,255,255,.15);color:#fff;font-size:12px;font-weight:700;border:1px solid rgba(255,255,255,.25);">Invitation Expert</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 40px;">

          <p style="margin:0 0 20px;font-size:16px;color:#374151;">Bonjour <strong style="color:#0C447C;">{{ $expertName }}</strong>,</p>

          <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.7;">
            Vous avez été sélectionné(e) comme <strong>{{ $expertRole }}</strong> dans le cadre de la campagne d'évaluation ANEAQ.
          </p>

          <!-- Dossier info box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:28px;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.16em;color:#94a3b8;">Détails de la mission</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;width:40%;">Dossier</td>
                    <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:800;">{{ $dossierReference }}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;">Campagne</td>
                    <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:800;">{{ $campaignReference }}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;">Votre rôle</td>
                    <td style="padding:6px 0;font-size:13px;color:#0C447C;font-weight:800;">{{ $expertRole }}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Credentials box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:14px;margin-bottom:28px;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.16em;color:#3b82f6;">Vos identifiants de connexion</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#1e40af;font-weight:600;width:40%;">Email</td>
                    <td style="padding:6px 0;font-size:14px;color:#1e3a8a;font-weight:800;font-family:monospace;">{{ $loginEmail }}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#1e40af;font-weight:600;">Mot de passe</td>
                    <td style="padding:6px 0;font-size:14px;color:#1e3a8a;font-weight:800;font-family:monospace;">{{ $plainPassword }}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 10px;font-size:15px;color:#374151;line-height:1.6;">
            Connectez-vous à la plateforme ANEAQ pour <strong>accepter ou refuser</strong> cette invitation depuis votre espace expert.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr>
              <td style="background:#0C447C;border-radius:12px;box-shadow:0 4px 16px rgba(12,68,124,.3);">
                <a href="{{ $platformUrl }}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:.01em;">
                  Accéder à ma plateforme →
                </a>
              </td>
            </tr>
          </table>

          <!-- Info note -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;margin-top:8px;">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;line-height:1.6;">
                  ⚠️ Après votre acceptation, votre accès définitif au dossier sera confirmé par l'équipe DEE. Vous recevrez une notification dès que votre affectation sera validée.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:28px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
            Cordialement,<br>
            <strong style="color:#0C447C;">L'équipe DEE — ANEAQ</strong>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
            Cet email a été envoyé automatiquement par la plateforme ANEAQ. Ne pas répondre à cet email.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
