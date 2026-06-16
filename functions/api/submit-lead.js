/**
 * Farwin Beauty — Cloudflare Pages Serverless Function
 * Route: POST /api/submit-lead
 *
 * This function receives partner lead data from the website form,
 * validates it, and returns a success response.
 *
 * Ready to extend: connect to Supabase, Google Sheets webhook,
 * or email service (Resend/Mailgun) by adding API calls below.
 */

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { name, phone, email, state = '', message = '' } = body;

  // Validate required fields
  if (!name || !phone || !email) {
    return new Response(
      JSON.stringify({ success: false, error: 'Nama, telefon, dan emel diperlukan.' }),
      { status: 422, headers: corsHeaders }
    );
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Format emel tidak sah.' }),
      { status: 422, headers: corsHeaders }
    );
  }

  // ── Future: Send to webhook / email / database ──
  // Example (Slack webhook):
  // await fetch(context.env.SLACK_WEBHOOK_URL, {
  //   method: 'POST',
  //   body: JSON.stringify({ text: `New Farwin Lead!\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nState: ${state}` }),
  // });

  // Log for Cloudflare dashboard visibility
  console.log('New Farwin Partner Lead:', { name, phone, email, state, message, timestamp: new Date().toISOString() });

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Permohonan anda telah diterima. Pasukan kami akan menghubungi anda dalam masa 24 jam.',
    }),
    { status: 200, headers: corsHeaders }
  );
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
