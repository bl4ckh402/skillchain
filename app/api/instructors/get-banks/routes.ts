import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Call Paystack API to get Kenyan banks
    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) {
      return NextResponse.json(
        { message: "Paystack API key is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.paystack.co/bank?currency=KES", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch banks" },
        { status: 400 }
      );
    }

    // Return the banks list
    return NextResponse.json({
      status: true,
      data: data.data.map((bank: any) => ({
        code: bank.code,
        name: bank.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
