import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TO_EMAIL = "jerishaanlin@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { name, email, opportunityType, company, message } = await req.json();

    if (!name || !email || !opportunityType || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0f1523;color:#e2e8f0;border-radius:12px;">
        <h2 style="color:#38bdf8;margin-top:0;">New Portfolio Contact</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#94a3b8;width:140px;vertical-align:top;">Name</td>
            <td style="padding:8px 0;font-weight:600;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Reply-to Email</td>
            <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#38bdf8;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Opportunity</td>
            <td style="padding:8px 0;">${opportunityType}</td>
          </tr>
          ${company ? `<tr><td style="padding:8px 0;color:#94a3b8;vertical-align:top;">Company</td><td style="padding:8px 0;">${company}</td></tr>` : ""}
        </table>
        <div style="margin-top:24px;padding:16px;background:rgba(56,189,248,0.08);border-left:3px solid #38bdf8;border-radius:4px;">
          <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">Message</p>
          <p style="margin:0;white-space:pre-wrap;line-height:1.6;">${message}</p>
        </div>
        <p style="margin-top:24px;font-size:12px;color:#475569;">Sent via your portfolio contact form</p>
      </div>
    `;

    // Resend free tier: both from and to must be the account owner's verified email
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[Portfolio] ${opportunityType} from ${name}${company ? ` — ${company}` : ""}`,
        html,
      }),
    });

    const body = await res.text();
    console.log("Resend status:", res.status, "body:", body);

    if (!res.ok) {
      let parsed: { message?: string; name?: string } = {};
      try { parsed = JSON.parse(body); } catch (_) { /* ignore */ }
      const detail = parsed.message || parsed.name || body;
      console.error("Resend error:", detail);
      return new Response(
        JSON.stringify({ error: detail }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
