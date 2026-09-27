import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://www.novadiagnosticslab.com",
  "https://novadiagnosticslab.com",
  "http://localhost:3000",
]);
const FROM = "Nova Diagnostics <contact@novadiagnosticslab.com>";
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

function json(body: unknown, status: number, origin: string | null) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });
  if (origin && ALLOWED_ORIGINS.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json({ error: "forbidden" }, 403, origin);
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": origin ?? "https://www.novadiagnosticslab.com",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      },
    });
  }

  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

  try {
    const authorization = req.headers.get("Authorization") ?? "";
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return json({ error: "unauthorized" }, 401, origin);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase server credentials are not configured for send-staff-email");
      return json({ error: "email_not_configured" }, 500, origin);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: "unauthorized" }, 401, origin);

    const { data: staff, error: staffError } = await supabase
      .from("staff_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();
    if (staffError || !staff) return json({ error: "forbidden" }, 403, origin);

    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > 40_000) {
      return json({ error: "message_too_large" }, 413, origin);
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      return json({ error: "invalid_request" }, 400, origin);
    }
    if (!parsedPayload || typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
      return json({ error: "invalid_request" }, 400, origin);
    }

    const payload = parsedPayload as { to?: unknown; subject?: unknown; text?: unknown };
    const to = typeof payload.to === "string" ? payload.to.trim() : "";
    const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
    const text = typeof payload.text === "string" ? payload.text.trim() : "";
    if (
      to.length > 254 || !EMAIL_PATTERN.test(to) ||
      !subject || subject.length > 180 || /[\r\n]/.test(subject) ||
      !text || text.length > 12_000
    ) {
      return json({ error: "invalid_fields" }, 422, origin);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY secret not set for send-staff-email");
      return json({ error: "email_not_configured" }, 500, origin);
    }

    const sendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, text }),
    });

    if (!sendResponse.ok) {
      console.error("Resend rejected staff email with status", sendResponse.status);
      return json({ error: "send_failed" }, 502, origin);
    }

    const result = await sendResponse.json().catch(() => ({})) as { id?: string };
    if (!result.id) {
      console.error("Resend accepted staff email without returning a message id");
      return json({ error: "send_failed" }, 502, origin);
    }

    console.info("Staff email accepted", { staffUserId: user.id, providerMessageId: result.id });
    return json({ success: true }, 200, origin);
  } catch (error) {
    console.error("send-staff-email failed", error instanceof Error ? error.name : "unknown_error");
    return json({ error: "send_failed" }, 500, origin);
  }
});
