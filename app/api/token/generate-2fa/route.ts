import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = decodedToken.email;
    const uid = decodedToken.uid;

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code and expiry in Firestore
    // Store code and expiry in Firestore
    await db.collection("users").doc(uid).set(
      {
        twoFactor: {
          code,
          expiresAt,
        },
      },
      { merge: true }
    );
    // Send code via email
    if (!email) {
      return NextResponse.json({ message: "Email not found in token" }, { status: 400 });
    }
    await sendEmail({
      to: email,
      subject: "Your SkillChain Verification Code",
      text: `Your verification code is: ${code}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error generating 2FA code:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
