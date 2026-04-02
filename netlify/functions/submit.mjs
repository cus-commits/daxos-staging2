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

    // METHOD 1: Log to Netlify function console
    console.log("=== NEW APPLICATION ===");
    console.log(JSON.stringify({ ...data, submitted_at: timestamp }, null, 2));
    console.log("=== END APPLICATION ===");
    methods.push("logged");

    // METHOD 2: Resend email to applications@daxos.capital
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const fields = Object.entries(data)
          .map(([k, v]) => "<b>" + k.replace(/_/g, " ").toUpperCase() + "</b>: " + (v || "N/A"))
          .join("<br><br>");
        const fromAddr = process.env.RESEND_FROM || "Daxos Apply <onboarding@resend.dev>";
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": "Bearer " + resendKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromAddr,
            to: process.env.RESEND_TO || "cus@daxos.capital",
            subject: "New Application: " + (data.company_name || "Unknown"),
            html: "<h2>New Daxos Capital Application</h2><br>" + fields + "<br><br><small>Submitted: " + timestamp + "</small>"
          })
        });
        if (r.ok) { emailSent = true; methods.push("resend"); }
        else { methods.push("resend-err:" + r.status); }
      } catch(e) { methods.push("resend-err:" + e.message); }
    }

    // METHOD 3: FormSubmit backup
    if (!emailSent) {
      try {
        const r = await fetch("https://formsubmit.co/ajax/applications@daxos.capital", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ ...data, _subject: "New Application: " + (data.company_name || ""), _template: "box" })
        });
        if (r.ok) { emailSent = true; methods.push("formsubmit"); }
      } catch(e) {}
    }

    // METHOD 4: Airtable — persistent database of all applications
    const airtableKey = process.env.AIRTABLE_API_KEY;
    const airtableBase = process.env.AIRTABLE_BASE_ID;
    const airtableTable = process.env.AIRTABLE_TABLE || "Applications";
    if (airtableKey && airtableBase) {
      try {
        const r = await fetch(`https://api.airtable.com/v0/${airtableBase}/${encodeURIComponent(airtableTable)}`, {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + airtableKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fields: {
              "Company Name": data.company_name || "",
              "Website": data.company_website || "",
              "Description": data.description || "",
              "Pitch Deck": data.pitch_deck || "",
              "Telegram": data.telegram || "",
              "Email": data.email || "",
              "Additional Info": data.additional_info || "",
              "Submitted": timestamp,
              "Status": "New"
            }
          })
        });
        if (r.ok) methods.push("airtable");
        else { const e = await r.text(); methods.push("airtable-err:" + r.status); }
      } catch(e) { methods.push("airtable-err:" + e.message); }
    }

    // METHOD 5: GitHub backup — save as JSON file in a repo
    const ghToken = process.env.GITHUB_TOKEN;
    const ghRepo = process.env.GITHUB_BACKUP_REPO || "cus-commits/daxos-applications";
    if (ghToken) {
      try {
        const date = timestamp.split("T")[0];
        const slug = (data.company_name || "unknown").toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 40);
        const path = `applications/${date}_${slug}.json`;
        const content = btoa(unescape(encodeURIComponent(JSON.stringify({ ...data, submitted_at: timestamp }, null, 2))));
        const r = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${path}`, {
          method: "PUT",
          headers: {
            "Authorization": "Bearer " + ghToken,
            "Content-Type": "application/json",
            "User-Agent": "daxos-apply"
          },
          body: JSON.stringify({
            message: "Application: " + (data.company_name || "Unknown") + " — " + date,
            content: content
          })
        });
        if (r.ok || r.status === 201) methods.push("github");
        else methods.push("github-err:" + r.status);
      } catch(e) { methods.push("github-err:" + e.message); }
    }

    // METHOD 6: Telegram bot
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      try {
        const lines = Object.entries(data)
          .map(([k, v]) => k.replace(/_/g, " ").toUpperCase() + ": " + (v || "N/A"));
        const msg = "NEW APPLICATION\n\n" + lines.join("\n") + "\n\nSubmitted: " + timestamp;
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
