export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const data = await req.json();
    
    // Send via Netlify's built-in email (using a simple webhook approach)
    // Use EmailJS or similar - but simplest: forward to a webhook that emails
    // For now, store submissions and notify via a simple approach
    
    // Use Mailgun's free tier or similar
    // Actually, simplest reliable approach: use Netlify's own email notification
    // by posting to their internal form submission endpoint
    
    // Alternative: use resend.com free tier (100 emails/day)
    const RESEND_KEY = process.env.RESEND_API_KEY;
    
    if (RESEND_KEY) {
      const emailBody = Object.entries(data)
        .filter(([k]) => k !== 'access_key')
        .map(([k, v]) => `<b>${k.replace(/_/g, ' ').toUpperCase()}</b>: ${v || 'N/A'}`)
        .join('<br><br>');

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Daxos Capital <apply@daxos.capital>',
          to: 'info@daxos.capital',
          subject: `New Application: ${data.company_name || 'Unknown'}`,
          html: `<h2>New Daxos Capital Application</h2><br>${emailBody}`
        })
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};

export const config = { path: "/api/submit" };
