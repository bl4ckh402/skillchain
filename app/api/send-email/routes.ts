// import { type NextRequest, NextResponse } from "next/server";

// export async function POST(request: NextRequest) {
//   try {
//     const { to, subject, html } = await request.json();

//     // Example using Resend (replace with your preferred email service)
//     const resendApiKey = "re_dummy_1234567890abcdef";

//     // For demo purposes, simulate successful email sending
//     console.log("Demo: Email would be sent to:", to);
//     console.log("Demo: Subject:", subject);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Email sending error:", error);
//     return NextResponse.json(
//       { error: "Failed to send email" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { to, subject, text, html } = await req.json();

    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL as string,
      subject,
      text,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
