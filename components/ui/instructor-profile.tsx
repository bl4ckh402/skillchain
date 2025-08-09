"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Edit2, Save, X } from "lucide-react";
import type { Instructor } from "@/types/index";

interface InstructorProfileProps {
  instructor: Instructor;
  isEditable?: boolean;
  onUpdate?: (instructor: Instructor) => void;
}

export function InstructorProfile({
  instructor,
  isEditable = false,
  onUpdate,
}: InstructorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInstructor, setEditedInstructor] = useState(instructor);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // In a real app, you'd upload to a service like Cloudinary or AWS S3
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { imageUrl } = await response.json();
        setEditedInstructor((prev: any) => ({ ...prev, profileImage: imageUrl }));
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onUpdate?.(editedInstructor);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedInstructor(instructor);
    setIsEditing(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Instructor Profile
          {isEditable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <X className="w-4 h-4" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-32 h-32">
              <AvatarImage
                src={editedInstructor.profileImage || "/placeholder.svg"}
                alt={editedInstructor.name}
              />
              <AvatarFallback className="text-2xl">
                {editedInstructor.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute bottom-0 right-0">
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Camera className="w-4 h-4" />
                  </div>
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="w-full space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedInstructor.name}
                  onChange={(e) =>
                    setEditedInstructor((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedInstructor.email}
                  onChange={(e) =>
                    setEditedInstructor((prev: any) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="statement">Profile Statement</Label>
                <Textarea
                  id="statement"
                  value={editedInstructor.profileStatement}
                  onChange={(e) =>
                    setEditedInstructor((prev: any) => ({
                      ...prev,
                      profileStatement: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="calendly">Calendly URL</Label>
                <Input
                  id="calendly"
                  value={editedInstructor.calendlyUrl}
                  onChange={(e) =>
                    setEditedInstructor((prev: any) => ({
                      ...prev,
                      calendlyUrl: e.target.value,
                    }))
                  }
                  placeholder="https://calendly.com/your-username"
                />
              </div>
              <div>
                <Label htmlFor="paystack-email">Paystack Email</Label>
                <Input
                  id="paystack-email"
                  type="email"
                  value={editedInstructor.paystackEmail}
                  onChange={(e) =>
                    setEditedInstructor((prev: any) => ({
                      ...prev,
                      paystackEmail: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={isUploading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">{instructor.name}</h3>
              <p className="text-muted-foreground">{instructor.email}</p>
              <p className="max-w-md mx-auto text-sm leading-relaxed">
                {instructor.profileStatement}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
