"use client";

import { useState, useEffect } from "react";
import { InstructorProfile } from "@/components/ui/instructor-profile";
import { BookingDashboard } from "@/components/ui/booking-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Settings, ExternalLink } from "lucide-react";
import type { Instructor } from "@/types";

export default function InstructorDashboard() {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock instructor ID - in a real app, this would come from authentication
  const instructorId = "instructor-1";

  useEffect(() => {
    fetchInstructor();
  }, []);

  const fetchInstructor = async () => {
    try {
      // Mock data - replace with actual API call
      const mockInstructor: Instructor = {
        id: instructorId,
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@example.com",
        profileImage: "/placeholder.svg?height=200&width=200",
        profileStatement:
          "Experienced software engineering instructor with 10+ years in the industry. Specializing in full-stack development, system design, and mentoring junior developers.",
        calendlyUrl: "https://calendly.com/sarah-johnson",
        paystackEmail: "sarah.johnson@example.com",
        paystackPublicKey: "pk_test_dummy123456789abcdef",
      };

      setInstructor(mockInstructor);
    } catch (error) {
      console.error("Failed to fetch instructor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstructorUpdate = async (updatedInstructor: Instructor) => {
    try {
      const response = await fetch(`/api/instructors/${instructorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedInstructor),
      });

      if (response.ok) {
        setInstructor(updatedInstructor);
      }
    } catch (error) {
      console.error("Failed to update instructor:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-xl font-bold">Profile Not Found</h2>
            <p className="text-muted-foreground">
              Unable to load your instructor profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile, bookings, and view your earnings.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex justify-center">
              <InstructorProfile
                instructor={instructor}
                isEditable={true}
                onUpdate={handleInstructorUpdate}
              />
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Public Booking Page</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Share this link with clients to allow them to book
                  appointments with you.
                </p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 text-sm bg-gray-100 rounded">
                    {`${window.location.origin}/instructor/${instructor.id}`}
                  </code>
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(`/instructor/${instructor.id}`, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <BookingDashboard instructorId={instructorId} />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Calendly Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect your Calendly account to enable appointment booking.
                  </p>
                  <Button variant="outline">Update Calendly URL</Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Payment Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure your Paystack account for receiving payments.
                  </p>
                  <Button variant="outline">Update Payment Details</Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Notification Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage email notifications for bookings and payments.
                  </p>
                  <Button variant="outline">Configure Notifications</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
