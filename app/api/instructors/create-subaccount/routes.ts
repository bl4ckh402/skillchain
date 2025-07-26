import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const { businessName, bankCode, accountNumber, percentageCharge } = await request.json();

    // Validate request
    if (!businessName || !bankCode || !accountNumber) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate platform percentage (100 - instructor percentage)
    const platformPercentage = Math.min(Math.max(percentageCharge || 30, 0), 100);

    // Call Paystack API to create subaccount
    const response = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name: businessName,
        bank_code: bankCode,
        account_number: accountNumber,
        percentage_charge: platformPercentage,
        currency: "KES", // Specify Kenyan Shillings
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { message: data.message || "Failed to create subaccount" },
        { status: 400 }
      );
    }

    // Return the subaccount code
    return NextResponse.json({
      message: "Subaccount created successfully",
      subaccountCode: data.data.subaccount_code,
    });
  } catch (error) {
    console.error("Error creating subaccount:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}