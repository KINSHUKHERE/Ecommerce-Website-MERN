const { Resend } = require("resend");

// Initialize Resend with key from environment, or use a dummy key fallback to prevent constructor crash if not defined
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

const sendEmail = async (options) => {
  const { email, subject, text, html } = options;

  // Fallback to Console logging during development if no Resend API key is provided
  if (!process.env.RESEND_API_KEY) {
    console.log("\n=================== 📨 EMAIL DISPATCH (DEV FALLBACK) ===================");
    console.log(`To:      ${email}`);
    console.log(`Subject: ${subject}`);
    console.log("------------------------------------------------------------------------");
    console.log(text);
    console.log("========================================================================\n");
    return;
  }

  // Call the send method and handle the { data, error } response directly without try/catch
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: email,
    subject: subject,
    text: text,
    html: html,
  });

  if (error) {
    console.error("[Resend API] Error sending email:", error);
    return;
  }

  console.log(`[Resend API] Email successfully dispatched. ID:`, data.id);
};

module.exports = sendEmail;
