import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();

    // Example using Resend (replace with your preferred email service)
    const resendApiKey = "re_dummy_1234567890abcdef";

    // For demo purposes, simulate successful email sending
    console.log("Demo: Email would be sent to:", to);
    console.log("Demo: Subject:", subject);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
