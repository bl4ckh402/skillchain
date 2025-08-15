"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { InstructorProfile } from "@/components/ui/instructor-profile";
import { CalendlyBooking } from "@/components/ui/calendly-booking";
import { PaymentCheckout } from "@/components/ui/payment-checkout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import type { Instructor } from "@/types";

export default function InstructorBookingPage() {
  const params = useParams();
  const instructorId = params.id as string;

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "profile" | "booking" | "payment" | "success"
  >("profile");
  const [clientEmail, setClientEmail] = useState("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInstructor();
  }, [instructorId]);

  const fetchInstructor = async () => {
    try {
      const response = await fetch(`/api/instructors/${instructorId}`);
      if (response.ok) {
        const data = await response.json();
        setInstructor(data);
      }
    } catch (error) {
      console.error("Failed to fetch instructor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingComplete = (eventData: any) => {
    setBookingDetails({
      date: eventData.event_start_time.split("T")[0],
      time: new Date(eventData.event_start_time).toLocaleTimeString(),
      amount: 1000, // Default amount - you can make this configurable
    });
    setCurrentStep("payment");
  };

  const handlePaymentSuccess = (reference: string) => {
    setPaymentReference(reference);
    setCurrentStep("success");
  };

  const resetBooking = () => {
    setCurrentStep("profile");
    setBookingDetails(null);
    setPaymentReference("");
    setClientEmail("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-xl font-bold">Instructor Not Found</h2>
            <p className="text-muted-foreground">
              The instructor you're looking for doesn't exist or has been
              removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container max-w-4xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-8">
          {currentStep !== "profile" && (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep("profile")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8 space-x-4">
            {["profile", "booking", "payment", "success"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    currentStep === step
                      ? "bg-primary text-primary-foreground"
                      : ["profile", "booking", "payment", "success"].indexOf(
                          currentStep
                        ) > index
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
                >
                  {["profile", "booking", "payment", "success"].indexOf(
                    currentStep
                  ) > index ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      ["profile", "booking", "payment", "success"].indexOf(
                        currentStep
                      ) > index
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center">
          {currentStep === "profile" && (
            <div className="space-y-8">
              <InstructorProfile instructor={instructor} />

              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle>Ready to Book?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="client-email">Your Email Address</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  <Button
                    onClick={() => setCurrentStep("booking")}
                    disabled={!clientEmail}
                    className="w-full"
                  >
                    Continue to Booking
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "booking" && (
            <CalendlyBooking
              calendlyUrl={instructor.calendlyUrl}
              onBookingComplete={handleBookingComplete} onBookingCompleteAction={function (eventData: any): void {
                throw new Error("Function not implemented.");
              } }            />
          )}

          {currentStep === "payment" && bookingDetails && (
            <PaymentCheckout
              instructor={{
                name: instructor.name,
                paystackPublicKey: instructor.paystackPublicKey,
                paystackEmail: instructor.paystackEmail,
              }}
              bookingDetails={bookingDetails}
              clientEmail={clientEmail}
              onPaymentSuccess={handlePaymentSuccess} onPaymentSuccessAction={function (reference: string): void {
                throw new Error("Function not implemented.");
              } }            />
          )}

          {currentStep === "success" && (
            <Card className="w-full max-w-md">
              <CardContent className="p-6 space-y-4 text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                <p className="text-muted-foreground">
                  Your appointment with {instructor.name} has been successfully
                  booked and paid for.
                </p>
                <div className="p-4 text-sm rounded-lg bg-gray-50">
                  <p>
                    <strong>Payment Reference:</strong> {paymentReference}
                  </p>
                  <p>
                    <strong>Date:</strong> {bookingDetails?.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {bookingDetails?.time}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to {clientEmail}
                </p>
                <Button onClick={resetBooking} className="w-full">
                  Book Another Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
