"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  StreamVideoClient,
  StreamVideo,
  Call,
  CallType,
  UserResponse,
  CallingState,
} from "@stream-io/video-react-sdk";
import { useAuth } from "@/context/AuthProvider";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { CallSession } from "../types/session";

// Environment variables
const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";

// Types
interface VideoContextType {
  // Client state
  client: StreamVideoClient | null;
  isClientReady: boolean;
  currentUser: UserResponse | null;

  // Active calls
  activeCalls: CallSession[];
  activeCallId: string | null;

  // Call management functions
  createCall: (
    title: string,
    callType?: string,
    scheduledFor?: Date
  ) => Promise<CallSession>;
  joinCall: (callId: string, create?: boolean) => Promise<Call | null>;
  leaveCall: (callId: string) => Promise<void>;
  endCall: (callId: string) => Promise<void>;
  getCall: (callId: string) => Call | null;

  // Session history functions
  recentSessions: CallSession[];
  upcomingSessions: CallSession[];
  fetchSessions: () => Promise<void>;

  // Loading/error states
  isLoading: boolean;
  error: string | null;
}

// Create context
const VideoContext = createContext<VideoContextType | null>(null);

// Provider component
export const VideoProvider = ({ children }: { children: ReactNode }) => {
  // Authentication context
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [activeCalls, setActiveCalls] = useState<CallSession[]>([]);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [recentSessions, setRecentSessions] = useState<CallSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<CallSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token provider function for Stream client
  const tokenProvider = useCallback(async () => {
    if (!user) throw new Error("User is not authenticated");

    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get Stream token");
      }

      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error("Error getting Stream token:", error);
      throw error;
    }
  }, [user]);

  // Initialize Stream client when user is authenticated
  useEffect(() => {
    if (!user || !API_KEY) {
      setIsLoading(false);
      return;
    }

    const initClient = async () => {
      try {
        setIsLoading(true);

        // Create Stream video client
        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: API_KEY,
          user: {
            id: user.uid,
            name: user.displayName || user.uid,
            image: user.photoURL || undefined,
          },
          tokenProvider,
        });

        // Update states
        setClient(streamClient);
        setCurrentUser({
          id: user.uid,
          name: user.displayName || user.uid,
          image: user.photoURL || undefined,
        } as UserResponse);
        setIsClientReady(true);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize Stream client:", err);
        setError("Failed to initialize video service");
      } finally {
        setIsLoading(false);
      }
    };

    initClient();

    // Cleanup function
    return () => {
      if (client) {
        Promise.all(
          activeCalls.map((session) => leaveCall(session.id))
        ).finally(() => {
          client.disconnectUser();
          setClient(null);
          setIsClientReady(false);
          setActiveCalls([]);
          setActiveCallId(null);
        });
      }
    };
  }, [user, tokenProvider]);

  // Create call
  const createCall = useCallback(
    async (
      title: string,
      callType: string = "default",
      scheduledFor?: Date
    ): Promise<CallSession> => {
      if (!client || !isClientReady || !user) {
        throw new Error("Video client is not ready");
      }

      try {
        const callId = uuidv4();
        const callObject = client.call(callType, callId);

        const status: "active" | "scheduled" = scheduledFor
          ? "scheduled"
          : "active";

        const sessionData = {
          id: callId,
          title,
          type: callType,
          createdAt: serverTimestamp(),
          scheduledFor: scheduledFor || null,
          instructorId: user.uid,
          status,
          participants: [user.uid],
        };

        await addDoc(collection(db, "sessions"), sessionData);

        const session: CallSession = {
          id: callId,
          title,
          callObject,
          type: callType,
          createdAt: new Date(),
          instructorId: user.uid,
          status,
          participants: [user.uid],
          isRecording: false,
        };

        setActiveCalls((prev) => [...prev, session]);
        setActiveCallId(callId);

        return session;
      } catch (error) {
        console.error("Failed to create call:", error);
        throw new Error("Failed to create video session");
      }
    },
    [client, isClientReady, user]
  );

  // Fetch sessions
  const fetchSessions = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      // Query Firestore for sessions
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("participants", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(sessionsQuery);
      const now = new Date();
      const recent: CallSession[] = [];
      const upcoming: CallSession[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const session = {
          ...data,
          createdAt: (data.createdAt as Timestamp).toDate(),
          callObject: client?.call("default", data.id) || null,
        } as CallSession;

        if (session.createdAt > now || session.status === "scheduled") {
          upcoming.push(session);
        } else {
          recent.push(session);
        }
      });

      setRecentSessions(recent);
      setUpcomingSessions(upcoming);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setError("Failed to load sessions");
    }
  }, [client, user]);

  // Update session status
  const updateSessionStatus = useCallback(
    async (callId: string, status: "active" | "ended" | "scheduled") => {
      try {
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("id", "==", callId)
        );
        const snapshot = await getDocs(sessionsQuery);

        if (!snapshot.empty) {
          const sessionDoc = snapshot.docs[0];
          await updateDoc(doc(db, "sessions", sessionDoc.id), { status });
        }
      } catch (error) {
        console.error("Failed to update session status:", error);
      }
    },
    []
  );

  // Join call
  const joinCall = useCallback(
    async (callId: string, create: boolean = false): Promise<Call | null> => {
      if (!client || !isClientReady || !user) {
        throw new Error("Video client is not ready");
      }

      try {
        // Check if we're already in this call
        const existingSession = activeCalls.find((call) => call.id === callId);
        if (existingSession) {
          setActiveCallId(callId);
          return existingSession.callObject;
        }

        // Get call object
        const callObject = client.call("default", callId);

        try {
          if (create) {
            await callObject.getOrCreate();
          } else {
            try {
              await callObject.get();
            } catch (getError) {
              // If get fails and create is false, try getOrCreate as fallback
              console.log("Call not found, attempting to create...");
              await callObject.getOrCreate();
            }
          }

          await callObject.join();
          await updateSessionStatus(callId, "active");

          // Add participant to Firestore
          const sessionsQuery = query(
            collection(db, "sessions"),
            where("id", "==", callId)
          );
          const snapshot = await getDocs(sessionsQuery);

          if (!snapshot.empty) {
            const sessionDoc = snapshot.docs[0];
            const sessionData = sessionDoc.data();

            if (!sessionData.participants.includes(user.uid)) {
              await updateDoc(doc(db, "sessions", sessionDoc.id), {
                participants: [...sessionData.participants, user.uid],
              });
            }
          }

          // Create session object
          const session: CallSession = {
            id: callId,
            title: `Session ${callId}`,
            callObject,
            type: "default",
            createdAt: new Date(),
            instructorId: user.uid,
            status: "active",
            participants: [user.uid],
            isRecording: false,
          };

          // Update state
          setActiveCalls((prev) => [...prev, session]);
          setActiveCallId(callId);

          return callObject;
        } catch (error) {
          console.error("Failed to access call:", error);
          throw new Error(
            "Failed to access the call. Please check the call ID and try again."
          );
        }
      } catch (error) {
        console.error("Failed to initialize call:", error);
        toast({
          title: "Failed to initialize session",
          description:
            error instanceof Error
              ? error.message
              : "The session may not exist or you don't have permission to join.",
          variant: "destructive",
        });
        return null;
      }
    },
    [client, isClientReady, user, activeCalls, toast, updateSessionStatus]
  );
  // Leave call
  const leaveCall = useCallback(
    async (callId: string): Promise<void> => {
      try {
        const session = activeCalls.find((call) => call.id === callId);
        if (!session || !session.callObject) {
          console.log("Call already left or doesn't exist");
          return;
        }

        // Check if call is already in a terminal state
        const callState = session.callObject.state.callingState;
        if (
          callState === CallingState.LEFT ||
          callState === CallingState.IDLE ||
          callState === CallingState.RECONNECTING_FAILED
        ) {
          console.log("Call already in terminal state:", callState);
          setActiveCalls((prev) => prev.filter((call) => call.id !== callId));
          if (activeCallId === callId) {
            setActiveCallId(null);
          }
          return;
        }

        await session.callObject.leave();
        setActiveCalls((prev) => prev.filter((call) => call.id !== callId));
        if (activeCallId === callId) {
          setActiveCallId(null);
        }
      } catch (error) {
        console.error("Failed to leave call:", error);
        // Clean up state even if leave fails
        setActiveCalls((prev) => prev.filter((call) => call.id !== callId));
        if (activeCallId === callId) {
          setActiveCallId(null);
        }
      }
    },
    [activeCalls, activeCallId]
  );

  // End call (for hosts)
  const endCall = useCallback(
    async (callId: string): Promise<void> => {
      try {
        const session = activeCalls.find((call) => call.id === callId);
        if (!session || !session.callObject) return;

        await session.callObject.endCall();
        await updateSessionStatus(callId, "ended");
        await leaveCall(callId);
        await fetchSessions();
      } catch (error) {
        console.error("Failed to end call:", error);
      }
    },
    [activeCalls, leaveCall, updateSessionStatus, fetchSessions]
  );

  // Get call object
  const getCall = useCallback(
    (callId: string): Call | null => {
      const session = activeCalls.find((call) => call.id === callId);
      return session ? session.callObject : null;
    },
    [activeCalls]
  );

  // Fetch sessions on initialization
  useEffect(() => {
    if (isClientReady && user) {
      fetchSessions();
    }
  }, [isClientReady, user, fetchSessions]);

  // Context value
  const value = useMemo(
    () => ({
      // Client state
      client,
      isClientReady,
      currentUser,

      // Active calls
      activeCalls,
      activeCallId,

      // Call management functions
      createCall,
      joinCall,
      leaveCall,
      endCall,
      getCall,

      // Session history
      recentSessions,
      upcomingSessions,
      fetchSessions,

      // Loading/error states
      isLoading,
      error,
    }),
    [
      client,
      isClientReady,
      currentUser,
      activeCalls,
      activeCallId,
      createCall,
      joinCall,
      leaveCall,
      endCall,
      getCall,
      recentSessions,
      upcomingSessions,
      fetchSessions,
      isLoading,
      error,
    ]
  );

  // If loading, show loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <VideoContext.Provider value={value}>
      {client ? (
        <StreamVideo client={client}>{children}</StreamVideo>
      ) : (
        children
      )}
    </VideoContext.Provider>
  );
};

// Hook to use the context
export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);

  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }

  return context;
};

  