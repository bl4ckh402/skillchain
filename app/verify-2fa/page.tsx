"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      router.push("/login");
      return;
    }

    setEmail(emailParam);
    setLoading(false);
  }, [router, searchParams]);

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      // Get user document from Firebase to fetch the 2FA secret
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        searchParams.get("temp") || ""
      );
      const userId = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const userSecret = userData.twoFactorSecret;

      if (!userSecret) {
        throw new Error("Two-factor authentication not set up properly");
      }

      // Verify the code
      const response = await fetch("/api/token/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await userCredential.user.getIdToken()}`,
        },
        body: JSON.stringify({
          secret: userSecret,
          token: verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify code");
      }

      const data = await response.json();

      if (data.valid) {
        toast({
          title: "Success",
          description: "Two-factor authentication verified successfully",
        });

        // Redirect to dashboard or the intended page
        router.push("/dashboard");
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      setError("Failed to verify code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex items-center justify-center flex-1 py-12">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <CardTitle>Two-Factor Verification</CardTitle>
            <CardDescription>
              Enter the verification code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))
                }
                className="text-lg text-center"
              />
              <p className="text-xs text-center text-muted-foreground">
                Open your authenticator app to view your verification code
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={verifyCode}
              disabled={verifying}
              className="w-full"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
