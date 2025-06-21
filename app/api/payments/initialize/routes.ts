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
    const { 
      userEmail,
      courseId,
      courseTitle,
      coursePrice,
      instructorId,
      platformFee,
      creatorAmount,
      subaccountCode
    } = await request.json();

    // Validate required fields
    if (!userEmail || !courseId || !coursePrice) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Default payment initialization payload
    let paymentData: any = {
      email: userEmail,
      amount: coursePrice * 100, // Convert to cents (Paystack's smallest currency unit)
      currency: "KES", // Specify Kenyan Shillings
      metadata: {
        courseId,
        userId: decodedToken.uid,
        courseTitle,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    };

    // If instructor has a subaccount, include split payment details
    if (subaccountCode) {
      // Add split payment details
      paymentData.subaccount = subaccountCode;
      
      // Alternatively, you can use transaction_charge for flat fee instead of percentage
      // paymentData.transaction_charge = platformFee * 100; // Convert to cents
      
      // Specify who bears the transaction fee (default is account)
      // paymentData.bearer = "subaccount"; // Optional: make instructor bear the transaction fee
    }

    // Call Paystack API to initialize transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { message: data.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    // Return the authorization URL
    return NextResponse.json({
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}