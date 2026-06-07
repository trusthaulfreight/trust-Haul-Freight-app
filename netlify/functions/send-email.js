const https = require("https");
const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Verify Supabase webhook signature
  const secret = process.env.SUPABASE_HOOK_SECRET;
  const signature = event.headers["x-supabase-signature"] || "";
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(event.body)
    .digest("hex");
  if (hmac !== signature) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const payload = JSON.parse(event.body);
  const { user, email_data } = payload;
  const email = user.email;
  const actionType = email_data.email_action_type;
  const tokenHash = email_data.token_hash;
  const redirectTo = email_data.redirect_to || "https://trusthaulfreight.com";

  const confirmationURL = `https://pffpcxvmeyztdjuuwsxv.supabase.co/auth/v1/verify?token_hash=${tokenHash}&type=email&redirect_to=${redirectTo}`;

  let subject = "Confirm your TrustHaul Freight account";
  let heading = "Confirm your email address";
  let message = "Thanks for signing up! Click below to confirm your email address and activate your account.";
  let buttonText = "Confirm Email Address";
  let buttonUrl = confirmationURL;

  if (actionType === "recovery") {
    subject = "Reset your TrustHaul Freight password";
    heading = "Reset your password";
    message = "Click below to reset your password.";
    buttonText = "Reset Password";
  } else if (actionType === "invite") {
    subject = "You've been invited to TrustHaul Freight";
    heading = "You're invited!";
    message = "Click below to accept your invitation and create your account.";
    buttonText = "Accept Invitation";
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
            <tr>
              <td style="background-color:#f97316;padding:32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">🚛 TrustHaul Freight</h1>
                <p style="margin:8px 0 0;color:#ffffff;font-size:14px;">Connecting Verified Drivers with Shippers</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 32px;">
                <h2 style="margin:0 0 16px;color:#111827;">${heading}</h2>
                <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">${message}</p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding:8px 0 32px;">
                      <a href="${buttonUrl}" style="background-color:#f97316;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                        ${buttonText}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">If the button doesn't work, copy and paste this link:</p>
                <p style="margin:0;color:#f97316;font-size:12px;word-break:break-all;">${buttonUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
                <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 TrustHaul Freight LLC. All rights reserved.</p>
                <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">If you didn't request this email, you can safely ignore it.</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const emailData = JSON.stringify({
    personalizations: [{ to: [{ email }] }],
    from: { email: "noreply@trusthaulfreight.com", name: "TrustHaul Freight" },
    subject,
    content: [{ type: "text/html", value: htmlContent }],
    tracking_settings: {
      click_tracking: { enable: false },
      open_tracking: { enable: false }
    }
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: "api.sendgrid.com",
      path: "/v3/mail/send",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(emailData),
      },
    }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ statusCode: 200, body: JSON.stringify({ success: true }) });
      } else {
        resolve({ statusCode: res.statusCode, body: JSON.stringify({ error: "SendGrid error" }) });
      }
    });
    req.on("error", (e) => resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) }));
    req.write(emailData);
    req.end();
  });
};