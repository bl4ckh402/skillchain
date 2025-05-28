// /admin/init-admin.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LockKeyhole, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/types/user";

export default function InitAdminPage() {
  const { user, userProfile } = useAuth();
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  const [adminCreated, setAdminCreated] = useState(false);
  const [error, setError] = useState("");

  // Check if admin init key exists
  useEffect(() => {
    const checkAdminKeyExists = async () => {
      try {
        const adminKeyDoc = await getDoc(
          doc(db, "systemSettings", "adminInitKey")
        );
        // If the document doesn't exist, this is first run
        if (!adminKeyDoc.exists()) {
          // Generate a random admin key
          const randomKey = Math.random().toString(36).substring(2, 15);
          await setDoc(doc(db, "systemSettings", "adminInitKey"), {
            key: randomKey,
            used: false,
            createdAt: new Date(),
          });
          console.log("Admin key created:", randomKey);
        } else {
          // Check if key has been used
          const data = adminKeyDoc.data();
          if (data.used) {
            setAdminCreated(true);
          }
        }
      } catch (error) {
        console.error("Error checking admin key:", error);
        setError("Failed to check admin status");
      } finally {
        setCheckingKey(false);
      }
    };

    checkAdminKeyExists();
  }, []);

  const handleSetupAdmin = async (e: any) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Verify the admin key
      const adminKeyDoc = await getDoc(
        doc(db, "systemSettings", "adminInitKey")
      );

      if (!adminKeyDoc.exists()) {
        throw new Error("Admin key not found");
      }

      const adminKeyData = adminKeyDoc.data();

      if (adminKeyData.used) {
        throw new Error("Admin already initialized");
      }

      if (adminKeyData.key !== adminKey) {
        throw new Error("Invalid admin key");
      }

      // Update user role to admin
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        role: UserRole.ADMIN,
      });

      // Mark the admin key as used
      await updateDoc(doc(db, "systemSettings", "adminInitKey"), {
        used: true,
        usedBy: user.uid,
        usedAt: new Date(),
      });

      toast({
        title: "Success",
        description: "You have been set as the system administrator",
      });

      setAdminCreated(true);
    } catch (error: any) {
      console.error("Error setting up admin:", error);
      setError(error.message || "Failed to initialize admin");

      toast({
        title: "Error",
        description: error.message || "Failed to initialize admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Checking admin status...</span>
      </div>
    );
  }

  // If admin is already created
  if (adminCreated) {
    return (
      <div className="container max-w-md py-12 mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full dark:bg-green-900">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-center">Admin Already Setup</CardTitle>
            <CardDescription className="text-center">
              The system administrator has already been initialized.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              If you need admin access, please contact the existing
              administrator.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <a href="/">Return to Homepage</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <div className="container max-w-md py-12 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-center">
              Please sign in to initialize the admin account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <a href="/login?redirect=/admin/init-admin">Sign In</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-12 mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full dark:bg-blue-900">
              <LockKeyhole className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-center">
            Initialize Admin Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter the admin initialization key to set your account as
            administrator
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSetupAdmin}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminKey">Admin Initialization Key</Label>
                <Input
                  id="adminKey"
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  required
                />
              </div>

              {error && <div className="text-sm text-red-500">{error}</div>}

              <div className="text-sm text-muted-foreground">
                <p>
                  Note: This key is only available during the first system
                  setup. Check your server logs or configuration to find the
                  admin key.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              disabled={loading || !adminKey}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Initialize Admin"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
