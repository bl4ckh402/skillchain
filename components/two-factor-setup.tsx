"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthProvider";
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
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function TwoFactorSetup({
  onComplete,
  isRequired = false,
}: {
  onComplete?: () => void;
  isRequired?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      if (!isRequired) {
        router.push("/login");
      }
      return;
    }

    // Check if user already has 2FA enabled
    const checkTwoFactorStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (userData?.twoFactorEnabled) {
          // User already has 2FA enabled
          if (onComplete) {
            onComplete();
          } else {
            router.push("/dashboard");
          }
          return;
        }

        // Generate a new secret and QR code
        generateSecret();
      } catch (error) {
        console.error("Error checking 2FA status:", error);
        setError("Failed to check two-factor authentication status");
        setLoading(false);
      }
    };

    checkTwoFactorStatus();
  }, [user, router, onComplete, isRequired]);

  const generateSecret = async () => {
    try {
      // Call backend API to generate a new secret
      const response = await fetch("/api/token/generate-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate 2FA secret");
      }

      const data = await response.json();
      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error generating 2FA secret:", error);
      setError("Failed to generate two-factor authentication secret");
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      // Call backend API to verify the code
      const response = await fetch("/api/token/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          secret,
          token: verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify code");
      }

      const data = await response.json();

      if (data.valid) {
        if (!user) {
          setError("User authentication lost. Please try again.");
          setVerifying(false);
          return;
        }

        // Save 2FA status to user profile
        await updateDoc(doc(db, "users", user.uid), {
          twoFactorEnabled: true,
          twoFactorSecret: secret,
        });

        // Also add to userSettings if it exists
        const userSettingsDoc = await getDoc(doc(db, "userSettings", user.uid));
        if (userSettingsDoc.exists()) {
          await updateDoc(doc(db, "userSettings", user.uid), {
            twoFactorEnabled: true,
          });
        } else {
          await setDoc(doc(db, "userSettings", user.uid), {
            userId: user.uid,
            twoFactorEnabled: true,
            notifications: {
              email: true,
              push: true,
            },
          });
        }

        setStep(3);
        toast({
          title: "Success",
          description:
            "Two-factor authentication has been enabled for your account",
        });
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

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard",
    });
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enhance your account security with two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="mb-2 font-medium">Step 1: Scan QR Code</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.)
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <div className="p-2 bg-white border rounded-lg">
                    <Image
                      src={qrCodeUrl}
                      alt="QR Code for 2FA"
                      width={200}
                      height={200}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="text-sm font-medium">Manual entry:</div>
                <div className="flex">
                  <code className="flex-1 p-2 overflow-x-auto text-sm rounded bg-muted">
                    {secret}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copySecret}
                    className="ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="mb-2 font-medium">Step 2: Verify Code</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to verify
                setup
              </p>
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
            </div>
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
                "Verify & Enable 2FA"
              )}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-xl font-medium">Setup Complete!</h3>
            <p className="text-muted-foreground">
              Two-factor authentication has been successfully enabled for your
              account.
            </p>
          </div>
        )}
      </CardContent>
      {step === 3 && (
        <CardFooter>
          <Button onClick={handleComplete} className="w-full">
            Continue to Dashboard
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
