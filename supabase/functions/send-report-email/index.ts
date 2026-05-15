import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Restrict CORS to known origins only — no wildcard
// This function is called from the admin portal with an authenticated session.
const ALLOWED_ORIGINS = [
  "https://www.novadiagnosticslab.com",
  "https://novadiagnosticslab.com",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // ── 1. Auth: must be an active staff member ────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401, cors);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !user) return json({ error: "unauthorized" }, 401, cors);

    const { data: staffRow } = await supabase
      .from("staff_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();
    if (!staffRow) return json({ error: "forbidden" }, 403, cors);

    // ── 2. Validate payload ────────────────────────────────────────────────
    const { patientEmail, patientName, reportNumber, reportUrl } = await req.json();
    if (!patientEmail || !patientName || !reportNumber || !reportUrl) {
      return json({ error: "missing_fields" }, 400, cors);
    }

    // ── 3. Resend API key ──────────────────────────────────────────────────
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY secret not set");
      return json({ error: "email_not_configured" }, 500, cors);
    }

    // ── 4. Build email bodies ──────────────────────────────────────────────
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#061A33;border-radius:12px 12px 0 0;padding:28px 36px;">
            <p style="margin:0;color:#67e8f9;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">Nova Diagnostics</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:600;">Your report is ready</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:32px 36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <p style="margin:0 0 20px;color:#1e293b;font-size:15px;">Dear <strong>${patientName}</strong>,</p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;">Your diagnostic report from Nova Diagnostics is ready for download.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
              <tr>
                <td style="padding:14px 20px;">
                  <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Report No.</p>
                  <p style="margin:4px 0 0;color:#0f172a;font-size:16px;font-weight:700;">${reportNumber}</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <a href="${reportUrl}" style="display:inline-block;background:#061A33;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;">Download Report</a>
              </td></tr>
            </table>
            <p style="margin:0 0 4px;color:#94a3b8;font-size:12px;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin:0 0 28px;font-size:12px;color:#475569;word-break:break-all;">${reportUrl}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;">
            <p style="margin:0;color:#64748b;font-size:13px;">For assistance, contact us at <strong>+91 8433706778</strong>.</p>
            <p style="margin:8px 0 0;color:#64748b;font-size:13px;">Regards,<br><strong>Nova Diagnostics</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:16px 36px;">
            <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">Nova Diagnostics &middot; Daffodils CHS, Shop No. 27, Sector-14, Vashi, Navi Mumbai &middot; contact@novadiagnosticslab.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const textBody =
      `Dear ${patientName},\n\nYour Nova Diagnostics report is ready.\n\nReport No: ${reportNumber}\n\nDownload securely:\n${reportUrl}\n\nFor assistance, contact +91 8433706778.\n\nRegards,\nNova Diagnostics`;

    // ── 5. Send via Resend API (pure HTTP — works in edge runtime) ─────────
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Nova Diagnostics <contact@novadiagnosticslab.com>",
        to: [patientEmail],
        subject: `Your Nova Diagnostics Report — ${reportNumber}`,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      console.error("Resend API error:", sendRes.status, errText);
      return json({ error: "send_failed", detail: errText }, 500, cors);
    }

    const result = await sendRes.json();
    console.log(`Report email sent to ${patientEmail} for ${reportNumber}, id:`, result.id);
    return json({ success: true, id: result.id }, 200, cors);

  } catch (err) {
    console.error("send-report-email unhandled error:", err);
    return json({ error: "send_failed", detail: String(err) }, 500, corsHeaders(null));
  }
});
