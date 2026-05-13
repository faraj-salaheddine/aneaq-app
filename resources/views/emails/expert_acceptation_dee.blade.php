<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Expert a accepté – ANEAQ</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(12,68,124,.12);">

      <!-- Header green accent -->
      <tr>
        <td style="background:linear-gradient(135deg,#0C447C 0%,#1a6abf 100%);padding:32px 40px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.65);">ANEAQ — Espace DEE</p>
                <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">Notification — Acceptation expert</h1>
              </td>
              <td align="right">
                <span style="display:inline-block;padding:6px 16px;border-radius:30px;background:#1D9E75;color:#fff;font-size:12px;font-weight:700;">✓ Accepté</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:32px 40px;">
          <p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.7;">
            L'expert <strong style="color:#0C447C;">{{ $expertName }}</strong> a <strong style="color:#1D9E75;">accepté</strong> l'invitation pour le dossier suivant.
            <br>Son affectation est en attente de votre confirmation.
          </p>

          <!-- Info box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:14px;margin-bottom:24px;">
            <tr>
              <td style="padding:20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#166534;font-weight:600;width:40%;">Expert</td>
                    <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:800;">{{ $expertName }}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#166534;font-weight:600;">Email</td>
                    <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700;">{{ $expertEmail }}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#166534;font-weight:600;">Rôle</td>
                    <td style="padding:6px 0;font-size:13px;color:#0C447C;font-weight:800;">{{ $expertRole }}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#166534;font-weight:600;">Dossier</td>
                    <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:800;">{{ $dossierReference }}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 20px;font-size:14px;color:#4b5563;line-height:1.7;background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:14px 18px;">
            ⏳ <strong>Action requise :</strong> Rendez-vous sur la plateforme pour confirmer l'affectation de cet expert au dossier.
          </p>

          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#0C447C;border-radius:12px;box-shadow:0 4px 16px rgba(12,68,124,.3);">
                <a href="{{ $dossierUrl }}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;">
                  Confirmer l'affectation →
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:28px 0 0;font-size:14px;color:#6b7280;">
            Cordialement,<br>
            <strong style="color:#0C447C;">Système ANEAQ</strong>
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 40px;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Notification automatique — ANEAQ</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
