import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { email, uid, firstName } = await req.json();
    // Validate input
    if (!email || !uid) {
      return NextResponse.json(
        { error: "Missing email or uid" },
        { status: 400 }
      );
    }
    console.log("Received in verify-2fa:", { email, uid });

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code and expiry in Firestore
    await setDoc(
      doc(db, "users", uid),
      {
        emailVerification: {
          code,
          expiresAt,
        },
      },
      { merge: true }
    );

    // Send email
    await sendEmail({
      to: email,
      subject: "Welcome to SkillChain! Verify your account",

      text: `Hi ${firstName ? " " + firstName : ""},

      
Welcome to SkillChain! We are excited to have you join our community.

Your verification code is: ${code}

Please enter this code to verify your account.

If you did not sign up for SkillChain, you can ignore this email.

Best regards,
The SkillChain Team
`,
      html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
            SkillChain
          </h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">
            Welcome to our community!
          </p>
        </div>
        
        <!-- Main Content -->
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 18px; margin: 0 0 24px 0; color: #374151;">
            Hi${firstName ? " " + firstName : ""},
          </p>
          
          <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px;">
            We're excited to have you join our community. To get started, please verify your account using the code below.
          </p>
          
          <!-- Verification Code Box -->
          <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 32px; text-align: center; margin: 32px 0;">
            <p style="margin: 0 0 12px 0; font-size: 16px; color: #374151; font-weight: 600;">
              Your verification code is:
            </p>
            <div style="font-size: 36px; font-weight: 800; color: #10b981; letter-spacing: 4px; font-family: 'Courier New', monospace; margin: 8px 0;">
              ${code}
            </div>
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">
              Enter this code to verify your account
            </p>
          </div>
          
          <p style="margin: 32px 0 0 0; color: #6b7280; font-size: 16px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          
          <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #374151; font-size: 16px;">
              Best regards,<br/>
              <span style="font-weight: 600; color: #10b981;">The SkillChain Team</span>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">
            If you did not sign up for SkillChain, you can safely ignore this email.
          </p>
          <p style="margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} SkillChain. All rights reserved.
          </p>
        </div>
      </div>
    `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("2FA email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
