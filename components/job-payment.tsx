import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface JobPaymentProps {
  onPaymentComplete: () => void;
}

export function JobPayment({ onPaymentComplete }: JobPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const checkPaystackScript = () => {
      if (typeof window !== "undefined" && window.PaystackPop) {
        setPaystackReady(true);
        return;
      }

      const scriptCheck = setInterval(() => {
        if (typeof window !== "undefined" && window.PaystackPop) {
          setPaystackReady(true);
          clearInterval(scriptCheck);
        }
      }, 500);

      // Clear interval after 10 seconds
      setTimeout(() => clearInterval(scriptCheck), 10000);

      return () => clearInterval(scriptCheck);
    };

    checkPaystackScript();
  }, []);

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      if (!user?.email) {
        throw new Error("User email is required");
      }

      if (!paystackReady) {
        throw new Error("Payment system is still initializing");
      }

      const paystack = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: 1000 * 100, // Amount in kobo (10 USD * 100)
        currency: "KES",
        channels: [
          "card",
          "bank",
          "ussd",
          "qr",
          "mobile_money",
          "bank_transfer",
        ],
        ref: `job_${new Date().getTime()}_${Math.floor(
          Math.random() * 1000000
        )}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Payment Type",
              variable_name: "payment_type",
              value: "job_posting",
            },
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user.uid,
            },
          ],
        },
        callback: async function (response: any) {
          console.log("Payment callback:", response);
          try {
            const verifyResponse = await fetch(
              `/api/verify-payment?reference=${response.reference}`
            );
            const verifyData = await verifyResponse.json();

            if (verifyData.status === "success") {
              toast({
                title: "Payment Successful",
                description: "Your job posting payment has been confirmed",
              });
              onPaymentComplete();
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast({
              title: "Verification Failed",
              description:
                "Please contact support with your reference: " +
                response.reference,
              variant: "destructive",
            });
          }
        },
        onClose: function () {
          setIsLoading(false);
          toast({
            title: "Payment Cancelled",
            description: "You have cancelled the payment",
            variant: "destructive",
          });
        },
      });

      paystack.openIframe();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonDisabled = isLoading || !paystackReady;

  return (
    <Card className="border-blue-100 dark:border-blue-900">
      <CardHeader>
        <CardTitle className="text-center">Job Posting Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-center">
          <p className="text-2xl font-bold">$10.00</p>
          <p className="text-sm text-muted-foreground">
            One-time payment for job posting
          </p>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
          onClick={handlePayment}
          disabled={buttonDisabled}
        >
          {!paystackReady ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading payment system...
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
