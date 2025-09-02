"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageCircle,
  Users,
  Share2,
  Settings,
  Phone,
  PhoneOff,
  Square,
  Send,
  Calendar,
  Clock,
  User,
} from "lucide-react";

// Mock data for demonstration
const mockBootcamp = {
  id: "1",
  title: "Full Stack Web Development Bootcamp",
  shortDescription:
    "Master modern web development with React, Node.js, and more",
  description:
    "A comprehensive bootcamp covering frontend and backend development",
  price: "1500",
  duration: "12 weeks",
  status: "ACTIVE",
  instructor: {
    id: "inst1",
    name: "Sarah Johnson",
    bio: "Senior Full Stack Developer with 8+ years experience",
  },
  maxStudents: 50,
  currentStudents: 32,
  schedule: {
    timezone: "UTC",
    days: ["Monday", "Wednesday", "Friday"],
    time: "18:00",
  },
  liveSessions: [
    {
      id: "session1",
      title: "React Fundamentals",
      date: new Date(),
      duration: "2 hours",
      description: "Introduction to React components and JSX",
    },
    {
      id: "session2",
      title: "State Management with Redux",
      date: new Date(Date.now() + 86400000),
      duration: "2.5 hours",
      description: "Advanced state management patterns",
    },
  ],
};

const mockChatMessages = [
  {
    id: 1,
    user: "Alice",
    message: "Great explanation of React hooks!",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: 2,
    user: "Bob",
    message: "Can you repeat the useState example?",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: 3,
    user: "Instructor",
    message: "Sure! Let me go over it again",
    timestamp: new Date(Date.now() - 180000),
  },
];

// Session interface
interface LiveSession {
  id: string;
  title: string;
  date: Date;
  duration: string;
  description: string;
}

