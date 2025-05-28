"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePayment } from "@/context/PaymentProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState("processing");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPayment } = usePayment();

  // Fix for the useEffect in PaymentSuccessPage
  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    // Use either reference or trxref, as Paystack might return either
    const paymentReference = reference || trxref;

    if (!paymentReference) {
      setStatus("error");
      setError("Invalid payment reference");
      return;
    }

    const verifyTransaction = async () => {
      try {
        const result = await verifyPayment(paymentReference);

        if (result && result.success) {
        setStatus("success");
        // Set the courseId returned from verifyPayment, fallback to null if undefined
        setCourseId(result.courseId ?? null);
        } else {
          setStatus("pending");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("error");
        setError(
          error instanceof Error ? error.message : "Failed to verify payment"
        );
      }
    };

    verifyTransaction();
  }, [searchParams, verifyPayment]);

  const handleGoToCourse = () => {
    if (courseId) {
      router.push(`/course/${courseId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="container max-w-md py-12 mx-auto">
      <Card>
        <CardHeader>
          {status === "success" ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-center">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-center">
                Your course enrollment is now complete
              </CardDescription>
            </>
          ) : status === "processing" ? (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-center">
                Processing Payment
              </CardTitle>
              <CardDescription className="text-center">
                Please wait while we confirm your payment...
              </CardDescription>
            </>
          ) : status === "pending" ? (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl text-center">
                Payment Pending
              </CardTitle>
              <CardDescription className="text-center">
                Your payment is being processed and will be confirmed shortly
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-center">
                Payment Error
              </CardTitle>
              <CardDescription className="text-center">
                {error || "There was an issue processing your payment"}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {status === "success" && (
            <p className="text-center text-muted-foreground">
              You now have full access to all course content. You can start
              learning right away!
            </p>
          )}

          {status === "pending" && (
            <p className="text-center text-muted-foreground">
              Your payment is currently being processed. This may take a few
              moments. Once confirmed, you'll have full access to the course.
            </p>
          )}

          {status === "error" && (
            <p className="text-center text-muted-foreground">
              We encountered an issue while processing your payment. Please
              contact support if you believe this is an error.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {status === "success" && (
            <Button className="w-full" onClick={handleGoToCourse}>
              Go to Course
            </Button>
          )}

          {status === "pending" && (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </Button>
          )}

          {status === "error" && (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
