"use client";

import React, { useEffect, useMemo } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useVideoCall } from "@/shared/hooks/use-video-call";
import Image from "next/image";

interface VoiceCallModalProps {
  receiverId?: string;
  receiverName?: string;
  conversationId?: string;
}

// Add render counter for debugging
let voiceRenderCount = 0;

const VoiceCallModal = React.memo(({ receiverId, receiverName, conversationId }: VoiceCallModalProps) => {
  voiceRenderCount++;
  const currentRenderCount = voiceRenderCount;

  const {
    isInCall,
    isIncomingCall,
    callId,
    callerId,
    callerName,
    callType,
    isCallMuted,
    localStream,
    remoteStream,
    isConnecting,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    // Debug states
    iceConnectionState,
    connectionState,
    iceCandidatesReceived,
    iceCandidatesSent,
    setIsConnecting,
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
  useEffect(() => {
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
  useEffect(() => {
    console.log("🎙️ VoiceCallModal State Change:", {
      isInCall,
      isIncomingCall,
      callId,
      callerId,
      callerName,
      callType,
      isConnecting,
      renderKey,
    });

    // Force re-render when state changes
    setRenderKey((prev) => prev + 1);
  }, [isInCall, isIncomingCall, callId, callerId, callerName, callType, isConnecting]);

  // Only show for audio calls or general calls - memoize this calculation
  const shouldRender = useMemo(() => {
    return (isInCall || isIncomingCall) && (callType === "audio" || !callType);
  }, [isInCall, isIncomingCall, callType]);

  console.log(`🎙️ VoiceCallModal Render Check (#${currentRenderCount}):`, {
    shouldRender,
    isInCall,
    isIncomingCall,
    callType,
    renderKey,
  });

  // Don't render if not voice call
  if (!shouldRender) {
    return null;
  }

  // Incoming voice call UI
  if (isIncomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl">
          <div className="mb-6">
            {/* Large circular avatar */}
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg">
              <Image
                src="/assets/images/sample-avatar.jpeg"
                alt={callerName || "Caller"}
                width={128}
                height={128}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml;base64,${btoa(`
                    <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
                      <rect width="128" height="128" fill="#e5e7eb"/>
                      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="48" fill="#6b7280">
                        ${(callerName || "U").charAt(0).toUpperCase()}
                      </text>
                    </svg>
                  `)}`;
                }}
              />
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {callerName || "Unknown Caller"}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">📞 Voice call incoming...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Ringing</span>
            </div>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={rejectCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Reject call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
            <button
              onClick={acceptCall}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Accept call"
            >
              <Phone className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active voice call UI
  if (isInCall) {
    const displayName = callerName || receiverName || "Voice Call";

    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex flex-col">
        {/* Connection status overlay */}
        {isConnecting && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center max-w-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-lg text-gray-700 dark:text-gray-300">Connecting...</span>
              </div>

              {/* DEBUG: Voice call debug info */}
              {process.env.NODE_ENV === "development" && (
                <div className="text-left text-xs space-y-1 bg-gray-100 dark:bg-gray-700 p-3 rounded mt-4">
                  <div className="font-bold text-sm mb-2">🎙️ Voice Call Debug:</div>

                  {/* Connection States */}
                  <div className="border-b pb-2 mb-2">
                    <div className="font-semibold text-xs mb-1">📊 Connection:</div>
                    <div>
                      WebRTC:{" "}
                      <span
                        className={`font-mono px-1 rounded text-xs ${
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
                        className={`font-mono px-1 rounded text-xs ${
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
                    {connectionState === "new" && iceConnectionState === "new" && (
                      <div className="text-red-600 text-xs mt-1">⚠️ WebRTC negotiation not started!</div>
                    )}
                  </div>

                  {/* Audio Status */}
                  <div className="border-b pb-2 mb-2">
                    <div className="font-semibold text-xs mb-1">🎵 Audio:</div>
                    <div>Local: {localStream ? `✅ ${localStream.getAudioTracks().length} tracks` : "❌ None"}</div>
                    <div>Remote: {remoteStream ? `✅ ${remoteStream.getAudioTracks().length} tracks` : "❌ None"}</div>
                    <div>
                      Candidates: {iceCandidatesSent}→{iceCandidatesReceived}
                    </div>
                    {iceCandidatesSent === 0 && iceCandidatesReceived === 0 && (
                      <div className="text-red-600 text-xs mt-1">⚠️ No ICE candidates exchanged!</div>
                    )}
                  </div>

                  {/* Call Flow Status */}
                  <div className="border-b pb-2 mb-2">
                    <div className="font-semibold text-xs mb-1">📞 Call Flow:</div>
                    <div>Call ID: {callId ? `✅ ${callId.substring(0, 10)}...` : "❌ Missing"}</div>
                    <div>Call Type: {callType || "❌ Missing"}</div>
                    <div>In Call: {isInCall ? "✅ Yes" : "❌ No"}</div>
                    <div>Connecting: {isConnecting ? "🔄 Yes" : "✅ No"}</div>
                  </div>

                  {/* Troubleshooting */}
                  {connectionState === "new" && (
                    <div className="border-b pb-2 mb-2">
                      <div className="font-semibold text-xs mb-1 text-red-600">🚨 Diagnosis:</div>
                      <div className="text-xs text-red-600 space-y-1">
                        <div>• WebRTC negotiation hasn't started</div>
                        <div>• Check if "receiverReady" signal was sent</div>
                        <div>• Verify backend is running and forwarding messages</div>
                        <div>• Both users should be authenticated and connected</div>
                      </div>
                    </div>
                  )}

                  {/* Recent Errors */}
                  {recentErrors.length > 0 && (
                    <div className="border-b pb-2 mb-2">
                      <div className="font-semibold text-xs mb-1 text-red-600">🚨 Errors:</div>
                      <div className="max-h-12 overflow-y-auto text-xs text-red-600 space-y-1">
                        {recentErrors.map((error, index) => (
                          <div key={index} className="break-words">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        console.log("🎙️ Voice Debug:", {
                          connectionState,
                          iceConnectionState,
                          localStream: !!localStream,
                          remoteStream: !!remoteStream,
                          callId,
                          callType,
                          isInCall,
                          isConnecting,
                        })
                      }
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                    >
                      📋 Log
                    </button>
                    <button
                      onClick={() => setRecentErrors([])}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                    >
                      🗑️ Clear
                    </button>
                    {connectionState === "new" && (
                      <button
                        onClick={() => {
                          console.log("🔧 Manual WebRTC troubleshoot triggered");
                          alert(
                            `Troubleshooting:\n1. Check backend console for socket events\n2. Verify both users are connected\n3. Check browser console for errors\n4. Try refreshing both tabs`,
                          );
                        }}
                        className="px-2 py-1 bg-orange-500 text-white text-xs rounded"
                      >
                        🔧 Help
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main voice call interface */}
        <div className="flex-1 flex flex-col items-center justify-center text-white p-8">
          {/* Large avatar */}
          <div className="w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden bg-white bg-opacity-20 shadow-2xl">
            <Image
              src="/assets/images/sample-avatar.jpeg"
              alt={displayName}
              width={192}
              height={192}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `data:image/svg+xml;base64,${btoa(`
                  <svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
                    <rect width="192" height="192" fill="#ffffff" fill-opacity="0.3"/>
                    <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="72" fill="#ffffff">
                      ${displayName.charAt(0).toUpperCase()}
                    </text>
                  </svg>
                `)}`;
              }}
            />
          </div>

          {/* Call info */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold mb-2">{displayName}</h2>
            <div className="flex items-center justify-center gap-3 text-lg text-white text-opacity-80">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnecting ? "bg-yellow-400 animate-pulse" : remoteStream ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span>{isConnecting ? "Connecting..." : remoteStream ? "Connected" : "Connection lost"}</span>
              </div>
            </div>

            {/* Enhanced connection status */}
            <div className="mt-4 flex flex-col items-center gap-2 text-sm text-white text-opacity-60">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Mic className={`w-4 h-4 ${isCallMuted ? "text-red-400" : "text-green-400"}`} />
                  <span>{isCallMuted ? "Muted" : "Microphone on"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${localStream ? "bg-green-400" : "bg-red-400"}`}></div>
                  <span>Local audio: {localStream ? "Ready" : "Not ready"}</span>
                </div>
              </div>

              {/* Detailed connection info */}
              <div className="text-xs text-white text-opacity-40 mt-2">
                WebRTC: {connectionState} | ICE: {iceConnectionState}
                {iceCandidatesReceived > 0 && (
                  <span>
                    {" "}
                    | Candidates: {iceCandidatesSent}→{iceCandidatesReceived}
                  </span>
                )}
              </div>

              {/* Test mode indicator for single machine testing */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-2 text-xs bg-yellow-600 bg-opacity-50 px-2 py-1 rounded">
                  💡 Single Machine Test: Use 2 tabs with different users
                </div>
              )}
            </div>
          </div>

          {/* Audio level indicators (visual feedback) */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-8 rounded-full ${
                  remoteStream && !isConnecting ? "bg-green-400 animate-pulse" : "bg-white bg-opacity-20"
                }`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: remoteStream && !isConnecting ? `${20 + Math.random() * 20}px` : "8px",
                }}
              />
            ))}
          </div>

          {/* Call duration (if connected) */}
          {remoteStream && !isConnecting && (
            <div className="text-lg text-white text-opacity-60 mb-8">
              <CallTimer />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-6 bg-black bg-opacity-30 rounded-full px-8 py-4 backdrop-blur-sm">
            {/* Mute button */}
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isCallMuted ? "bg-red-500 hover:bg-red-600" : "bg-white bg-opacity-20 hover:bg-opacity-30"
              }`}
              title={isCallMuted ? "Unmute" : "Mute"}
            >
              {isCallMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </button>

            {/* End call button */}
            <button
              onClick={endCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              title="End call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>

          {/* Debug controls for development */}
          {process.env.NODE_ENV === "development" && isConnecting && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => {
                  console.log("🎙️ Manual connection resolve triggered");
                  setIsConnecting(false);
                }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-full transition-colors"
                title="Force resolve connection for testing"
              >
                🔧 Force Connect
              </button>
            </div>
          )}

          {/* Audio recovery controls */}
          {process.env.NODE_ENV === "development" && !isConnecting && isInCall && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => {
                  console.log("🔄 Manual stream refresh triggered");
                  // Import syncRemoteStream if available
                  const { syncRemoteStream } = require("@/shared/hooks/use-video-call");
                  if (syncRemoteStream) {
                    syncRemoteStream();
                  }
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-colors"
                title="Try to recover remote audio"
              >
                🔄 Fix Audio
              </button>

              <button
                onClick={() => {
                  console.log("📊 Call state debug triggered");
                  console.table({
                    localStream: !!localStream,
                    remoteStream: !!remoteStream,
                    connectionState,
                    iceConnectionState,
                    candidates: `${iceCandidatesSent}→${iceCandidatesReceived}`,
                  });
                }}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-full transition-colors"
                title="Debug call state"
              >
                📊 Debug
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
});

// Simple call timer component
function CallTimer() {
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return <span>{formatDuration(duration)}</span>;
}

export default VoiceCallModal;
