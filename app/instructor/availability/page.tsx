"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/footer"
import { Calendar, Clock, Save, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/AuthProvider"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { AvailabilitySettings, AvailabilitySlot } from "@/types/instructor-booking"
import { useToast } from "@/components/ui/use-toast"

// Days of the week
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Times of day (30 minute intervals)
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minutes}`;
});

export default function InstructorAvailabilityPage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  // State for settings
  const [settings, setSettings] = useState<AvailabilitySettings>({
    instructorId: "",
    slots: [],
    bufferTime: 15,
    advanceBookingDays: 30,
    sessionDurations: ["30 minutes", "60 minutes"],
    pricing: {
      "30 minutes": 30,
      "60 minutes": 60,
    },
    autoAccept: false,
  });
  
  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize default availability slots if none exist
  const initializeDefaultSlots = () => {
    const defaultSlots: AvailabilitySlot[] = [];
    
    // Create default slots for Monday-Friday, 9 AM - 5 PM
    for (let day = 1; day <= 5; day++) {
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Only create slots for times between 9 AM - 5 PM
          if (hour === 16 && minute === 30) continue; // Skip 4:30 PM as it would end at 5:30 PM
          
          const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          const endMinute = minute + 30;
          const endHour = endMinute === 60 ? hour + 1 : hour;
          const normalizedEndMinute = endMinute % 60;
          const endTime = `${endHour.toString().padStart(2, "0")}:${normalizedEndMinute.toString().padStart(2, "0")}`;
          
          defaultSlots.push({
            id: `${day}-${startTime}-${endTime}`,
            day,
            startTime,
            endTime,
            isAvailable: true,
          });
        }
      }
    }
    
    return defaultSlots;
  };
  
  // Load instructor settings
  const loadSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const settingsRef = doc(db, 'instructorSettings', user.uid);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        const settingsData = settingsDoc.data() as AvailabilitySettings;
        setSettings(settingsData);
      } else {
        // Initialize with default settings if none exist
        const defaultSettings: AvailabilitySettings = {
          instructorId: user.uid,
          slots: initializeDefaultSlots(),
          bufferTime: 15,
          advanceBookingDays: 30,
          sessionDurations: ["30 minutes", "60 minutes"],
          pricing: {
            "30 minutes": 30,
            "60 minutes": 60,
          },
          autoAccept: false,
        };
        
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error("Error loading instructor settings:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Save instructor settings
  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const settingsRef = doc(db, 'instructorSettings', user.uid);
      
      await setDoc(settingsRef, {
        ...settings,
        instructorId: user.uid,
        updatedAt: serverTimestamp(),
      });
      
      toast({
        title: "Settings saved",
        description: "Your availability settings have been updated.",
      });
    } catch (err) {
      console.error("Error saving instructor settings:", err);
      toast({
        title: "Failed to save settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Toggle time slot availability
  const toggleTimeSlot = (slotId: string) => {
    setSettings(prev => ({
      ...prev,
      slots: prev.slots.map(slot => 
        slot.id === slotId 
          ? { ...slot, isAvailable: !slot.isAvailable } 
          : slot
      ),
    }));
  };
  
  // Add a session duration
  const addSessionDuration = (duration: string) => {
    if (settings.sessionDurations.includes(duration)) return;
    
    const newDurations = [...settings.sessionDurations, duration].sort((a, b) => {
      const aMinutes = parseInt(a.split(" ")[0]);
      const bMinutes = parseInt(b.split(" ")[0]);
      return aMinutes - bMinutes;
    });
    
    const newPricing = { ...settings.pricing };
    
    // Set default price based on duration
    const minutes = parseInt(duration.split(" ")[0]);
    newPricing[duration] = minutes; // $1 per minute as a default
    
    setSettings(prev => ({
      ...prev,
      sessionDurations: newDurations,
      pricing: newPricing,
    }));
  };
  
  // Remove a session duration
  const removeSessionDuration = (duration: string) => {
    if (settings.sessionDurations.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "You must have at least one session duration.",
        variant: "destructive",
      });
      return;
    }
    
    const newDurations = settings.sessionDurations.filter(d => d !== duration);
    const newPricing = { ...settings.pricing };
    delete newPricing[duration];
    
    setSettings(prev => ({
      ...prev,
      sessionDurations: newDurations,
      pricing: newPricing,
    }));
  };
  
  // Update price for a duration
  const updatePrice = (duration: string, price: number) => {
    setSettings(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [duration]: price,
      },
    }));
  };
  
  // Handle buffer time changes
  const handleBufferTimeChange = (value: string) => {
    const bufferTime = parseInt(value);
    if (!isNaN(bufferTime) && bufferTime >= 0) {
      setSettings(prev => ({
        ...prev,
        bufferTime,
      }));
    }
  };
  
  // Handle advance booking days changes
  const handleAdvanceBookingDaysChange = (value: string) => {
    const days = parseInt(value);
    if (!isNaN(days) && days > 0) {
      setSettings(prev => ({
        ...prev,
        advanceBookingDays: days,
      }));
    }
  };
  
  // Toggle auto-accept setting
  const toggleAutoAccept = () => {
    setSettings(prev => ({
      ...prev,
      autoAccept: !prev.autoAccept,
    }));
  };
  
  // Load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, [user]);
  
  // Group slots by day for the schedule display
  const getSlotsByDay = () => {
    const slotsByDay: { [key: number]: AvailabilitySlot[] } = {};
    
    DAYS.forEach((_, index) => {
      slotsByDay[index] = settings.slots.filter(slot => slot.day === index);
    });
    
    return slotsByDay;
  };
  
  const slotsByDay = getSlotsByDay();
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-900/20 dark:to-teal-900/20 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Manage Availability</h1>
                <p className="text-muted-foreground">Set your availability and session preferences</p>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                onClick={saveSettings}
                disabled={saving}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              <p className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </p>
              <Button 
                variant="link" 
                className="text-red-700 dark:text-red-400 p-0 h-auto mt-1" 
                onClick={loadSettings}
              >
                Try again
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-600 dark:text-slate-400">Loading your settings...</span>
            </div>
          ) : (
            <Tabs defaultValue="schedule" className="space-y-6">
              <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <TabsTrigger
                  value="schedule"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 rounded-md"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Session Preferences
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Availability</CardTitle>
                    <CardDescription>
                      Set the times you're available for bookings each week. Click on a time slot to toggle availability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {DAYS.map((day, dayIndex) => (
                        <div key={day} className="space-y-2">
                          <h3 className="font-medium text-center text-slate-800 dark:text-slate-200">{day}</h3>
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 space-y-1">
                            {TIMES.map((time, timeIndex) => {
                              // Only show time slots between 7 AM and 10 PM to save space
                              const hour = parseInt(time.split(":")[0]);
                              if (hour < 7 || hour >= 22) return null;
                              
                              // Check if a slot exists for this day and time
                              const slot = settings.slots.find(
                                s => s.day === dayIndex && s.startTime === time
                              );
                              
                              // Skip if no slot (this would mean it's not available by default)
                              if (!slot) return null;
                              
                              return (
                                <button
                                  key={`${day}-${time}`}
                                  className={`w-full text-xs py-1 px-2 rounded ${
                                    slot.isAvailable
                                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800/50"
                                      : "bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                  }`}
                                  onClick={() => toggleTimeSlot(slot.id)}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Settings</CardTitle>
                    <CardDescription>
                      Configure your session durations, pricing, and booking preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">Session Durations & Pricing</h3>
                      
                      <div className="space-y-2">
                        {settings.sessionDurations.map(duration => (
                          <div key={duration} className="flex items-center gap-4">
                            <div className="flex-1 flex items-center">
                              <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[100px]">
                                {duration}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400 min-w-[30px]">$</span>
                              <Input
                                type="number"
                                value={settings.pricing[duration]}
                                onChange={(e) => updatePrice(duration, parseInt(e.target.value))}
                                className="w-24"
                                min="1"
                              />
                            </div>
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
                              size="sm"
                              onClick={() => removeSessionDuration(duration)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        
                        <div className="pt-2">
                          <Select
                            onValueChange={(value) => addSessionDuration(value)}
                            value=""
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Add duration..." />
                            </SelectTrigger>
                            <SelectContent>
                              {["15 minutes", "30 minutes", "45 minutes", "60 minutes", "90 minutes", "120 minutes"]
                                .filter(d => !settings.sessionDurations.includes(d))
                                .map(duration => (
                                  <SelectItem key={duration} value={duration}>
                                    {duration}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">Booking Preferences</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="buffer-time">Buffer Time (minutes)</Label>
                          <Input
                            id="buffer-time"
                            type="number"
                            value={settings.bufferTime}
                            onChange={(e) => handleBufferTimeChange(e.target.value)}
                            min="0"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Minimum time between sessions
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="advance-days">Advance Booking Days</Label>
                          <Input
                            id="advance-days"
                            type="number"
                            value={settings.advanceBookingDays}
                            onChange={(e) => handleAdvanceBookingDaysChange(e.target.value)}
                            min="1"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            How many days in advance students can book
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-accept">Auto-Accept Bookings</Label>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Automatically accept booking requests that match your availability
                          </p>
                        </div>
                        <Switch
                          id="auto-accept"
                          checked={settings.autoAccept}
                          onCheckedChange={toggleAutoAccept}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-4 space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={loadSettings}
                      disabled={saving}
                    >
                      Reset
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                      onClick={saveSettings}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}