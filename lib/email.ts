// Handles sending email notifications for live sessions

import nodemailer from "nodemailer";

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
  const html = `
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
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@yourlms.com",
    to,
    subject,
    html,
  });
};

interface BookingConfirmationParams {
  to: string[];
  subject: string;
  bookingDetails: string;
}

export const sendBookingConfirmation = async ({
  to,
  subject,
  bookingDetails,
}: BookingConfirmationParams) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmation</h2>
      <p>${bookingDetails}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@yourlms.com",
    to,
    subject,
    html,
  });
};

/**
 * Generic email sender for plain text or HTML emails.
 * Use for 2FA, notifications, etc.
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}): Promise<void> {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Missing required email fields");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@yourlms.com",
    to,
    subject,
    text,
    html,
  });
}
