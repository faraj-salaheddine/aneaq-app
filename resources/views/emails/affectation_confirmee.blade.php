<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Affectation confirmée – ANEAQ</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(12,68,124,.12);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#0C447C 0%,#1D9E75 100%);padding:36px 40px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.65);">ANEAQ — Espace Expert</p>
                <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">Votre affectation est confirmée !</h1>
              </td>
              <td align="right">
                <span style="display:inline-block;padding:6px 16px;border-radius:30px;background:rgba(255,255,255,.2);color:#fff;font-size:12px;font-weight:700;border:1px solid rgba(255,255,255,.3);">✓ Confirmée</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#374151;">Bonjour <strong style="color:#0C447C;">{{ $expertName }}</strong>,</p>

          <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
            La DEE a <strong style="color:#1D9E75;">confirmé votre affectation</strong> au dossier d'évaluation. Vous avez maintenant accès à l'ensemble du dossier sur la plateforme.
          </p>

          <!-- Info box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;margin-bottom:28px;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.16em;color:#166534;">Détails de votre mission</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#166534;font-weight:600;width:40%;">Dossier</td>
                    <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:800;">{{ $dossierReference }}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#166534;font-weight:600;">Campagne</td>
                    <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:800;">{{ $campaignReference }}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#166534;font-weight:600;">Votre rôle</td>
                    <td style="padding:6px 0;font-size:13px;color:#0C447C;font-weight:800;">{{ $expertRole }}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
            Vous pouvez dès maintenant accéder au dossier, commencer l'évaluation quantitative et consulter les documents associés.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="background:#0C447C;border-radius:12px;box-shadow:0 4px 16px rgba(12,68,124,.3);">
                <a href="{{ $dossierUrl }}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;">
                  Accéder au dossier →
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
            Cordialement,<br>
            <strong style="color:#0C447C;">L'équipe DEE — ANEAQ</strong>
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Notification automatique — ANEAQ</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
