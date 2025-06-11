"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Minimize2, Maximize2 } from "lucide-react";
import { useVideoCallContext } from "@/shared/providers/VideoCallProvider";
import Image from "next/image";

// Add render counter for debugging
let renderCount = 0;

const GlobalVideoCallModal = React.memo(() => {
  renderCount++;
  const currentRenderCount = renderCount;

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
    syncRemoteStream,
  } = useVideoCallContext();

  const [isMinimized, setIsMinimized] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("🌍 GlobalVideoCallModal State:", {
      isInCall,
      isIncomingCall,
      callId,
      callerId,
      callerName,
      callType,
      isConnecting,
      timestamp: new Date().toISOString(),
    });
  }, [isInCall, isIncomingCall, callId, callerId, callerName, callType, isConnecting]);

  // Don't render if no active call states
  if (!isInCall && !isIncomingCall) {
    return null;
  }

  console.log(`🌍 GlobalVideoCallModal: Rendering (#${currentRenderCount})`);

  // Incoming call UI
  if (isIncomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
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
    const displayName = callerName || "Video Call";
    const showVideoPlaceholder = callType === "audio" || isVideoOff || !remoteStream;

    // Minimized floating window
    if (isMinimized) {
      return (
        <div className="fixed bottom-4 right-4 w-80 h-60 bg-black rounded-lg overflow-hidden shadow-2xl z-30 border-2 border-white border-opacity-20">
          {/* Header with controls */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
            <div className="bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm flex items-center gap-2">
              {isConnecting && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>}
              {callType === "video" ? "📹" : "📞"} {displayName}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 rounded flex items-center justify-center text-white"
                title="Maximize"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={endCall}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white"
                title="End call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video content */}
          {!showVideoPlaceholder ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
              <div className="text-center text-white">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
                </div>
                <p className="text-sm text-white text-opacity-80">
                  {callType === "audio" ? "Voice call" : isVideoOff ? "Video off" : "Connecting..."}
                </p>
              </div>
            </div>
          )}

          {/* Local video overlay for minimized */}
          {callType === "video" && (
            <div className="absolute bottom-2 right-2 w-20 h-15 bg-gray-800 rounded overflow-hidden">
              {!isVideoOff ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <VideoOff className="w-3 h-3 text-gray-400" />
                </div>
              )}
            </div>
          )}

          {/* Mini controls */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            <button
              onClick={toggleMute}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                isCallMuted ? "bg-red-500" : "bg-gray-600"
              }`}
            >
              {isCallMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                  isVideoOff ? "bg-red-500" : "bg-gray-600"
                }`}
              >
                {isVideoOff ? <VideoOff className="w-3 h-3" /> : <Video className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      );
    }

    // Full screen call UI
    return (
      <div className="fixed inset-0 bg-black z-30 flex flex-col">
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
                console.log("🌍 GlobalVideoCallModal: Remote video loaded");
              }}
              onError={(e) => {
                console.error("🌍 GlobalVideoCallModal: Remote video error:", e);
              }}
              onPlay={() => {
                console.log("🌍 GlobalVideoCallModal: Remote video started playing");
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
              <div className="text-center text-white">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-4xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
                </div>
                <h2 className="text-2xl font-semibold mb-2">{displayName}</h2>
                <p className="text-white text-opacity-80">
                  {callType === "audio"
                    ? "Voice call"
                    : isVideoOff
                      ? "Video off"
                      : isConnecting
                        ? "Connecting..."
                        : "Connected"}
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
                    console.log("🌍 GlobalVideoCallModal: Local video loaded");
                  }}
                  onError={(e) => {
                    console.error("🌍 GlobalVideoCallModal: Local video error:", e);
                  }}
                  onPlay={() => {
                    console.log("🌍 GlobalVideoCallModal: Local video started playing");
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          )}

          {/* Call info overlay with minimize button */}
          <div className="absolute top-4 left-4 text-white">
            <div className="bg-black bg-opacity-50 px-3 py-2 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                {isConnecting && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>}
                <p className="text-sm font-medium">
                  {callType === "video" ? "📹" : "📞"} {displayName}
                  {isConnecting && " - Connecting..."}
                </p>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-6 h-6 bg-white bg-opacity-20 hover:bg-opacity-30 rounded flex items-center justify-center"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
              {process.env.NODE_ENV === "development" && (
                <div className="text-xs text-gray-400 mt-1">
                  <p>Remote stream: {remoteStream ? "✓" : "✗"}</p>
                  <p>Local stream: {localStream ? "✓" : "✗"}</p>
                  {remoteStream && (
                    <p>
                      Remote tracks:{" "}
                      {remoteStream
                        .getTracks()
                        .map((t) => `${t.kind}(${t.readyState})`)
                        .join(", ")}
                    </p>
                  )}
                  {localStream && (
                    <p>
                      Local tracks:{" "}
                      {localStream
                        .getTracks()
                        .map((t) => `${t.kind}(${t.readyState})`)
                        .join(", ")}
                    </p>
                  )}
                  <p>Connection: {isConnecting ? "Connecting..." : "Connected"}</p>
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => {
                        console.log("🔧 DEBUG: Manually forcing connection resolution");
                        const synced = syncRemoteStream();
                        if (synced) {
                          console.log("🔧 DEBUG: Remote stream synced successfully");
                        } else {
                          console.log("🔧 DEBUG: No sync needed or failed");
                        }
                      }}
                      className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Sync Stream
                    </button>
                    {isConnecting && (
                      <button
                        onClick={() => {
                          console.log("🔧 DEBUG: Manually forcing connection resolution");
                          const synced = syncRemoteStream();
                          if (synced) {
                            console.log("🔧 DEBUG: Remote stream synced successfully");
                          } else {
                            console.log("🔧 DEBUG: No sync needed or failed");
                          }
                          // Force isConnecting to false if both streams exist
                          if (localStream && remoteStream) {
                            console.log("🔧 DEBUG: Forcing isConnecting to false - both streams available");
                            // This is not directly accessible from the modal, so we just log
                          }
                        }}
                        className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        Force Connect
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4 bg-gray-900 bg-opacity-80 rounded-full px-6 py-4 backdrop-blur-sm">
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isCallMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {isCallMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            <button
              onClick={endCall}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-700"
                }`}
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
});

export default GlobalVideoCallModal;
