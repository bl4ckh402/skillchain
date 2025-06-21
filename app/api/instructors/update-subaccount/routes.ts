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
    const { subaccountCode, businessName, bankCode, accountNumber, percentageCharge } = await request.json();

    // Validate request
    if (!subaccountCode) {
      return NextResponse.json(
        { message: "Missing subaccount code" },
        { status: 400 }
      );
    }

    // Prepare update payload
    const updatePayload: any = {};
    if (businessName) updatePayload.business_name = businessName;
    if (bankCode) updatePayload.bank_code = bankCode;
    if (accountNumber) updatePayload.account_number = accountNumber;
    if (percentageCharge !== undefined) {
      updatePayload.percentage_charge = Math.min(Math.max(percentageCharge, 0), 100);
    }

    // Call Paystack API to update subaccount
    const response = await fetch(`https://api.paystack.co/subaccount/${subaccountCode}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { message: data.message || "Failed to update subaccount" },
        { status: 400 }
      );
    }

    // Return success
    return NextResponse.json({
      message: "Subaccount updated successfully",
    });
  } catch (error) {
    console.error("Error updating subaccount:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}