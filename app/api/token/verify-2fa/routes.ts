import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import speakeasy from "speakeasy";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { secret, token: verificationToken } = body;

    if (!secret || !verificationToken) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: verificationToken,
      window: 1 // Allow 1 step before and after for time sync issues
    });

    return NextResponse.json({ valid: verified });
  } catch (error) {
    console.error("Error verifying 2FA token:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}