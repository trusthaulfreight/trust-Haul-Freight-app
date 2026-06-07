import crypto from "crypto";

const BRAND_ORANGE = "#f97316";
const BRAND_DARK = "#172033";
const FROM_EMAIL = "noreply@trusthaulfreight.com";
const FROM_NAME = "TrustHaul Freight";
const SUPABASE_PROJECT_REF = "pffpcxvmeyztdjuuwsxv";
const SITE_URL = "https://trusthaulfreight.com";
const VERIFY_BASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/verify`;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function getHeader(headers, name) {
  const key = Object.keys(headers || {}).find(
    (headerName) => headerName.toLowerCase() === name.toLowerCase(),
  );
  return key ? headers[key] : undefined;
}

function getRawBody(event) {
  if (!event.body) return "";
  return event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
}

function getWebhookSecret() {
  const secret = process.env.SUPABASE_HOOK_SECRET || process.env.SEND_EMAIL_HOOK_SECRET;

  if (!secret) {
    throw new Error("Missing SUPABASE_HOOK_SECRET environment variable");
  }

  return secret.replace(/^v1,whsec_/, "");
}

function verifySupabaseWebhook(rawBody, headers) {
  const webhookId = getHeader(headers, "webhook-id");
  const webhookTimestamp = getHeader(headers, "webhook-timestamp");
  const webhookSignature = getHeader(headers, "webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    throw new Error("Missing Supabase webhook signature headers");
  }

  const timestamp = Number(webhookTimestamp);
  if (!Number.isFinite(timestamp)) {
    throw new Error("Invalid webhook timestamp");
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    throw new Error("Webhook timestamp is outside the allowed tolerance");
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const secretBytes = Buffer.from(getWebhookSecret(), "base64");
  const expectedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  const receivedSignatures = webhookSignature
    .split(" ")
    .flatMap((part) => part.split(","))
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^v1,/, ""));

  const expected = Buffer.from(expectedSignature);
  const matches = receivedSignatures.some((signature) => {
    const received = Buffer.from(signature);
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  });

  if (!matches) {
    throw new Error("Invalid Supabase webhook signature");
  }
}

function buildConfirmationUrl(emailData) {
  const actionType = emailData.email_action_type || "signup";
  const redirectTo = emailData.redirect_to || SITE_URL;

  if (!emailData.token_hash) {
    throw new Error("Missing Supabase token_hash in hook payload");
  }

  const params = new URLSearchParams({
    token_hash: emailData.token_hash,
    type: actionType,
    redirect_to: redirectTo,
  });

  return `${VERIFY_BASE_URL}?${params.toString()}`;
}

function subjectFor(actionType) {
  switch (actionType) {
    case "recovery":
      return "Reset your TrustHaul Freight password";
    case "magiclink":
      return "Your TrustHaul Freight sign-in link";
    case "email_change":
      return "Confirm your TrustHaul Freight email change";
    case "invite":
      return "You have been invited to TrustHaul Freight";
    case "signup":
    default:
      return "Confirm your TrustHaul Freight account";
  }
}

function headingFor(actionType) {
  switch (actionType) {
    case "recovery":
      return "Reset your password";
    case "magiclink":
      return "Sign in to TrustHaul Freight";
    case "email_change":
      return "Confirm your new email";
    case "invite":
      return "Accept your invitation";
    case "signup":
    default:
      return "Confirm your account";
  }
}

function buttonTextFor(actionType) {
  switch (actionType) {
    case "recovery":
      return "Reset password";
    case "magiclink":
      return "Sign in";
    case "email_change":
      return "Confirm email";
    case "invite":
      return "Accept invitation";
    case "signup":
    default:
      return "Confirm account";
  }
}

function emailHtml({ actionType, confirmationUrl }) {
  const heading = headingFor(actionType);
  const buttonText = buttonTextFor(actionType);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${heading}</title>
  </head>
  <body style="margin:0;background:#f6f7fb;color:${BRAND_DARK};font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:${BRAND_DARK};padding:28px 32px;text-align:left;">
                <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0;">TrustHaul Freight</div>
                <div style="color:#fdba74;font-size:14px;margin-top:6px;">Reliable freight connections, built for modern logistics.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${BRAND_DARK};">${heading}</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#344054;">Thanks for using TrustHaul Freight. Use the button below to continue securely.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:8px;background:${BRAND_ORANGE};">
                      <a href="${confirmationUrl}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;border-radius:8px;">${buttonText}</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:#667085;">If the button does not work, copy and paste this link into your browser:</p>
                <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.5;color:#475467;">${confirmationUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fff7ed;border-top:1px solid #fed7aa;color:#7c2d12;font-size:12px;line-height:1.5;">
                If you did not request this email, you can safely ignore it.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function emailText({ actionType, confirmationUrl }) {
  return `${headingFor(actionType)}\n\nThanks for using TrustHaul Freight. Open this secure link to continue:\n${confirmationUrl}\n\nIf you did not request this email, you can safely ignore it.`;
}

async function sendWithSendGrid({ to, subject, html, text }) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("Missing SENDGRID_API_KEY environment variable");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      reply_to: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
      tracking_settings: {
        click_tracking: { enable: false, enable_text: false },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid failed with ${response.status}: ${errorText}`);
  }
}

export async function handler(event) {
  if (event.httpMethod === "GET") {
    return json(200, {
      ok: true,
      function: "send-email",
      hasSendGridKey: Boolean(process.env.SENDGRID_API_KEY),
      hasSupabaseHookSecret: Boolean(process.env.SUPABASE_HOOK_SECRET),
    });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const rawBody = getRawBody(event);

  try {
    console.log("Supabase Send Email Hook received request");
    verifySupabaseWebhook(rawBody, event.headers);

    const payload = JSON.parse(rawBody);
    const { user, email_data: emailData } = payload;

    if (!user?.email || !emailData) {
      throw new Error("Invalid Supabase hook payload");
    }

    const actionType = emailData.email_action_type || "signup";
    const confirmationUrl = buildConfirmationUrl(emailData);

    console.log(`Sending ${actionType} email to ${user.email}`);

    await sendWithSendGrid({
      to: user.email,
      subject: subjectFor(actionType),
      html: emailHtml({ actionType, confirmationUrl }),
      text: emailText({ actionType, confirmationUrl }),
    });

    console.log(`SendGrid accepted ${actionType} email to ${user.email}`);

    return json(200, {});
  } catch (error) {
    console.error("Supabase Send Email Hook failed", error);
    return json(500, { error: error.message });
  }
}

