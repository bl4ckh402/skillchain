"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      router.push("/login");
      return;
    }
    setEmail(emailParam);
  }, [router, searchParams]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      // Get user UID by email (use your existing API)
      const res = await fetch(
        `/api/user-by-email?email=${encodeURIComponent(email)}`
      );
      const { uid } = await res.json();
      if (!uid) throw new Error("User not found");

      // Get code from Firestore
      const userDoc = await getDoc(doc(db, "users", uid));
      const userData = userDoc.data();
      const verification = userData?.emailVerification;

      if (!verification || !verification.code || !verification.expiresAt) {
        throw new Error("No verification code found.");
      }
      if (Date.now() > verification.expiresAt) {
        throw new Error("Verification code expired.");
      }
      if (verification.code !== code) {
        throw new Error("Invalid code.");
      }

      // Mark email as verified
      await updateDoc(doc(db, "users", uid), {
        emailVerified: true,
        "emailVerification.code": "",
        "emailVerification.expiresAt": 0,
      });

      toast({ title: "Success", description: "Email verified!" });
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex items-center justify-center flex-1 py-12">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="text-lg text-center"
            />
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
