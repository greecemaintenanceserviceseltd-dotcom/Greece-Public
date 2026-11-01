import nodemailer from "nodemailer";

export function emailStatus() {
  return {
    connected: Boolean(Netlify.env.get("SMTP_HOST") && Netlify.env.get("SMTP_USER") && Netlify.env.get("SMTP_PASS") && Netlify.env.get("EMAIL_FROM")),
    recipient: Netlify.env.get("CONTACT_EMAIL") || "greece.maintenance.servicese.ltd@gmail.com",
  };
}

export async function sendMail(to: string, subject: string, message: string, attachment?: { filename: string; content: Buffer }) {
  if (!emailStatus().connected) return false;
  const transport = nodemailer.createTransport({
    host: Netlify.env.get("SMTP_HOST"),
    port: Number(Netlify.env.get("SMTP_PORT") || 587),
    secure: Netlify.env.get("SMTP_SECURE") === "true",
    auth: { user: Netlify.env.get("SMTP_USER"), pass: Netlify.env.get("SMTP_PASS") },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
  });
  try {
    await transport.sendMail({ from: Netlify.env.get("EMAIL_FROM"), to, subject, text: message, attachments: attachment ? [attachment] : [] });
    return true;
  } catch {
    return false;
  } finally {
    transport.close();
  }
}
