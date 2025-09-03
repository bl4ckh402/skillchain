"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/footer";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserCredential } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData?.emailVerified) {
          router.push("/dashboard");
        } else {
          router.push(
            `/verify-2fa?email=${encodeURIComponent(user.email ?? "")}`
          );
        }
      }
    };
    checkVerification();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const userCredential: UserCredential = await signIn(email, password);

      if (!userCredential || !userCredential.user) {
        throw new Error("Authentication failed");
      }
      await fetch("/api/token/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          uid: userCredential.user.uid,
        }),
      });

      localStorage.setItem(
        "pendingUser",
        JSON.stringify({
          email,
          uid: userCredential.user.uid,
          provider: "password",
        })
      );

      router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      const signInFn =
        provider === "google" ? signInWithGoogle : signInWithGithub;
      const userCredential = (await signInFn?.()) as UserCredential | undefined;
      if (userCredential && userCredential.user) {
        await fetch("/api/token/verify-2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userCredential.user.email,
            uid: userCredential.user.uid,
          }),
        });

        localStorage.setItem(
          "pendingUser",
          JSON.stringify({
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            provider,
          })
        );

        router.push(
          `/verify-2fa?email=${encodeURIComponent(
            userCredential.user.email ?? ""
          )}`
        );
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="m@example.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    className="absolute -translate-y-1/2 right-2 top-1/2 text-muted-foreground"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-background text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleSocialSignIn("google")}
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleSocialSignIn("github")}
                >
                  GitHub
                </Button>
              </div>
            </CardContent>
          </form>
          <CardFooter className="flex flex-col">
            <div className="mt-2 text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
