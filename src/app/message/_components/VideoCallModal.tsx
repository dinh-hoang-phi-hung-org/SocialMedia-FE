"use client";

import React from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { useVideoCall } from "@/shared/hooks/use-video-call";
import Image from "next/image";

interface VideoCallModalProps {
  receiverId?: string;
  receiverName?: string;
  conversationId?: string;
}

export default function VideoCallModal({ receiverId, receiverName, conversationId }: VideoCallModalProps) {
  const {
    isInCall,
    isIncomingCall,
    callId,
    callerId,
    callerName,
    callType,
    isCallMuted,
    isVideoOff,
    localVideoRef,
    remoteVideoRef,
    isConnecting,
    remoteStream,
    localStream,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    setIsConnecting,
    syncRemoteStream,
    // Debug states
    iceConnectionState,
    connectionState,
    iceCandidatesReceived,
    iceCandidatesSent,
  } = useVideoCall();

  // Force re-render when call states change
  const [renderKey, setRenderKey] = React.useState(0);
  const [recentErrors, setRecentErrors] = React.useState<string[]>([]);

  // Function to track errors
  const trackError = React.useCallback((error: string) => {
    setRecentErrors((prev) => {
      const newErrors = [...prev, `${new Date().toLocaleTimeString()}: ${error}`];
      return newErrors.slice(-5); // Keep last 5 errors
    });
  }, []);

  // Monitor for recovery attempts and errors
  React.useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      const errorStr = args.join(" ");
      if (
        errorStr.includes("Failed to recreate") ||
        errorStr.includes("attempting recovery") ||
        errorStr.includes("WebRTC")
      ) {
        trackError(errorStr.substring(0, 100));
      }
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [trackError]);

  // Debug logging with immediate re-render trigger
  React.useEffect(() => {
    console.log("🎬 VideoCallModal State Change:", {
      isInCall,
      isIncomingCall,
      callId,
      callerId,
      callerName,
      callType,
      isConnecting,
      timestamp: new Date().toISOString(),
      receiverId: receiverId,
      receiverName: receiverName,
    });

    // Force re-render when state changes
    setRenderKey((prev) => prev + 1);
  }, [isInCall, isIncomingCall, callId, callerId, callerName, callType, isConnecting]);

  // Check render condition
  const shouldRender = isInCall || isIncomingCall;

  console.log("🎭 VideoCallModal Render Check:", {
    shouldRender,
    isInCall,
    isIncomingCall,
    renderKey,
    callId,
    component: `Modal-${receiverId}`, // Track which modal instance
  });

  // ALWAYS render debug info when in development and there's any call activity
  const debugMode = process.env.NODE_ENV === "development";
  if (debugMode && (isInCall || isIncomingCall || callId)) {
    console.log("🚨 DEBUG: Showing debug modal - Call activity detected");
    return (
      <div className="fixed inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl">
          <h2 className="text-xl font-bold mb-4">DEBUG MODAL ({receiverId})</h2>
          <div className="text-left space-y-1">
            <p>
              <strong>isInCall:</strong> {isInCall.toString()}
            </p>
            <p>
              <strong>isIncomingCall:</strong> {isIncomingCall.toString()}
            </p>
            <p>
              <strong>callId:</strong> {callId || "null"}
            </p>
            <p>
              <strong>callerId:</strong> {callerId || "null"}
            </p>
            <p>
              <strong>callerName:</strong> {callerName || "null"}
            </p>
            <p>
              <strong>callType:</strong> {callType || "null"}
            </p>
            <p>
              <strong>isConnecting:</strong> {isConnecting.toString()}
            </p>
            <p>
              <strong>localStream:</strong> {localStream ? "✓" : "✗"}
            </p>
            <p>
              <strong>remoteStream:</strong> {remoteStream ? "✓" : "✗"}
            </p>
            <p>
              <strong>renderKey:</strong> {renderKey}
            </p>
          </div>
          <button onClick={endCall} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
            End Call
          </button>
        </div>
      </div>
    );
  }

  // Don't render if no active call states
  if (!shouldRender) {
    return null;
  }

  console.log("VideoCallModal: Rendering with state:", {
    isInCall,
    isIncomingCall,
    callId,
    callType,
    isConnecting,
    remoteStream: !!remoteStream,
    localStream: !!localStream,
  });

  // Incoming call UI
  if (isIncomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <Image
                src="/assets/images/sample-avatar.jpeg"
                alt={callerName || "Caller"}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a default avatar or initials
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml;base64,${btoa(`
                    <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
                      <rect width="96" height="96" fill="#e5e7eb"/>
                      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="36" fill="#6b7280">
                        ${(callerName || "U").charAt(0).toUpperCase()}
                      </text>
                    </svg>
                  `)}`;
                }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {callerName || "Unknown Caller"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {callType === "video" ? "Video" : "Voice"} call incoming...
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={rejectCall}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              title="Reject call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={acceptCall}
              className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              title="Accept call"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active call UI
  if (isInCall) {
    const displayName = callerName || receiverName || "Video Call";
    const showVideoPlaceholder = callType === "audio" || isVideoOff || !remoteStream;

    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Connection status overlay */}
        {isConnecting && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center max-w-md">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Connecting...</p>

              {/* DEBUG: Realtime connection info */}
              {process.env.NODE_ENV === "development" && (
                <div className="text-left text-xs space-y-1 bg-gray-100 dark:bg-gray-700 p-3 rounded mt-4">
                  <div className="font-bold text-sm mb-2">🔍 Connection Debug:</div>

                  {/* Connection States */}
                  <div className="border-b pb-2 mb-2">
                    <div className="font-semibold text-xs mb-1">📊 Connection States:</div>
                    <div>
                      Connection:{" "}
                      <span
                        className={`font-mono px-1 rounded ${
                          connectionState === "connected"
                            ? "bg-green-200 text-green-800"
                            : connectionState === "connecting"
                              ? "bg-yellow-200 text-yellow-800"
                              : connectionState === "failed"
                                ? "bg-red-200 text-red-800"
                                : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {connectionState}
                      </span>
                    </div>
                    <div>
                      ICE:{" "}
                      <span
                        className={`font-mono px-1 rounded ${
                          iceConnectionState === "connected" || iceConnectionState === "completed"
                            ? "bg-green-200 text-green-800"
                            : iceConnectionState === "checking"
                              ? "bg-yellow-200 text-yellow-800"
                              : iceConnectionState === "failed"
                                ? "bg-red-200 text-red-800"
                                : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {iceConnectionState}
                      </span>
                    </div>
                  </div>

                  {/* ICE Candidates */}
                  <div className="border-b pb-2 mb-2">
                    <div className="font-semibold text-xs mb-1">🧊 ICE Candidates:</div>
                    <div>
                      Sent: <span className="font-mono text-blue-600">{iceCandidatesSent}</span>
                    </div>
                    <div>
                      Received: <span className="font-mono text-green-600">{iceCandidatesReceived}</span>
                    </div>
                  </div>

                  {/* Streams */}
                  <div className="border-b pb-2 mb-2">
                    <div className="font-semibold text-xs mb-1">🎥 Streams:</div>
                    <div>Local Stream: {localStream ? `✅ ${localStream.getTracks().length} tracks` : "❌ None"}</div>
                    <div>
                      Remote Stream: {remoteStream ? `✅ ${remoteStream.getTracks().length} tracks` : "❌ None"}
                    </div>
                  </div>

                  {/* Video Elements */}
                  <div className="border-b pb-2 mb-2">
                    <div className="font-semibold text-xs mb-1">📺 Video Elements:</div>
                    <div>Local Video: {localVideoRef.current?.srcObject ? "✅ Set" : "❌ Not set"}</div>
                    <div>Remote Video: {remoteVideoRef.current?.srcObject ? "✅ Set" : "❌ Not set"}</div>
                    <div>
                      Remote Playing:{" "}
                      {remoteVideoRef.current &&
                      remoteVideoRef.current.srcObject &&
                      !remoteVideoRef.current.paused &&
                      remoteVideoRef.current.readyState >= 2
                        ? "✅ Yes"
                        : "❌ No"}
                    </div>
                    {remoteVideoRef.current && (
                      <div>
                        Remote ReadyState: <span className="font-mono">{remoteVideoRef.current.readyState}</span>
                      </div>
                    )}
                  </div>

                  {/* Call Info */}
                  <div className="mb-2">
                    <div className="font-semibold text-xs mb-1">📞 Call Info:</div>
                    <div>Type: {callType || "unknown"}</div>
                    <div>
                      ID: <span className="font-mono text-xs">{callId || "none"}</span>
                    </div>
                  </div>

                  {/* Recent Errors */}
                  {recentErrors.length > 0 && (
                    <div className="border-b pb-2 mb-2">
                      <div className="font-semibold text-xs mb-1 text-red-600">🚨 Recent Errors:</div>
                      <div className="max-h-16 overflow-y-auto text-xs text-red-600 space-y-1 bg-red-50 dark:bg-red-900 p-2 rounded">
                        {recentErrors.map((error, index) => (
                          <div key={index} className="break-words">
                            {error}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setRecentErrors([])}
                        className="mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Clear Errors
                      </button>
                    </div>
                  )}

                  {/* Manual controls */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setIsConnecting(false)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      🚀 Force Resolve
                    </button>

                    <button
                      onClick={syncRemoteStream}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      🔄 Sync Stream
                    </button>

                    <button
                      onClick={() =>
                        console.log("🔍 Manual Debug Check", {
                          connectionState,
                          iceConnectionState,
                          localStream: !!localStream,
                          remoteStream: !!remoteStream,
                          iceCandidatesSent,
                          iceCandidatesReceived,
                          remoteVideoPlaying: remoteVideoRef.current && !remoteVideoRef.current.paused,
                        })
                      }
                      className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                    >
                      🔍 Log State
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video container */}
        <div className="flex-1 relative">
          {/* Remote video (main) or placeholder */}
          {!showVideoPlaceholder ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-gray-900"
              onLoadedMetadata={() => {
                console.log("Remote video loaded and ready to play");
              }}
              onError={(e) => {
                console.error("Remote video error:", e);
              }}
            />
          ) : (
            // Video placeholder
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
              <div className="text-center text-white">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/assets/images/sample-avatar.jpeg"
                    alt={displayName}
                    width={80}
                    height={80}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
                          <rect width="80" height="80" fill="#ffffff" fill-opacity="0.3"/>
                          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="30" fill="#ffffff">
                            ${displayName.charAt(0).toUpperCase()}
                          </text>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
                <h2 className="text-2xl font-semibold mb-2">{displayName}</h2>
                <p className="text-white text-opacity-80">
                  {callType === "audio"
                    ? "Voice call"
                    : isVideoOff
                      ? "Video off"
                      : isConnecting
                        ? "Connecting..."
                        : "Waiting for video..."}
                </p>
              </div>
            </div>
          )}

          {/* Local video (picture-in-picture) */}
          {callType === "video" && (
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white border-opacity-20">
              {!isVideoOff ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => {
                    console.log("Local video loaded");
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          )}

          {/* Call info overlay */}
          <div className="absolute top-4 left-4 text-white">
            <div className="bg-black bg-opacity-50 px-3 py-2 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium">
                {callType === "video" ? "📹" : "📞"} {displayName}
              </p>
              {isConnecting && <p className="text-xs text-gray-300">Connecting...</p>}
              {process.env.NODE_ENV === "development" && (
                <div className="text-xs text-gray-400 mt-1">
                  <p>Remote stream: {remoteStream ? "✓" : "✗"}</p>
                  <p>Local stream: {localStream ? "✓" : "✗"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4 bg-gray-900 bg-opacity-80 rounded-full px-6 py-4 backdrop-blur-sm">
            {/* Mute button */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isCallMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"
              }`}
              title={isCallMuted ? "Unmute" : "Mute"}
            >
              {isCallMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            {/* End call button */}
            <button
              onClick={endCall}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Video toggle button (only for video calls) */}
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"
                }`}
                title={isVideoOff ? "Turn on video" : "Turn off video"}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
