export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") return new Response("OK", { headers });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers });

  try {
    const data = await req.json();
    const timestamp = new Date().toISOString();
    let emailSent = false;
    let methods = [];

    // METHOD 1: Log to function console (viewable in Netlify Functions logs)
    console.log("=== NEW APPLICATION ===");
    console.log(JSON.stringify({ ...data, submitted_at: timestamp }, null, 2));
    console.log("=== END APPLICATION ===");
    methods.push("logged");

    // METHOD 2: Try Resend (if API key is set via env var)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const fields = Object.entries(data)
          .map(([k, v]) => "<b>" + k.replace(/_/g, " ").toUpperCase() + "</b>: " + (v || "N/A"))
          .join("<br><br>");
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": "Bearer " + resendKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Daxos Apply <onboarding@resend.dev>",
            to: "cus@daxos.capital",
            subject: "New Application: " + (data.company_name || "Unknown"),
            html: "<h2>New Daxos Capital Application</h2><br>" + fields + "<br><br><small>Submitted: " + timestamp + "</small>"
          })
        });
        if (r.ok) { emailSent = true; methods.push("resend"); }
        else { const e = await r.text(); methods.push("resend-err:" + r.status); }
      } catch(e) { methods.push("resend-err:" + e.message); }
    }

    // METHOD 3: Try FormSubmit as backup
    if (!emailSent) {
      try {
        const r = await fetch("https://formsubmit.co/ajax/info@daxos.capital", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ ...data, _subject: "New Application: " + (data.company_name || ""), _template: "box" })
        });
        if (r.ok) { emailSent = true; methods.push("formsubmit"); }
      } catch(e) {}
    }

    // METHOD 4: Telegram bot (if configured via env vars)
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      try {
        const lines = Object.entries(data)
          .map(([k, v]) => k.replace(/_/g, " ").toUpperCase() + ": " + (v || "N/A"));
        const msg = "🚀 NEW APPLICATION\n\n" + lines.join("\n") + "\n\nSubmitted: " + timestamp;
        const r = await fetch("https://api.telegram.org/bot" + tgToken + "/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChat, text: msg })
        });
        if (r.ok) methods.push("telegram");
      } catch(e) {}
    }

    return new Response(JSON.stringify({ 
      success: true, emailSent, methods, message: "Application received"
    }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers });
  }
};

export const config = { path: "/api/submit" };