// Live Class Component
const LiveClassRoom = ({
  session,
  isInstructor = false,
  onLeave,
}: {
  session: LiveSession;
  isInstructor?: boolean;
  onLeave: () => void;
}) => {
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState(32);
  const [chatMessages, setChatMessages] = useState(mockChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // WebRTC Setup
  const initializeWebRTC = useCallback(async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize peer connection
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      setIsConnected(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }, []);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn((prev) => !prev);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioOn;
      });
      setIsAudioOn((prev) => !prev);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement actual recording logic here
  };

  const leaveClass = () => {
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track: { stop: () => any }) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsConnected(false);
    onLeave();
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: "You",
        message: newMessage,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-white">LIVE</span>
            </div>
            <h2 className="text-lg font-semibold text-white">
              {session.title}
            </h2>
          </div>
          <div className="flex items-center space-x-4 text-white">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{participants}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{session.duration}</span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-2">
          {/* Instructor Video */}
          <div className="relative overflow-hidden bg-gray-800 rounded-lg">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="object-cover w-full h-full"
            />
            <div className="absolute px-2 py-1 text-sm text-white bg-black bg-opacity-50 rounded bottom-4 left-4">
              <User className="inline w-4 h-4 mr-1" />
              {mockBootcamp.instructor.name} (Instructor)
            </div>
          </div>

          {/* Your Video */}
          <div className="relative overflow-hidden bg-gray-800 rounded-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="object-cover w-full h-full"
            />
            <div className="absolute px-2 py-1 text-sm text-white bg-black bg-opacity-50 rounded bottom-4 left-4">
              You
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <VideoOff className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center px-6 py-4 space-x-4 bg-gray-800">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              isAudioOn ? "bg-gray-600" : "bg-red-600"
            } text-white hover:opacity-80`}
          >
            {isAudioOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              isVideoOn ? "bg-gray-600" : "bg-red-600"
            } text-white hover:opacity-80`}
          >
            {isVideoOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>

          {isInstructor && (
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full ${
                isRecording ? "bg-red-600" : "bg-gray-600"
              } text-white hover:opacity-80`}
            >
              {isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5 border-2 border-white rounded-full"></div>
              )}
            </button>
          )}

          <button className="p-3 text-white bg-gray-600 rounded-full hover:opacity-80">
            <Share2 className="w-5 h-5" />
          </button>

          <button className="p-3 text-white bg-gray-600 rounded-full hover:opacity-80">
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={leaveClass}
            className="p-3 text-white bg-red-600 rounded-full hover:opacity-80"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="flex flex-col bg-white border-l border-gray-200 w-80">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Live Chat</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-medium text-sm ${
                      msg.user === "Instructor"
                        ? "text-blue-600"
                        : "text-gray-800"
                    }`}
                  >
                    {msg.user}
                  </span>
                  <span className="text-xs text-gray-500">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{msg.message}</p>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed p-3 text-white bg-blue-600 rounded-full shadow-lg right-4 bottom-20 hover:bg-blue-700"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

// Main Bootcamp Component
const BootcampPage = () => {
  const [bootcamp] = useState(mockBootcamp);
  const [activeTab, setActiveTab] = useState("overview");
  const [isInLiveClass, setIsInLiveClass] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(
    null
  );

  const joinLiveClass = (session: LiveSession) => {
    setSelectedSession(session);
    setIsInLiveClass(true);
  };

  const leaveLiveClass = () => {
    setIsInLiveClass(false);
    setSelectedSession(null);
  };

  if (isInLiveClass && selectedSession) {
    return <LiveClassRoom session={selectedSession} onLeave={leaveLiveClass} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-white bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="container px-4 py-16 mx-auto">
          <div className="max-w-4xl">
            <h1 className="mb-4 text-4xl font-bold">{bootcamp.title}</h1>
            <p className="mb-6 text-xl text-blue-100">
              {bootcamp.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{bootcamp.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {bootcamp.schedule.days.join(", ")} at{" "}
                  {bootcamp.schedule.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{bootcamp.currentStudents} students enrolled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container px-4 mx-auto">
          <nav className="flex space-x-8">
            {["overview", "live-sessions", "curriculum", "discussions"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.replace("-", " ")}
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8 mx-auto">
        {activeTab === "live-sessions" && (
          <div className="max-w-4xl">
            <h2 className="mb-6 text-2xl font-bold">Live Sessions</h2>

            {/* Current Live Session */}
            <div className="p-6 mb-6 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2 space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-red-700">LIVE NOW</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {bootcamp.liveSessions[0].title}
                  </h3>
                  <p className="mb-4 text-gray-600">
                    {bootcamp.liveSessions[0].description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Duration: {bootcamp.liveSessions[0].duration}</span>
                    <span>Instructor: {bootcamp.instructor.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => joinLiveClass(bootcamp.liveSessions[0])}
                  className="px-6 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Join Live Session
                </button>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <h3 className="mb-4 text-lg font-semibold">Upcoming Sessions</h3>
            <div className="space-y-4">
              {bootcamp.liveSessions.slice(1).map((session) => (
                <div
                  key={session.id}
                  className="p-6 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="mb-2 font-semibold text-gray-900">
                        {session.title}
                      </h4>
                      <p className="mb-2 text-gray-600">
                        {session.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{session.date.toLocaleDateString()}</span>
                        <span>{session.duration}</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                      Set Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="max-w-4xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="mb-4 text-2xl font-bold">About This Bootcamp</h2>
                <p className="mb-6 text-gray-600">{bootcamp.description}</p>

                <h3 className="mb-4 text-xl font-semibold">Instructor</h3>
                <div className="flex items-center mb-8 space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 text-xl font-bold text-white bg-blue-500 rounded-full">
                    {bootcamp.instructor.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {bootcamp.instructor.name}
                    </h4>
                    <p className="text-gray-600">{bootcamp.instructor.bio}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky p-6 bg-white border border-gray-200 rounded-lg top-24">
                  <div className="mb-2 text-3xl font-bold text-gray-900">
                    ${bootcamp.price}
                  </div>
                  <div className="mb-6 text-gray-600">One-time payment</div>

                  <button className="w-full py-3 mb-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Enroll Now
                  </button>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{bootcamp.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">
                        {bootcamp.currentStudents}/{bootcamp.maxStudents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Schedule:</span>
                      <span className="font-medium">
                        {bootcamp.schedule.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BootcampPage;
