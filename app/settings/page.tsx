"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthProvider";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Mail,
  Lock,
  Upload,
  Save,
  Loader2,
  Check,
  Copy,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function SettingsPage() {
  const { user, signOut, updatePassword, enable2FA, verify2FA } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // password update states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);

  // Setting up 2FA states
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false);
  const [twoFASetupStep, setTwoFASetupStep] = useState(1);
  const [twoFAQrCode, setTwoFAQrCode] = useState("");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAVerificationCode, setTwoFAVerificationCode] = useState("");
  const [twoFAVerificationError, setTwoFAVerificationError] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFACopied, setTwoFACopied] = useState(false);

  const handleSaveProfile = () => {
    setIsLoading(true);
    // Simulate saving profile
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }, 1500);
  };
  // Password update function
  const handleUpdatePassword = async () => {
    // Reset error state
    setPasswordError("");

    // Validation checks
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    try {
      setPasswordUpdateLoading(true);
      await updatePassword(currentPassword, newPassword);

      // Clear form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Password update error:", error);
      setPasswordError(
        error.message || "Failed to update password. Please try again."
      );

      toast({
        title: "Update failed",
        description:
          error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  // 2FA setup functions
  const initiate2FASetup = async () => {
    setTwoFALoading(true);
    try {
      // This would normally call your auth service to get the 2FA setup information
      const response = await enable2FA();
      setTwoFAQrCode(response.qrCodeUrl);
      setTwoFASecret(response.secret);
      setTwoFADialogOpen(true);
      setTwoFASetupStep(1);
    } catch (error) {
      console.error("2FA setup error:", error);
      toast({
        title: "2FA Setup Failed",
        description: "Failed to initialize 2FA setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTwoFALoading(false);
    }
  };

  const verify2FASetup = async () => {
    if (!twoFAVerificationCode || twoFAVerificationCode.length !== 6) {
      setTwoFAVerificationError("Please enter a valid 6-digit code");
      return;
    }

    setTwoFALoading(true);
    try {
      // Verify the 2FA code
      await verify2FA(twoFASecret, twoFAVerificationCode);
      setTwoFASetupStep(3); // Success step

      toast({
        title: "2FA Enabled",
        description:
          "Two-factor authentication has been successfully enabled for your account.",
        variant: "success",
      });
    } catch (error) {
      console.error("2FA verification error:", error);
      setTwoFAVerificationError("Invalid verification code. Please try again.");
    } finally {
      setTwoFALoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(twoFASecret);
    setTwoFACopied(true);
    setTimeout(() => setTwoFACopied(false), 2000);
  };

  const close2FADialog = () => {
    setTwoFADialogOpen(false);
    // Reset after a short delay to allow for the closing animation
    setTimeout(() => {
      setTwoFASetupStep(1);
      setTwoFAVerificationCode("");
      setTwoFAVerificationError("");
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="border-b">
          <div className="container py-4">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div className="container py-8">
          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="justify-start w-full h-auto gap-6 p-0 bg-transparent border-b rounded-none">
              <TabsTrigger
                value="profile"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-medium"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-medium"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-medium"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 font-medium"
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className="w-24 h-24">
                          <AvatarImage
                            src={user?.photoURL || ""}
                            alt={user?.displayName || "Profile picture"}
                          />
                          <AvatarFallback>
                            {user?.displayName?.[0] || user?.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <Button size="sm" variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Change
                        </Button>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="first-name">First name</Label>
                            <Input
                              id="first-name"
                              defaultValue={
                                user?.displayName?.split(" ")[0] || ""
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input
                              id="last-name"
                              defaultValue={
                                user?.displayName?.split(" ")[1] || ""
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue={user?.email || ""}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            placeholder="Tell us about yourself"
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        defaultValue={user?.displayName || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" defaultValue="UTC (GMT+0)" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input id="language" defaultValue="English" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="destructive" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                  <Button>Save changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">
                          Email notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about your account activity.
                        </p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails">
                          Marketing emails
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about new features and promotions.
                        </p>
                      </div>
                      <Switch id="marketing-emails" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="course-updates">Course updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when courses you're enrolled in are
                          updated.
                        </p>
                      </div>
                      <Switch id="course-updates" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="community-notifications">
                          Community activity
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about replies to your community posts.
                        </p>
                      </div>
                      <Switch id="community-notifications" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save preferences</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {passwordError && (
                      <div className="p-3 text-sm font-medium text-white bg-red-500 rounded">
                        {passwordError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm new password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="two-factor">
                          Two-factor authentication
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={initiate2FASetup}
                        disabled={twoFALoading}
                      >
                        {twoFALoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Setup 2FA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={passwordUpdateLoading}
                  >
                    {passwordUpdateLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* 2FA Setup Dialog */}
            <Dialog open={twoFADialogOpen} onOpenChange={close2FADialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                  <DialogDescription>
                    Enhance your account security with 2FA
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Progress
                      value={(twoFASetupStep / 3) * 100}
                      className="h-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      Step {twoFASetupStep} of 3
                    </span>
                  </div>

                  {twoFASetupStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center gap-4 p-4 border rounded-lg">
                        {twoFAQrCode && (
                          <div className="p-2 bg-white border rounded">
                            <img
                              src={twoFAQrCode}
                              alt="QR Code for 2FA"
                              className="w-48 h-48"
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="mb-2 text-sm text-muted-foreground">
                            Scan this QR code with your authenticator app
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                              {twoFASecret}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={copySecret}
                              className="w-8 h-8"
                            >
                              {twoFACopied ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">
                        Download an authenticator app like Google Authenticator
                        or Authy if you don't have one already.
                      </p>
                    </div>
                  )}

                  {twoFASetupStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-sm">
                        Enter the 6-digit verification code from your
                        authenticator app to verify setup.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="verification-code">
                          Verification code
                        </Label>
                        <Input
                          id="verification-code"
                          value={twoFAVerificationCode}
                          onChange={(e) =>
                            setTwoFAVerificationCode(
                              e.target.value.replace(/\D/g, "").substring(0, 6)
                            )
                          }
                          placeholder="000000"
                          className="text-lg tracking-widest text-center"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                        />
                        {twoFAVerificationError && (
                          <p className="text-sm text-red-500">
                            {twoFAVerificationError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {twoFASetupStep === 3 && (
                    <div className="space-y-4 text-center">
                      <div className="flex justify-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                          <Check className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Setup Complete</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Two-factor authentication has been successfully
                          enabled for your account.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex items-center justify-between">
                  {twoFASetupStep < 3 ? (
                    <>
                      <Button variant="ghost" onClick={close2FADialog}>
                        Cancel
                      </Button>
                      {twoFASetupStep === 1 ? (
                        <Button onClick={() => setTwoFASetupStep(2)}>
                          Continue
                        </Button>
                      ) : (
                        <Button
                          onClick={verify2FASetup}
                          disabled={
                            twoFALoading ||
                            !twoFAVerificationCode ||
                            twoFAVerificationCode.length !== 6
                          }
                        >
                          {twoFALoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button onClick={close2FADialog}>Done</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
