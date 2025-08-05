"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, DollarSign } from "lucide-react"
import { initializePaystackPayment, generatePaymentReference } from "@/lib/paystack"
import { sendBookingConfirmation } from "@/lib/email"

interface PaymentCheckoutProps {
  instructor: {
    name: string
    paystackPublicKey: string
    paystackEmail: string
  }
  bookingDetails: {
    date: string
    time: string
    amount: number
  }
  clientEmail: string
  onPaymentSuccessAction: (reference: string) => void
}

export function PaymentCheckout({ instructor, bookingDetails, clientEmail, onPaymentSuccessAction }: PaymentCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(bookingDetails.amount)

  const handlePayment = async () => {
    if (!clientEmail) {
      alert("Please provide your email address")
      return
    }

    setIsProcessing(true)
    const reference = generatePaymentReference()

    try {
      initializePaystackPayment({
        email: clientEmail,
        amount: paymentAmount,
        reference,
        publicKey: instructor.paystackPublicKey,
        onSuccess: async (response: any) => {
          // Verify payment on backend
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reference: response.reference,
              instructorEmail: instructor.paystackEmail,
            }),
          })

          if (verifyResponse.ok) {
            // Send confirmation email
            await sendBookingConfirmation(clientEmail, instructor.name, bookingDetails)

            onPaymentSuccessAction(response.reference)
          }
          setIsProcessing(false)
        },
        onClose: () => {
          setIsProcessing(false)
        },
      })
    } catch (error) {
      console.error("Payment failed:", error)
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Instructor</Label>
          <p className="font-medium">{instructor.name}</p>
        </div>

        <div className="space-y-2">
          <Label>Appointment Details</Label>
          <div className="text-sm text-muted-foreground">
            <p>Date: {bookingDetails.date}</p>
            <p>Time: {bookingDetails.time}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₦)</Label>
          <div className="relative">
            <DollarSign className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="pl-10"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Total:</span>
            <span className="text-xl font-bold">₦{paymentAmount.toLocaleString()}</span>
          </div>

          <Button onClick={handlePayment} disabled={isProcessing || !clientEmail} className="w-full" size="lg">
            {isProcessing ? (
              <>
                <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay with Paystack
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

