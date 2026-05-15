import { createClient } from 'jsr:@supabase/supabase-js@2';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://www.novadiagnosticslab.com',
  'https://novadiagnosticslab.com',
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

// Rate limiting constants
// Applied to failed attempts only — successful lookups never count against the limit.
const WINDOW_MINUTES = 15;
const MAX_FAILURES_PER_IP = 20;       // >20 failures from same IP in 15 min → block
const MAX_FAILURES_PER_NUMBER = 8;    // >8 failures for same report number in 15 min → block

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const { reportNumber, mobile } = await req.json();

    if (!reportNumber || !mobile) {
      return json({ error: 'not_found' }, 400, cors);
    }

    const normalizedMobile = String(mobile).replace(/\D/g, '').slice(-10);
    const normalizedNumber = String(reportNumber).trim().toUpperCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? null;
    const ua = req.headers.get('user-agent') ?? null;
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

    // ── Rate limit check ─────────────────────────────────────────────────────
    const [ipCountRes, numCountRes] = await Promise.all([
      ip
        ? supabase
            .from('report_access_logs')
            .select('id', { count: 'exact', head: true })
            .eq('action', 'fallback_lookup')
            .eq('success', false)
            .eq('ip_address', ip)
            .gte('created_at', windowStart)
        : Promise.resolve({ count: 0, error: null }),

      supabase
        .from('report_access_logs')
        .select('id', { count: 'exact', head: true })
        .eq('action', 'fallback_lookup')
        .eq('success', false)
        .eq('access_method', `fallback_form:${normalizedNumber}`)
        .gte('created_at', windowStart),
    ]);

    const ipFailures = (ipCountRes as { count: number | null }).count ?? 0;
    const numFailures = (numCountRes as { count: number | null }).count ?? 0;

    if (ipFailures >= MAX_FAILURES_PER_IP || numFailures >= MAX_FAILURES_PER_NUMBER) {
      await supabase.from('report_access_logs').insert({
        action: 'fallback_lookup',
        success: false,
        access_method: `fallback_form:${normalizedNumber}`,
        ip_address: ip,
        user_agent: ua,
      });
      return json(
        { error: 'not_found' },
        429,
        { ...cors, 'Retry-After': String(WINDOW_MINUTES * 60) },
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const { data: report, error } = await supabase
      .from('reports')
      .select('id, report_number, patient_name, patient_mobile, test_name, report_date, status, revoked_at, expires_at, file_path, download_count, max_downloads')
      .eq('report_number', normalizedNumber)
      .single();

    const genericError = { error: 'not_found' };

    if (error || !report) {
      await supabase.from('report_access_logs').insert({
        action: 'fallback_lookup',
        success: false,
        access_method: `fallback_form:${normalizedNumber}`,
        ip_address: ip,
        user_agent: ua,
      });
      return json(genericError, 404, cors);
    }

    const storedMobile = String(report.patient_mobile).replace(/\D/g, '').slice(-10);
    if (storedMobile !== normalizedMobile) {
      await logAccess(supabase, report.id, 'fallback_lookup', false, ip, ua, `fallback_form:${normalizedNumber}`);
      return json(genericError, 404, cors);
    }

    if (report.revoked_at || report.status === 'revoked') {
      await logAccess(supabase, report.id, 'revoked', false, ip, ua, `fallback_form:${normalizedNumber}`);
      return json({ error: 'revoked' }, 403, cors);
    }

    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      await logAccess(supabase, report.id, 'expired', false, ip, ua, `fallback_form:${normalizedNumber}`);
      return json({ error: 'expired' }, 410, cors);
    }

    if (report.max_downloads !== null && report.download_count >= report.max_downloads) {
      await logAccess(supabase, report.id, 'expired', false, ip, ua, `fallback_form:${normalizedNumber}`);
      return json({ error: 'limit_reached' }, 410, cors);
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from('reports')
      .createSignedUrl(report.file_path, 480);

    if (signedError || !signed) {
      return json({ error: 'server_error' }, 500, cors);
    }

    await supabase
      .from('reports')
      .update({ download_count: report.download_count + 1 })
      .eq('id', report.id);

    await logAccess(supabase, report.id, 'fallback_lookup', true, ip, ua, 'fallback_form');

    return json({
      reportNumber: report.report_number,
      patientName: report.patient_name,
      testName: report.test_name,
      reportDate: report.report_date,
      signedUrl: signed.signedUrl,
    }, 200, cors);

  } catch (err) {
    console.error('fallback-report-lookup error:', err);
    return json({ error: 'server_error' }, 500, corsHeaders(null));
  }
});

async function logAccess(
  supabase: ReturnType<typeof createClient>,
  reportId: string,
  action: string,
  success: boolean,
  ip: string | null,
  ua: string | null,
  method: string,
) {
  await supabase.from('report_access_logs').insert({
    report_id: reportId,
    action,
    success,
    access_method: method,
    ip_address: ip,
    user_agent: ua,
  });
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
