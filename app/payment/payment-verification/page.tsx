"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function PaymentVerificationPage() {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/jobs/payment/verify?reference=${reference}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        // Redirect to job posting page with success status
        router.push("/jobs/post?payment=success");
      } catch (error: any) {
        setError(error.message);
      } finally {
        setVerifying(false);
      }
    };

    if (reference) {
      verifyPayment();
    } else {
      setError("Payment reference not found");
      setVerifying(false);
    }
  }, [reference, router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {verifying ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
              <p className="text-lg font-medium">Verifying payment...</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 mx-auto text-red-600" />
              <p className="text-lg font-medium text-red-600">Payment Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => router.push("/jobs/post")}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
              <p className="text-lg font-medium text-green-600">Payment Successful</p>
              <Button onClick={() => router.push("/jobs/post")}>
                Continue to Job Posting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}