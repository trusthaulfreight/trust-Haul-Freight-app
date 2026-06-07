const secret = process.env.SUPABASE_HOOK_SECRET;
const signature = event.headers["x-supabase-signature"] || "";
const hmac = crypto
  .createHmac("sha256", secret)
  .update(event.body)
  .digest("hex");
if (hmac !== signature) {
  return { statusCode: 401, body: "Unauthorized" };
}