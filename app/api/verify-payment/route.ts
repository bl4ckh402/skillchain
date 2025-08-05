import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, increment } from 'firebase/firestore';

export async function GET(request: { url: string | URL; }) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { message: 'Missing reference parameter' },
        { status: 400 }
      );
    }

    // Verify the transaction with Paystack
    try {
      const response = await axios({
        method: 'get',
        url: `https://api.paystack.co/transaction/verify/${reference}`,
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if API call was successful
      if (!response.data.status) {
        return NextResponse.json(
          { message: 'Failed to verify payment with Paystack' },
          { status: 500 }
        );
      }

      // Get transaction data
      const transaction = response.data.data;
      
      // Extract courseId and userId from metadata
      const metadata = typeof transaction.metadata === 'string' 
        ? JSON.parse(transaction.metadata) 
        : transaction.metadata;
      
      const courseId = metadata?.courseId;
      const userId = metadata?.userId;
      const instructorId = metadata?.instructorId;
      const platformFee = metadata?.platformFee;
      const creatorAmount = metadata?.creatorAmount;

      // Check if payment was successful
      if (transaction.status === 'success') {
        // Create a payment record in Firestore
        const paymentsCollection = collection(db, 'payments');
        
        // First check if payment record already exists
        const paymentQuery = query(paymentsCollection, where('reference', '==', reference));
        const paymentSnapshot = await getDocs(paymentQuery);
        
        // Only create a new payment record if it doesn't exist
        if (paymentSnapshot.empty) {
          // Create a new payment record
          await addDoc(paymentsCollection, {
            reference,
            userId,
            courseId,
            instructorId,
            amount: transaction.amount / 100, // Convert from kobo to naira
            platformFee: platformFee || 0,
            creatorAmount: creatorAmount || 0,
            status: 'completed',
            method: 'paystack',
            paymentDate: new Date(transaction.paid_at),
            createdAt: new Date()
          });
          
          // Update instructor revenue stats
          if (instructorId) {
            const instructorStatsRef = doc(db, 'instructorStats', instructorId);
            const instructorStatsDoc = await getDoc(instructorStatsRef);
            
            if (instructorStatsDoc.exists()) {
              await updateDoc(instructorStatsRef, {
                totalRevenue: increment(creatorAmount || 0)
              });
            }
          }
        }

        // Return success with courseId to allow enrollment
        return NextResponse.json({
          status: 'success',
          courseId,
          userId,
          reference
        });
      } else {
        // Payment failed or is pending
        return NextResponse.json({
          status: transaction.status,
          courseId,
          userId,
          reference
        });
      }
    } catch (error: any) {
      console.error('Paystack API error:', error.response?.data || error.message);
      return NextResponse.json(
        { message: error.response?.data?.message || 'Payment verification failed' },
        { status: error.response?.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}