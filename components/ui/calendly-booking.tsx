"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

interface CalendlyBookingProps {
  calendlyUrl: string;
  onBookingCompleteAction: (eventData: any) => void;
  onBookingComplete?: (eventData: any) => void; // Optional callback for booking completion
}

export function CalendlyBooking({
  calendlyUrl,
  onBookingCompleteAction,
}: CalendlyBookingProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate Calendly loading for demo
    setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    // Simulate Calendly event for demo
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event && e.data.event.indexOf("calendly") === 0) {
        if (e.data.event === "calendly.event_scheduled") {
          onBookingCompleteAction(e.data.payload);
        }
      }
    };

    window.addEventListener("message", handleCalendlyEvent);

    return () => {
      window.removeEventListener("message", handleCalendlyEvent);
    };
  }, [onBookingCompleteAction]);

  const openCalendlyPopup = () => {
    // Demo mode - simulate booking completion
    console.log("Demo mode: Simulating Calendly booking...");
    setTimeout(() => {
      onBookingCompleteAction({
        event_start_time: "2024-01-20T10:00:00Z",
        event_end_time: "2024-01-20T11:00:00Z",
        invitee: {
          name: "Demo User",
          email: "demo@example.com",
        },
      });
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Book an Appointment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Schedule a session at your convenience. Choose from available time
            slots.
          </p>

          {isLoaded ? (
            <div className="space-y-4">
              <Button onClick={openCalendlyPopup} className="w-full" size="lg">
                <Clock className="w-4 h-4 mr-2" />
                Select Available Time
              </Button>

              {/* Embedded Calendly widget alternative */}
              <div className="overflow-hidden border rounded-lg">
                <div
                  className="calendly-inline-widget"
                  data-url={calendlyUrl}
                  style={{ minWidth: "320px", height: "630px" }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
