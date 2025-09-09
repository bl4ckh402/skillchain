import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { email, uid } = await req.json();
    // Validate input
    if (!email || !uid) {
      return NextResponse.json(
        { error: "Missing email or uid" },
        { status: 400 }
      );
    }

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
      subject: "Verify your SkillChain account",
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("2FA email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
