import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

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

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `SkillChain:${decodedToken.email}`,
    });

    // Generate QR code
    if (!secret.otpauth_url) {
      return NextResponse.json({ message: "Failed to generate OTP URL" }, { status: 500 });
    }
    
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return NextResponse.json({
      secret: secret.base32,
      qrCodeUrl: qrCodeUrl,
    });
  } catch (error) {
    console.error("Error generating 2FA secret:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
