// Handles sending email notifications for live sessions

import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailInviteParams {
  to: string[];
  subject: string;
  joinLink: string;
  customMessage?: string;
}

export const sendEmailInvite = async ({
  to,
  subject,
  joinLink,
  customMessage,
}: EmailInviteParams) => {
  if (!process.env.SENDGAPIRID_API_KEY) {
    console.warn("SendGrid API key not configured - skipping email send");
    return;
  }

  const msg = {
    to,
    from: process.env.EMAIL_FROM || "noreply@yourlms.com",
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">You're invited to a live session!</h2>
        ${customMessage ? `<p>${customMessage}</p>` : ""}
        <p>Click the button below to join the session:</p>
        <a href="${joinLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
                  color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Join Live Session
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${joinLink}</p>
        <p style="color: #6b7280; font-size: 0.875rem; margin-top: 20px;">
          This link will expire when the session ends.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};
