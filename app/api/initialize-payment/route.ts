import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request:any) {
  try {
    const {
      courseId,
      userId,
      userEmail,
      courseTitle,
      coursePrice,
      instructorId,
      platformFee,
      creatorAmount
    } = await request.json();

    // Validate request data
    if (!courseId || !userId || !userEmail || !courseTitle || !coursePrice) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Amount needs to be in kobo (smallest currency unit)
    const amountInCents = Math.round(coursePrice * 100 *130); // Assuming coursePrice is in USD

    // Prepare metadata for tracking purpose
    const metadata = {
      courseId,
      userId,
      instructorId,
      platformFee,
      creatorAmount
    };

    // For split payments (if you have subaccounts set up)
    // You would need to have created a subaccount for the instructor 
    // and stored the subaccount ID in your database
    let splitConfig = {};
    
    // If you have subaccount set up, uncomment this
    /*
    splitConfig = {
      subaccount: "ACCT_xxxxxxxxxxxx", // Instructor's subaccount code
      transaction_charge: Math.round(platformFee * 100), // Platform fee in kobo
      bearer_type: "account" // Platform bears Paystack fees
    };
    */

    // Initialize transaction with Paystack
    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.paystack.co/transaction/initialize',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        data: {
          email: userEmail,
          amount: amountInCents,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          metadata: JSON.stringify(metadata),
          ...splitConfig
        }
      });

      // Extract the needed data from Paystack response
      const { reference, authorization_url } = response.data.data;

      return NextResponse.json({
        reference,
        authorizationUrl: authorization_url
      });
    } catch (error:any) {
      console.error('Paystack API error:', error.response?.data || error.message);
      return NextResponse.json(
        { message: error.response?.data?.message || 'Payment initialization failed' },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error:any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}