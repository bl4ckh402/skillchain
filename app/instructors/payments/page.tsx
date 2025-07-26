"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { usePayment } from "@/context/PaymentProvider";
import { BankAccountForm } from "@/components/instructor/BankAccountForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, Loader } from "lucide-react";

export default function InstructorPaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasSubaccount, loading } = usePayment();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Payment Settings</h1>

      {!hasSubaccount && (
        <Alert className="mb-6">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Setup Required</AlertTitle>
          <AlertDescription>
            You need to set up your bank account details to receive payments
            from your courses.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Bank Account</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <BankAccountForm />
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>How Payments Work</CardTitle>
                  <CardDescription>
                    Understanding how you get paid for your courses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 mt-0.5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Split Payments</h3>
                      <p className="text-sm text-muted-foreground">
                        When a student purchases your course, the payment is
                        automatically split between you and the platform in
                        Kenyan Shillings (KES).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 mt-0.5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Payout Schedule</h3>
                      <p className="text-sm text-muted-foreground">
                        Payouts are processed directly to your bank account by
                        Paystack as transactions occur.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 mt-0.5 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Taxes</h3>
                      <p className="text-sm text-muted-foreground">
                        You are responsible for paying any applicable taxes on
                        your earnings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View all your past transactions and earnings in KES
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Payment history component would go here */}
              <p className="py-10 text-center text-muted-foreground">
                Your payment history will appear here once you start receiving
                payments.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
