"use client";

import React, { createContext, useContext } from "react";
import { useVideoCall } from "@/shared/hooks/use-video-call";
import GlobalVideoCallModal from "@/app/message/_components/GlobalVideoCallModal";
import VoiceCallModal from "@/app/message/_components/VoiceCallModal";

interface VideoCallContextType {
  isInCall: boolean;
  isIncomingCall: boolean;
  callId: string | null;
  callerId: string | null;
  callerName: string | null;
  callType: "video" | "audio" | null;
  isCallMuted: boolean;
  isVideoOff: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  initiateCall: (receiverId: string, receiverName: string, conversationId: string, callType: "video" | "audio") => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  syncRemoteStream: () => boolean; // Make sure this is available
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export function VideoCallProvider({ children }: { children: React.ReactNode }) {
  const videoCallHook = useVideoCall();

  return (
    <VideoCallContext.Provider value={videoCallHook}>
      {children}
      {/* Global video call modal that shows on any page */}
      <GlobalVideoCallModal />
      <VoiceCallModal />
    </VideoCallContext.Provider>
  );
}

export function useVideoCallContext() {
  const context = useContext(VideoCallContext);
  if (context === undefined) {
    throw new Error("useVideoCallContext must be used within a VideoCallProvider");
  }
  return context;
}

// Standalone component for call buttons that can be used anywhere
export function VideoCallButton({
  receiverId,
  receiverName,
  conversationId,
  callType = "video",
}: {
  receiverId: string;
  receiverName: string;
  conversationId: string;
  callType?: "video" | "audio";
}) {
  const { initiateCall, isInCall, isIncomingCall } = useVideoCallContext();

  const handleCall = () => {
    if (isInCall || isIncomingCall) {
      console.log("Call already in progress");
      return;
    }
    console.log("🚀 Initiating call from VideoCallButton (Provider):", { receiverId, receiverName, callType });
    initiateCall(receiverId, receiverName, conversationId, callType);
  };

  const isDisabled = isInCall || isIncomingCall;

  return (
    <button
      onClick={handleCall}
      disabled={isDisabled}
      className={`p-2 rounded-full transition-colors ${
        isDisabled
          ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      title={isDisabled ? "Call in progress" : `Start ${callType} call`}
    >
      {callType === "video" ? (
        <svg
          className={`w-5 h-5 ${isDisabled ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ) : (
        <svg
          className={`w-5 h-5 ${isDisabled ? "text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      )}
    </button>
  );
}
