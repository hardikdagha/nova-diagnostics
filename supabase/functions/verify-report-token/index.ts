import { createClient } from 'jsr:@supabase/supabase-js@2';

// Restrict CORS to known origins only — no wildcard
const ALLOWED_ORIGINS = [
  'https://www.novadiagnosticslab.com',
  'https://novadiagnosticslab.com',
  'http://localhost:3000',
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string') {
      return json({ error: 'invalid_token' }, 400, cors);
    }

    // Hash the raw token with SHA-256
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(token),
    );
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Look up report by token hash
    const { data: report, error } = await supabase
      .from('reports')
      .select('id, report_number, patient_name, test_name, report_date, status, revoked_at, expires_at, file_path, download_count, max_downloads')
      .eq('token_hash', tokenHash)
      .single();

    const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? null;
    const ua = req.headers.get('user-agent') ?? null;

    if (error || !report) {
      await supabase.from('report_access_logs').insert({
        action: 'failed',
        success: false,
        access_method: 'secure_link',
        ip_address: ip,
        user_agent: ua,
      });
      return json({ error: 'not_found' }, 404, cors);
    }

    // Check revoked
    if (report.revoked_at || report.status === 'revoked') {
      await logAccess(supabase, report.id, 'revoked', false, ip, ua, 'secure_link');
      return json({ error: 'revoked' }, 403, cors);
    }

    // Check expired
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      await logAccess(supabase, report.id, 'expired', false, ip, ua, 'secure_link');
      return json({ error: 'expired' }, 410, cors);
    }

    // Check max downloads
    if (report.max_downloads !== null && report.download_count >= report.max_downloads) {
      await logAccess(supabase, report.id, 'expired', false, ip, ua, 'secure_link');
      return json({ error: 'limit_reached' }, 410, cors);
    }

    // Determine action from query param: ?action=view or ?action=download
    const url = new URL(req.url);
    const action = url.searchParams.get('action') === 'download' ? 'download' : 'view_link';

    if (action === 'download') {
      // Generate signed URL (valid 8 minutes)
      const { data: signed, error: signedError } = await supabase.storage
        .from('reports')
        .createSignedUrl(report.file_path, 480);

      if (signedError || !signed) {
        return json({ error: 'storage_error' }, 500, cors);
      }

      // Increment download count
      await supabase
        .from('reports')
        .update({ download_count: report.download_count + 1 })
        .eq('id', report.id);

      await logAccess(supabase, report.id, 'download', true, ip, ua, 'secure_link');

      return json({ signedUrl: signed.signedUrl }, 200, cors);
    }

    // Just a view — return metadata only
    await logAccess(supabase, report.id, 'view_link', true, ip, ua, 'secure_link');

    return json({
      reportNumber: report.report_number,
      patientName: report.patient_name,
      testName: report.test_name,
      reportDate: report.report_date,
      status: report.status,
    }, 200, cors);

  } catch (err) {
    console.error('verify-report-token error:', err);
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
