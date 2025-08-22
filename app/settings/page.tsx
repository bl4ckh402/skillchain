"use client";

import { useState, useEffect } from "react";
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
import { toast, useToast } from "@/components/ui/use-toast";
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
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

export default function SettingsPage() {
  const { user, signOut, updatePassword, enable2FA, verify2FA } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false);
  const [twoFASetupStep, setTwoFASetupStep] = useState(1);
  const [twoFAQrCode, setTwoFAQrCode] = useState("");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAVerificationCode, setTwoFAVerificationCode] = useState("");
  const [twoFAVerificationError, setTwoFAVerificationError] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFACopied, setTwoFACopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    photoURL: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};
        setProfileData({
          firstName:
            userData.firstName || user.displayName?.split(" ")[0] || "",
          lastName: userData.lastName || user.displayName?.split(" ")[1] || "",
          bio: userData.bio || "",
          photoURL: userData.photoURL || user.photoURL || "",
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) {
      toast({
        title: "Error",
        description: "No file selected or user not authenticated",
        variant: "destructive",
      });
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${user.uid}-${timestamp}-${file.name}`;
      const storageRef = ref(storage, `profile-images/${user.uid}/${fileName}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL });
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { photoURL, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setProfileData((prev) => ({ ...prev, photoURL }));
      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const newDisplayName = `${profileData.firstName} ${profileData.lastName}`;
      await setDoc(
        userRef,
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          displayName: newDisplayName,
          bio: profileData.bio,
          photoURL: profileData.photoURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      if (
        user.displayName !== newDisplayName ||
        user.photoURL !== profileData.photoURL
      ) {
        await updateProfile(user, {
          displayName: newDisplayName,
          photoURL: profileData.photoURL,
        });
      }
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
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
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
        variant: "default",
      });
    } catch (error: any) {
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

  const initiate2FASetup = async () => {
    setTwoFALoading(true);
    try {
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
      await verify2FA(twoFAVerificationCode);
      setTwoFASetupStep(3);
      toast({
        title: "2FA Enabled",
        description:
          "Two-factor authentication has been successfully enabled for your account.",
        variant: "default",
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
    setTimeout(() => {
      setTwoFASetupStep(1);
      setTwoFAVerificationCode("");
      setTwoFAVerificationError("");
    }, 300);
  };

  const hasChanges = () => {
    if (!user?.uid) return false;
    return (
      profileData.firstName !== (user?.displayName?.split(" ")[0] || "") ||
      profileData.lastName !== (user?.displayName?.split(" ")[1] || "") ||
      profileData.bio !== "" ||
      profileData.photoURL !== (user?.photoURL || "")
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="border-b">
          <div className="container px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
        <div className="container px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <Tabs defaultValue="profile" className="space-y-6 sm:space-y-8">
            <TabsList className="flex flex-wrap justify-start w-full h-auto gap-2 p-0 bg-transparent border-b rounded-none sm:gap-4">
              <TabsTrigger
                value="profile"
                className="flex items-center px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <User className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="flex items-center px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <CreditCard className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Bell className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center px-2 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Shield className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                Security
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Update your personal information and profile picture.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-4 sm:gap-6 sm:flex-row sm:items-start">
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <Avatar className="relative w-20 h-20 sm:w-24 sm:h-24">
                          {uploading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <AvatarImage
                                src={
                                  profileData.photoURL
                                    ? `${profileData.photoURL}?t=${Date.now()}`
                                    : undefined
                                }
                                alt={`${profileData.firstName} ${profileData.lastName}`}
                                className="object-cover rounded-full"
                              />
                              <AvatarFallback className="text-base font-semibold sm:text-lg">
                                {profileData.firstName[0]}
                                {profileData.lastName[0]}
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="relative text-xs sm:text-sm"
                            disabled={uploading}
                            asChild
                          >
                            <label
                              htmlFor="photo-upload"
                              className="flex items-center cursor-pointer"
                            >
                              {uploading ? (
                                <Loader2 className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                              )}
                              Change Photo
                            </label>
                          </Button>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </div>
                      </div>
                      <div className="flex-1 w-full space-y-4 sm:space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label
                              htmlFor="first-name"
                              className="text-sm sm:text-base"
                            >
                              First name
                            </Label>
                            <Input
                              id="first-name"
                              value={profileData.firstName}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                              className="text-sm sm:text-base"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="last-name"
                              className="text-sm sm:text-base"
                            >
                              Last name
                            </Label>
                            <Input
                              id="last-name"
                              value={profileData.lastName}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                              className="text-sm sm:text-base"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-sm sm:text-base"
                          >
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue={user?.email || ""}
                            disabled
                            className="text-sm sm:text-base"
                          />
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            You cannot change your email address.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-sm sm:text-base">
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            placeholder="Tell us about yourself"
                            className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                            value={profileData.bio}
                            onChange={(e) =>
                              setProfileData((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading || !hasChanges()}
                    className="text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                        Save changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="account" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Account Preferences
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="username"
                        className="text-sm sm:text-base"
                      >
                        Username
                      </Label>
                      <Input
                        id="username"
                        defaultValue={user?.displayName || ""}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="timezone"
                        className="text-sm sm:text-base"
                      >
                        Timezone
                      </Label>
                      <Input
                        id="timezone"
                        defaultValue="UTC (GMT+0)"
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="language"
                        className="text-sm sm:text-base"
                      >
                        Language
                      </Label>
                      <Input
                        id="language"
                        defaultValue="English"
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="destructive"
                    onClick={signOut}
                    className="w-full text-sm sm:text-base sm:w-auto"
                  >
                    <LogOut className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
                    Sign out
                  </Button>
                  <Button className="w-full text-sm sm:text-base sm:w-auto">
                    Save changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent
              value="notifications"
              className="space-y-4 sm:space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Notification Settings
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Choose how and when you want to be notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="email-notifications"
                          className="text-sm sm:text-base"
                        >
                          Email notifications
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Receive emails about your account activity.
                        </p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="marketing-emails"
                          className="text-sm sm:text-base"
                        >
                          Marketing emails
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Receive emails about new features and promotions.
                        </p>
                      </div>
                      <Switch id="marketing-emails" />
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="course-updates"
                          className="text-sm sm:text-base"
                        >
                          Course updates
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Get notified when courses you're enrolled in are
                          updated.
                        </p>
                      </div>
                      <Switch id="course-updates" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="community-notifications"
                          className="text-sm sm:text-base"
                        >
                          Community activity
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Get notified about replies to your community posts.
                        </p>
                      </div>
                      <Switch id="community-notifications" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full text-sm sm:text-base sm:w-auto">
                    Save preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="security" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage your password and account security.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-4">
                    {passwordError && (
                      <div className="p-3 text-xs font-medium text-white bg-red-500 rounded sm:text-sm">
                        {passwordError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label
                        htmlFor="current-password"
                        className="text-sm sm:text-base"
                      >
                        Current password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="new-password"
                        className="text-sm sm:text-base"
                      >
                        New password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="text-sm sm:text-base"
                      >
                        Confirm new password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="two-factor"
                          className="text-sm sm:text-base"
                        >
                          Two-factor authentication
                        </Label>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={initiate2FASetup}
                        disabled={twoFALoading}
                        className="w-full text-sm sm:text-base sm:w-auto"
                      >
                        {twoFALoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" />
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
                    className="w-full text-sm sm:text-base sm:w-auto"
                  >
                    {passwordUpdateLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <Dialog open={twoFADialogOpen} onOpenChange={close2FADialog}>
              <DialogContent className="sm:max-w-md w-[90vw] max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">
                    Setup Two-Factor Authentication
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base">
                    Enhance your account security with 2FA
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Progress
                      value={(twoFASetupStep / 3) * 100}
                      className="h-2"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground">
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
                              className="w-40 h-40 sm:w-48 sm:h-48"
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <p className="mb-2 text-xs sm:text-sm text-muted-foreground">
                            Scan this QR code with your authenticator app
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs sm:text-sm">
                              {twoFASecret}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={copySecret}
                              className="w-8 h-8 sm:w-10 sm:h-10"
                            >
                              {twoFACopied ? (
                                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm">
                        Download an authenticator app like Google Authenticator
                        or Authy if you don't have one already.
                      </p>
                    </div>
                  )}
                  {twoFASetupStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm">
                        Enter the 6-digit verification code from your
                        authenticator app to verify setup.
                      </p>
                      <div className="space-y-2">
                        <Label
                          htmlFor="verification-code"
                          className="text-sm sm:text-base"
                        >
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
                          className="text-base tracking-widest text-center sm:text-lg"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                        />
                        {twoFAVerificationError && (
                          <p className="text-xs text-red-500 sm:text-sm">
                            {twoFAVerificationError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {twoFASetupStep === 3 && (
                    <div className="space-y-4 text-center">
                      <div className="flex justify-center">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full sm:w-16 sm:h-16">
                          <Check className="w-6 h-6 text-green-600 sm:w-8 sm:h-8" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-medium sm:text-lg">
                          Setup Complete
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                          Two-factor authentication has been successfully
                          enabled for your account.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {twoFASetupStep < 3 ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={close2FADialog}
                        className="w-full text-sm sm:text-base sm:w-auto"
                      >
                        Cancel
                      </Button>
                      {twoFASetupStep === 1 ? (
                        <Button
                          onClick={() => setTwoFASetupStep(2)}
                          className="w-full text-sm sm:text-base sm:w-auto"
                        >
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
                          className="w-full text-sm sm:text-base sm:w-auto"
                        >
                          {twoFALoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={close2FADialog}
                      className="w-full text-sm sm:text-base sm:w-auto"
                    >
                      Done
                    </Button>
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
