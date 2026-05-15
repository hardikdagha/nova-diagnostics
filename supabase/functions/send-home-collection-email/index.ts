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

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
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
    const { requestId } = await req.json();
    if (!requestId) return json({ error: "missing_fields" }, 400, cors);

    // ── 3. Fetch home collection request ──────────────────────────────────
    const { data: hcr, error: fetchErr } = await supabase
      .from("home_collection_requests")
      .select("id, full_name, email, mobile, confirmed_date, confirmed_time_slot, confirmed_address, confirmed_test_package, fasting_instructions, patient_instructions")
      .eq("id", requestId)
      .maybeSingle();

    if (fetchErr || !hcr) return json({ error: "not_found" }, 404, cors);
    if (!hcr.email) return json({ error: "no_email" }, 422, cors);

    // ── 4. Resend API key ──────────────────────────────────────────────────
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY secret not set");
      return json({ error: "email_not_configured" }, 500, cors);
    }

    // ── 5. Build email bodies ──────────────────────────────────────────────
    const name = hcr.full_name ?? "Patient";
    const date = fmtDate(hcr.confirmed_date);
    const time = hcr.confirmed_time_slot ?? "—";
    const address = hcr.confirmed_address ?? "—";
    const tests = hcr.confirmed_test_package ?? "—";
    const fasting = hcr.fasting_instructions ?? null;
    const instructions = hcr.patient_instructions ?? null;

    const detailsRows = [
      { label: "Date", value: date },
      { label: "Time Slot", value: time },
      { label: "Collection Address", value: address },
      { label: "Tests / Package", value: tests },
      ...(fasting ? [{ label: "Fasting Instructions", value: fasting }] : []),
      ...(instructions ? [{ label: "Additional Instructions", value: instructions }] : []),
    ];

    const detailsHtml = detailsRows.map(({ label, value }) =>
      `<tr>
        <td style="padding:10px 20px;color:#64748b;font-size:13px;font-weight:600;width:40%;vertical-align:top;">${label}</td>
        <td style="padding:10px 20px;color:#0f172a;font-size:13px;vertical-align:top;">${value}</td>
      </tr>`
    ).join("\n");

    const detailsText = detailsRows.map(({ label, value }) => `${label}: ${value}`).join("\n");

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
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:600;">Home Collection Appointment</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:32px 36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <p style="margin:0 0 20px;color:#1e293b;font-size:15px;">Dear <strong>${name}</strong>,</p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;">Your home sample collection appointment has been confirmed. Please find the details below:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;border-collapse:collapse;">
              ${detailsHtml}
            </table>
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 20px;margin-bottom:28px;">
              <p style="margin:0;color:#92400e;font-size:13px;">&#9200; Please be available at the given address <strong>10 minutes before</strong> your scheduled time slot.</p>
            </div>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;">
            <p style="margin:0;color:#64748b;font-size:13px;">For any changes or assistance, please contact us at <strong>+91 8433706778</strong> (Call / WhatsApp).</p>
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
      `Dear ${name},\n\nYour home sample collection appointment has been confirmed.\n\n${detailsText}\n\nPlease be available at the given address 10 minutes before your scheduled time.\n\nFor assistance, contact +91 8433706778.\n\nRegards,\nNova Diagnostics`;

    // ── 6. Send via Resend ─────────────────────────────────────────────────
    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Nova Diagnostics <contact@novadiagnosticslab.com>",
        to: [hcr.email],
        subject: "Your Home Collection Appointment — Nova Diagnostics",
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      console.error("Resend API error:", sendRes.status, errText);
      // Record the error in DB
      await supabase
        .from("home_collection_requests")
        .update({ appointment_email_last_error: `Resend ${sendRes.status}: ${errText}` })
        .eq("id", requestId);
      return json({ error: "send_failed", detail: errText }, 500, cors);
    }

    const result = await sendRes.json();
    console.log(`Appointment email sent to ${hcr.email} for request ${requestId}, id:`, result.id);

    // ── 7. Update sent timestamp + clear any prior error ──────────────────
    await supabase
      .from("home_collection_requests")
      .update({
        appointment_email_sent_at: new Date().toISOString(),
        appointment_email_sent_by: user.id,
        appointment_email_last_error: null,
      })
      .eq("id", requestId);

    return json({ success: true, id: result.id }, 200, cors);

  } catch (err) {
    console.error("send-home-collection-email unhandled error:", err);
    return json({ error: "send_failed", detail: String(err) }, 500, corsHeaders(null));
  }
});
