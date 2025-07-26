import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Extract authorization token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get reference from query params
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { message: "Reference is required" },
        { status: 400 }
      );
    }

    // Call Paystack API to verify transaction
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { message: data.message || "Failed to verify payment" },
        { status: 400 }
      );
    }

    // Extract courseId from metadata
    const courseId = data.data?.metadata?.courseId;

    // Return the verification result
    return NextResponse.json({
      status: data.data.status,
      courseId,
      data: {
        reference: data.data.reference,
        amount: data.data.amount / 100, // Convert from cents to KES
        status: data.data.status,
        currency: data.data.currency, // Should be "KES"
        paidAt: data.data.paid_at,
        channel: data.data.channel,
        metadata: data.data.metadata,
        // Include split info if available
        split: data.data.split ? {
          subaccountCode: data.data.split.subaccount_code,
          subaccountAmount: data.data.split.subaccount / 100,
          platformAmount: data.data.split.platform / 100,
        } : null,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}