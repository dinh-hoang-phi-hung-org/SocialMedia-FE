"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSocket } from "./use-socket";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import React from "react";

interface VideoCallHookReturn {
  // States
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

  // Debug states
  iceConnectionState: string;
  connectionState: string;
  iceCandidatesReceived: number;
  iceCandidatesSent: number;

  // Refs for video elements
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;

  // Actions
  initiateCall: (receiverId: string, receiverName: string, conversationId: string, callType: "video" | "audio") => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  syncRemoteStream: () => boolean;
  // Debug functions
  setIsConnecting: (connecting: boolean) => void;
}

// WebRTC configuration
const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    // Add additional public STUN servers for better connectivity
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:openrelay.metered.ca:80" },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: "max-bundle" as RTCBundlePolicy,
  rtcpMuxPolicy: "require" as RTCRtcpMuxPolicy,
};

export const useVideoCall = (): VideoCallHookReturn => {
  const { socket, isConnected } = useSocket();

  // States
  const [isInCall, setIsInCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [callerId, setCallerId] = useState<string | null>(null);
  const [callerName, setCallerName] = useState<string | null>(null);
  const [callType, setCallType] = useState<"video" | "audio" | null>(null);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Debug states for tracking connection progress
  const [iceConnectionState, setIceConnectionState] = useState<string>("new");
  const [connectionState, setConnectionState] = useState<string>("new");
  const [iceCandidatesReceived, setIceCandidatesReceived] = useState(0);
  const [iceCandidatesSent, setIceCandidatesSent] = useState(0);

  // Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const currentCallId = useRef<string | null>(null);
  const remoteParticipantId = useRef<string | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null); // Backup ref for remote stream

  // Protection mechanism: Store peer connection in multiple places to prevent loss
  const peerConnectionBackupRef = useRef<RTCPeerConnection | null>(null);

  // Function to safely set peer connection with backup
  const setPeerConnection = useCallback((peerConnection: RTCPeerConnection | null) => {
    peerConnectionRef.current = peerConnection;
    peerConnectionBackupRef.current = peerConnection;

    if (peerConnection) {
      console.log("🔒 Peer connection set with backup protection");
    } else {
      console.log("🔒 Peer connection cleared from both refs");
    }
  }, []);

  // Function to safely get peer connection with fallback
  const getPeerConnection = useCallback(() => {
    const primary = peerConnectionRef.current;
    const backup = peerConnectionBackupRef.current;

    if (primary) {
      return primary;
    } else if (backup) {
      console.log("🔧 Using backup peer connection reference");
      peerConnectionRef.current = backup; // Restore primary
      return backup;
    }

    return null;
  }, []);

  // Debug state changes
  React.useEffect(() => {
    console.log("📞 Call State Changed:", {
      isInCall,
      isIncomingCall,
      callId,
      callerId,
      callerName,
      callType,
      isConnecting,
      currentCallId: currentCallId.current,
      remoteParticipantId: remoteParticipantId.current,
      hasPeerConnection: !!peerConnectionRef.current,
      hasLocalStream: !!localStream,
      hasRemoteStream: !!remoteStream,
    });

    // Periodic WebRTC status check when connecting
    if (isConnecting && peerConnectionRef.current) {
      const statusInterval = setInterval(() => {
        console.log("🔄 WebRTC Status Check:", {
          connectionState: peerConnectionRef.current?.connectionState,
          iceConnectionState: peerConnectionRef.current?.iceConnectionState,
          iceGatheringState: peerConnectionRef.current?.iceGatheringState,
          signalingState: peerConnectionRef.current?.signalingState,
          localDescription: !!peerConnectionRef.current?.localDescription,
          remoteDescription: !!peerConnectionRef.current?.remoteDescription,
          localStreamTracks: localStream?.getTracks().length || 0,
          remoteStreamTracks: remoteStream?.getTracks().length || 0,
          isRemoteVideoPlaying: remoteVideoRef.current && !remoteVideoRef.current.paused,
        });
      }, 2000);

      return () => clearInterval(statusInterval);
    }
  }, [isInCall, isIncomingCall, callId, callerId, callerName, callType, isConnecting, localStream, remoteStream]);

  // Debug remote stream state changes specifically
  React.useEffect(() => {
    console.log("🎥 Remote Stream State Changed:", {
      hasRemoteStream: !!remoteStream,
      streamId: remoteStream?.id,
      isActive: remoteStream?.active,
      trackCount: remoteStream?.getTracks().length,
      videoTracks: remoteStream?.getVideoTracks().length,
      audioTracks: remoteStream?.getAudioTracks().length,
      tracks: remoteStream
        ?.getTracks()
        .map((t) => `${t.kind}: ${t.label || "unlabeled"} (enabled: ${t.enabled}, readyState: ${t.readyState})`),
    });

    // Auto-fix: If we're in a call but missing remote stream, try to sync
    if (isInCall && !remoteStream && peerConnectionRef.current) {
      console.log("🔧 Auto-fix: Missing remote stream during call, attempting sync...");
      setTimeout(() => {
        // Call syncRemoteStream manually to avoid dependency issues
        console.log("🔧 Auto-fix sync triggered");
        if (remoteStreamRef.current) {
          setRemoteStream(remoteStreamRef.current);
        }
      }, 1000);
    }
  }, [remoteStream, isInCall]);

  // Check for sync issues between remote stream state and ref
  React.useEffect(() => {
    if (remoteStreamRef.current && !remoteStream) {
      console.log("🔧 Remote stream ref exists but state is null - syncing...");
      setRemoteStream(remoteStreamRef.current);
    } else if (!remoteStreamRef.current && remoteStream) {
      console.log("🔧 Remote stream state exists but ref is null - syncing ref...");
      remoteStreamRef.current = remoteStream;
    }
  }, [remoteStream]);

  // Function to manually sync remote stream
  const syncRemoteStream = useCallback(() => {
    console.log("🔧 Manual sync triggered");
    console.log("🔧 Remote stream ref:", remoteStreamRef.current);
    console.log("🔧 Remote stream state:", remoteStream);

    if (remoteStreamRef.current && !remoteStream) {
      console.log("🔧 Manual sync: Setting remote stream from ref");
      setRemoteStream(remoteStreamRef.current);
      return true;
    } else if (remoteStreamRef.current && remoteStream) {
      console.log("🔧 Both ref and state exist, forcing video element update");
      if (remoteVideoRef.current && remoteStreamRef.current) {
        // Only update if srcObject is different to avoid AbortError
        if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
          console.log("🔧 Updating video srcObject");
          remoteVideoRef.current.srcObject = remoteStreamRef.current;

          // Play video only if it's not already playing
          if (remoteVideoRef.current.paused) {
            remoteVideoRef.current.play().catch((error) => {
              console.log("🔧 Video play failed (normal during updates):", error.name);
            });
          }
        } else {
          console.log("🔧 Video srcObject already correct, no update needed");
        }
      }
      return true;
    } else if (peerConnectionRef.current) {
      console.log("🔧 Checking peer connection for remote streams");
      const receivers = peerConnectionRef.current.getReceivers();
      console.log("🔧 Receivers:", receivers.length);

      for (const receiver of receivers) {
        if (receiver.track && receiver.track.readyState === "live") {
          console.log("🔧 Found live track:", receiver.track.kind);
          // Try to reconstruct stream from tracks
          const tracks = receivers.filter((r) => r.track && r.track.readyState === "live").map((r) => r.track);

          if (tracks.length > 0) {
            const newStream = new MediaStream(tracks);
            console.log("🔧 Created new stream from tracks:", newStream.id);
            setRemoteStream(newStream);
            remoteStreamRef.current = newStream;

            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = newStream;
              if (remoteVideoRef.current.paused) {
                remoteVideoRef.current.play().catch((error) => {
                  console.log("🔧 New stream play failed:", error.name);
                });
              }
            }
            return true;
          }
        }
      }
    }

    console.log("🔧 No remote stream to sync");
    return false;
  }, [remoteStream]);

  // End call - defined early to avoid dependency issues
  const endCall = useCallback(() => {
    console.log("endCall triggered. Current state:", { isInCall, isIncomingCall, callId: currentCallId.current });

    if (socket && currentCallId.current) {
      socket.emit("endVideoCall", {
        callId: currentCallId.current,
        participantId: authProvider.getUserUuid(),
      });
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      setPeerConnection(null);
    }

    // Clear connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Reset video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset states
    setIsInCall(false);
    setIsIncomingCall(false);
    setCallId(null);
    setCallerId(null);
    setCallerName(null);
    setCallType(null);
    setRemoteStream(null);
    remoteStreamRef.current = null; // Clear remote stream ref
    setIsCallMuted(false);
    setIsVideoOff(false);
    setIsConnecting(false);
    currentCallId.current = null;
    remoteParticipantId.current = null;

    // Reset debug states
    setIceConnectionState("new");
    setConnectionState("new");
    setIceCandidatesReceived(0);
    setIceCandidatesSent(0);

    console.log("Call ended and all states reset");
  }, [socket, localStream, isInCall, isIncomingCall]);

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    try {
      console.log("Creating new RTCPeerConnection...");
      const peerConnection = new RTCPeerConnection(rtcConfig);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket && currentCallId.current && remoteParticipantId.current) {
          console.log("🧊 Sending ICE candidate:", {
            type: event.candidate.type,
            candidate: event.candidate.candidate?.substring(0, 50) + "...",
            component: event.candidate.component,
            foundation: event.candidate.foundation,
            priority: event.candidate.priority,
            protocol: event.candidate.protocol,
            port: event.candidate.port,
          });

          setIceCandidatesSent((prev) => prev + 1);

          socket.emit("webrtcIceCandidate", {
            callId: currentCallId.current,
            candidate: event.candidate,
            from: authProvider.getUserUuid(),
            to: remoteParticipantId.current,
          });
        } else if (!event.candidate) {
          console.log("🧊 ICE gathering completed - all candidates sent");
        }
      };

      peerConnection.ontrack = (event) => {
        console.log(
          "🎥 Received remote stream with tracks:",
          event.streams[0].getTracks().map((t) => t.kind),
        );
        const stream = event.streams[0];
        console.log("🎥 Setting remote stream state...");
        console.log("🎥 Stream details:", {
          id: stream.id,
          active: stream.active,
          tracks: stream.getTracks().length,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          trackDetails: stream.getTracks().map((t) => ({
            kind: t.kind,
            enabled: t.enabled,
            readyState: t.readyState,
            id: t.id,
          })),
        });

        // Enhanced track monitoring for voice calls
        stream.getTracks().forEach((track, index) => {
          console.log(`🎵 Track ${index}:`, {
            kind: track.kind,
            enabled: track.enabled,
            readyState: track.readyState,
            id: track.id,
            label: track.label,
          });

          // Monitor track state changes
          track.onended = () => {
            console.error(`❌ Remote ${track.kind} track ended unexpectedly!`, {
              trackId: track.id,
              trackLabel: track.label,
              streamId: stream.id,
              streamActive: stream.active,
              remainingTracks: stream.getTracks().filter((t) => t.readyState === "live").length,
            });

            // For voice calls, if audio track ends, try to recover
            if (track.kind === "audio" && callType === "audio") {
              console.log("🔄 Attempting to recover ended audio track...");

              // Check if stream still has other live tracks
              const liveTracks = stream.getTracks().filter((t) => t.readyState === "live");
              if (liveTracks.length === 0) {
                console.log("🔄 All tracks ended - requesting stream refresh from peer");

                // Request the other peer to refresh their stream
                if (socket && currentCallId.current && remoteParticipantId.current) {
                  socket.emit("requestStreamRefresh", {
                    callId: currentCallId.current,
                    from: authProvider.getUserUuid(),
                    to: remoteParticipantId.current,
                  });
                }
              }
            }
          };

          track.onmute = () => {
            console.log(`🔇 Remote ${track.kind} track muted`);
          };

          track.onunmute = () => {
            console.log(`🔊 Remote ${track.kind} track unmuted`);
          };
        });

        // Force immediate state update
        console.log("🎥 About to call setRemoteStream with stream:", stream.id);
        setRemoteStream(stream);
        remoteStreamRef.current = stream; // Also store in ref as backup
        console.log("🎥 setRemoteStream called successfully and stored in ref");

        // Enhanced video element update with better error handling
        const updateVideoElement = () => {
          if (remoteVideoRef.current) {
            console.log("🎥 Setting remote video srcObject immediately");

            // Remove any existing event listeners to prevent conflicts
            remoteVideoRef.current.onloadedmetadata = null;
            remoteVideoRef.current.onplay = null;
            remoteVideoRef.current.oncanplay = null;

            remoteVideoRef.current.srcObject = stream;

            // Enhanced event handling
            remoteVideoRef.current.onloadedmetadata = () => {
              console.log("🎥 Remote video metadata loaded");
              console.log("🎥 Video element state:", {
                readyState: remoteVideoRef.current?.readyState,
                videoWidth: remoteVideoRef.current?.videoWidth,
                videoHeight: remoteVideoRef.current?.videoHeight,
                duration: remoteVideoRef.current?.duration,
              });

              remoteVideoRef.current
                ?.play()
                .then(() => {
                  console.log("🎥 Remote video play successful");
                  // Force connection resolution when video actually plays
                  setTimeout(() => {
                    if (isConnecting) {
                      console.log("🎥 Video playing - auto-resolving connection");
                      setIsConnecting(false);
                    }
                  }, 1000);
                })
                .catch((error) => {
                  console.error("🎥 Remote video play failed:", error);
                });
            };

            remoteVideoRef.current.oncanplay = () => {
              console.log("🎥 Remote video can play");
              // Additional trigger for connection resolution
              setTimeout(() => {
                if (isConnecting && remoteVideoRef.current && !remoteVideoRef.current.paused) {
                  console.log("🎥 Video can play and not paused - auto-resolving connection");
                  setIsConnecting(false);
                }
              }, 500);
            };

            remoteVideoRef.current.onplay = () => {
              console.log("🎥 Remote video started playing - auto-resolving connection");
              if (isConnecting) {
                setIsConnecting(false);
              }
            };

            // Try to play immediately
            remoteVideoRef.current.play().catch((error) => {
              console.log("🎥 Initial remote video play failed, will retry on events:", error.name);
            });
          } else {
            console.log("🎥 Remote video ref not ready yet");
          }
        };

        // Update video element immediately
        updateVideoElement();

        // Multiple sync attempts to ensure state consistency
        setTimeout(() => {
          console.log("🎥 Forcing state sync after 100ms");
          setRemoteStream(stream);
          updateVideoElement();
        }, 100);

        setTimeout(() => {
          console.log("🎥 Forcing final state sync after 500ms");
          setRemoteStream(stream);
          updateVideoElement();

          // Additional connection resolution check
          if (isConnecting && stream.active && stream.getTracks().length > 0) {
            console.log("🎥 Stream is active with tracks - considering connection established");
            setTimeout(() => {
              if (isConnecting) {
                console.log("🎥 Final auto-resolve: Stream is active");
                setIsConnecting(false);
              }
            }, 1000);
          }
        }, 500);
      };

      peerConnection.onconnectionstatechange = () => {
        const newConnectionState = peerConnection.connectionState;
        console.log("🔗 WebRTC connection state changed to:", newConnectionState);
        setConnectionState(newConnectionState);

        // Log detailed connection info
        console.log("🔗 Connection details:", {
          connectionState: newConnectionState,
          iceConnectionState: peerConnection.iceConnectionState,
          iceGatheringState: peerConnection.iceGatheringState,
          signalingState: peerConnection.signalingState,
          localDescription: !!peerConnection.localDescription,
          remoteDescription: !!peerConnection.remoteDescription,
        });

        if (newConnectionState === "connected") {
          setIsConnecting(false);
          console.log("✅ WebRTC connection established successfully");
          // Clear connection timeout if exists
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
        } else if (newConnectionState === "connecting") {
          console.log("🔄 WebRTC connection is connecting...");
          // Don't change isConnecting here, let it stay true
        } else if (newConnectionState === "failed") {
          console.log("❌ WebRTC connection failed, ending call");
          endCall();
        } else if (newConnectionState === "disconnected") {
          console.log("⚠️ WebRTC connection disconnected - waiting for reconnection");
          // Give more time for reconnection before ending call (increased from 5s to 10s)
          setTimeout(() => {
            if (peerConnection.connectionState === "disconnected") {
              console.log("⚠️ Connection still disconnected after timeout - checking if call should end");
              // Additional check: only end call if we haven't had a working connection recently
              // or if there's no evidence of working media streams
              const hasWorkingRemoteStream =
                remoteStream &&
                remoteStream.active &&
                remoteStream.getTracks().some((track) => track.readyState === "live");
              if (!hasWorkingRemoteStream) {
                console.log("⚠️ No working remote stream - ending call");
                endCall();
              } else {
                console.log("⚠️ Remote stream still active - keeping call alive despite connection state");
              }
            }
          }, 10000); // Increased from 5000 to 10000
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        const newIceState = peerConnection.iceConnectionState;
        console.log("🧊 ICE connection state changed to:", newIceState);
        setIceConnectionState(newIceState);

        if (newIceState === "connected" || newIceState === "completed") {
          setIsConnecting(false);
          console.log("✅ ICE connection established successfully");
          // Clear connection timeout if exists
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
        } else if (newIceState === "failed") {
          console.log("❌ ICE connection failed, ending call");
          endCall();
        } else if (newIceState === "disconnected") {
          console.log("⚠️ ICE connection disconnected");
          // Don't immediately end call on ICE disconnection - it might reconnect
          // Set a timeout to check if connection recovers
          setTimeout(() => {
            if (peerConnection.iceConnectionState === "disconnected") {
              console.log("⚠️ ICE still disconnected after 8 seconds - checking overall connection");
              // Only end if both ICE and overall connection are failed/disconnected
              const overallState = peerConnection.connectionState;
              if (overallState === "failed" || (overallState === "disconnected" && !remoteStream?.active)) {
                console.log("⚠️ Both ICE and overall connection problematic - ending call");
                endCall();
              } else {
                console.log("⚠️ Overall connection seems OK despite ICE disconnection");
              }
            }
          }, 8000);
        } else if (newIceState === "checking") {
          console.log("🔍 ICE connection checking...");
          // Set isConnecting to true when checking starts
          setIsConnecting(true);
        }
      };

      peerConnection.onicegatheringstatechange = () => {
        console.log("🧊 ICE gathering state changed to:", peerConnection.iceGatheringState);
      };

      peerConnection.onsignalingstatechange = () => {
        console.log("📶 Signaling state changed to:", peerConnection.signalingState);
      };

      console.log("RTCPeerConnection created successfully");
      return peerConnection;
    } catch (error) {
      console.error("Error creating RTCPeerConnection:", error);
      throw error;
    }
  }, []);

  // Helper function to start connection timeout
  const startConnectionTimeout = useCallback(() => {
    // Clear any existing timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    // Set new timeout (20 seconds - increased from 15)
    connectionTimeoutRef.current = setTimeout(() => {
      console.log("⏰ Connection timeout reached - analyzing connection state");

      if (peerConnectionRef.current) {
        const connectionState = peerConnectionRef.current.connectionState;
        const iceState = peerConnectionRef.current.iceConnectionState;
        const signalingState = peerConnectionRef.current.signalingState;

        console.log("⏰ Connection analysis at timeout:", {
          connectionState,
          iceState,
          signalingState,
          localDescription: !!peerConnectionRef.current.localDescription,
          remoteDescription: !!peerConnectionRef.current.remoteDescription,
          localStreamExists: !!localStream,
          remoteStreamExists: !!remoteStream,
          remoteStreamRefExists: !!remoteStreamRef.current,
          isRemoteVideoPlaying:
            remoteVideoRef.current && !remoteVideoRef.current.paused && remoteVideoRef.current.currentTime > 0,
          localVideoPlaying: localVideoRef.current && !localVideoRef.current.paused,
        });

        // Advanced connection resolution logic
        const hasValidRemoteStream = remoteStream || remoteStreamRef.current;
        const isRemoteVideoActuallyPlaying =
          remoteVideoRef.current &&
          remoteVideoRef.current.srcObject &&
          !remoteVideoRef.current.paused &&
          remoteVideoRef.current.readyState >= 2; // HAVE_CURRENT_DATA or higher

        // Try to resolve connection based on actual state
        if (hasValidRemoteStream || isRemoteVideoActuallyPlaying) {
          console.log("⏰ Found evidence of working connection - forcing resolution");
          setIsConnecting(false);

          // Sync remote stream if missing
          if (!remoteStream && remoteStreamRef.current) {
            console.log("⏰ Syncing missing remote stream");
            setRemoteStream(remoteStreamRef.current);
          }
          return;
        }

        // Check if ICE connection is actually working despite connection state
        if ((iceState === "connected" || iceState === "completed") && localStream) {
          console.log("⏰ ICE is connected - forcing connection resolution");
          setIsConnecting(false);
          return;
        }

        // Last resort: check if we have both local and remote descriptions
        if (
          peerConnectionRef.current.localDescription &&
          peerConnectionRef.current.remoteDescription &&
          localStream &&
          signalingState === "stable"
        ) {
          console.log("⏰ Have stable signaling with both descriptions - giving more time");

          // Give it 10 more seconds if signaling is stable
          connectionTimeoutRef.current = setTimeout(() => {
            console.log("⏰ Extended timeout reached - checking final state");

            // Final check for any working connection
            if (syncRemoteStream()) {
              console.log("⏰ Found remote stream in final check - resolving");
              setIsConnecting(false);
            } else {
              console.log("⏰ No working connection found - ending call");
              endCall();
            }
          }, 10000);
          return;
        }
      }

      console.log("⏰ No viable connection found - ending call");
      setIsConnecting(false);
      setTimeout(() => {
        if (!remoteStream && !remoteStreamRef.current) {
          endCall();
        }
      }, 1000);
    }, 20000); // 20 seconds initial timeout

    console.log("⏰ Connection timeout started (20s with extended fallbacks)");
  }, [localStream, remoteStream, endCall, syncRemoteStream]);

  // Enhanced connection state monitoring
  React.useEffect(() => {
    if (isConnecting && peerConnectionRef.current) {
      let statusCheckCount = 0;
      const maxChecks = 30; // 60 seconds total (30 checks * 2 seconds)

      const statusInterval = setInterval(() => {
        statusCheckCount++;
        const pc = peerConnectionRef.current;

        if (!pc) {
          clearInterval(statusInterval);
          return;
        }

        const connectionInfo = {
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState,
          iceGatheringState: pc.iceGatheringState,
          signalingState: pc.signalingState,
          localDescription: !!pc.localDescription,
          remoteDescription: !!pc.remoteDescription,
          localStreamActive: localStream?.active,
          remoteStreamActive: remoteStream?.active,
          checkNumber: statusCheckCount,
        };

        console.log(`🔍 Connection Status Check #${statusCheckCount}:`, connectionInfo);

        // Check for stuck states and try to resolve them
        if (statusCheckCount % 5 === 0) {
          // Every 10 seconds
          if (pc.connectionState === "connecting" && pc.iceConnectionState === "checking") {
            console.log("🔧 Connection has been in 'connecting/checking' state for a while");

            // Try to sync remote stream if we have it but it's not showing
            if (remoteStreamRef.current && !remoteStream) {
              console.log("🔧 Attempting to sync remote stream from ref");
              setRemoteStream(remoteStreamRef.current);
            }
          }

          // Check if we have evidence of a working connection despite what states say
          if (pc.connectionState !== "connected" && remoteStream?.active) {
            const videoTracks = remoteStream.getVideoTracks();
            const audioTracks = remoteStream.getAudioTracks();
            const hasLiveTracks = [...videoTracks, ...audioTracks].some((track) => track.readyState === "live");

            if (hasLiveTracks) {
              console.log("🔧 Found live tracks despite connection state - considering connection good");
              if (isConnecting) {
                console.log("🔧 Resolving connection status based on live tracks");
                setIsConnecting(false);
              }
            }
          }
        }

        // Stop checking after max attempts or when connected
        if (statusCheckCount >= maxChecks || pc.connectionState === "connected") {
          console.log(
            `🔍 Stopping status checks. Reason: ${
              pc.connectionState === "connected" ? "Connected" : "Max checks reached"
            }`,
          );
          clearInterval(statusInterval);
        }
      }, 2000);

      return () => {
        console.log("🔍 Cleaning up connection status monitoring");
        clearInterval(statusInterval);
      };
    }
  }, [isConnecting, localStream, remoteStream]);

  // Get user media
  const getUserMedia = useCallback(async (video: boolean = true, audio: boolean = true) => {
    try {
      let constraints;

      // Simple constraints for voice calls
      if (!video && audio) {
        constraints = {
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
          },
        };
        console.log("🎙️ Voice call: Requesting audio-only media");
      } else {
        // Full constraints for video calls
        constraints = {
          video: video
            ? {
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                frameRate: { ideal: 30, max: 30 },
              }
            : false,
          audio: audio
            ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100,
              }
            : false,
        };
        console.log("📹 Video call: Requesting media with constraints:", constraints);
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(
        "Got media stream with tracks:",
        stream.getTracks().map((t) => `${t.kind}: ${t.label}`),
      );
      setLocalStream(stream);

      // Set local video immediately when we get the stream (only for video calls)
      if (localVideoRef.current && video) {
        console.log("🎥 Setting local video srcObject immediately in getUserMedia");
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Local video should always be muted

        localVideoRef.current.onloadedmetadata = () => {
          console.log("🎥 Local video metadata loaded in getUserMedia");
          localVideoRef.current?.play().catch((error) => {
            console.error("🎥 Local video play failed in getUserMedia:", error);
          });
        };

        // Try to play immediately
        localVideoRef.current.play().catch((error) => {
          console.log("🎥 Local video initial play failed in getUserMedia, waiting for metadata:", error);
        });
      }

      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      // Try with more basic constraints if the first attempt fails
      if (video) {
        try {
          console.log("Retrying with basic constraints...");
          const basicConstraints = { video: true, audio };
          const stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
          setLocalStream(stream);
          if (localVideoRef.current) {
            console.log("🎥 Setting local video srcObject in fallback");
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.muted = true;
            localVideoRef.current.onloadedmetadata = () => {
              localVideoRef.current?.play().catch(console.error);
            };
            localVideoRef.current.play().catch(console.error);
          }
          return stream;
        } catch (basicError) {
          console.error("Basic constraints also failed:", basicError);
          throw basicError;
        }
      } else {
        // For audio-only, try even simpler constraints
        try {
          console.log("🎙️ Retrying voice call with simplest audio constraints...");
          const audioOnlyConstraints = { video: false, audio: true };
          const stream = await navigator.mediaDevices.getUserMedia(audioOnlyConstraints);
          setLocalStream(stream);
          console.log("🎙️ Voice call media acquired successfully");
          return stream;
        } catch (audioError) {
          console.error("🎙️ Audio-only constraints also failed:", audioError);
          throw audioError;
        }
      }
    }
  }, []);

  // Initiate call
  const initiateCall = useCallback(
    async (receiverId: string, receiverName: string, conversationId: string, callType: "video" | "audio") => {
      if (!socket || !isConnected) {
        console.error("Socket not connected");
        return;
      }

      try {
        console.log("Starting call initiation process...");
        setIsConnecting(true);
        setCallType(callType);
        remoteParticipantId.current = receiverId;

        // Start connection timeout
        startConnectionTimeout();

        // Get user media first
        console.log("Requesting user media...");
        const stream = await getUserMedia(callType === "video", true);
        console.log(
          "Got user media:",
          stream.getTracks().map((t) => t.kind),
        );

        // Create peer connection
        console.log("Creating peer connection...");
        const peerConnection = createPeerConnection();
        setPeerConnection(peerConnection);
        peerConnectionRef.current = peerConnection;

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
          console.log(
            "🎵 Added track to peer connection:",
            track.kind,
            "enabled:",
            track.enabled,
            "label:",
            track.label,
          );
        });

        // Generate a temporary call ID for tracking
        const tempCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        currentCallId.current = tempCallId;

        // Set call state AFTER everything is set up
        setIsInCall(true);
        setCallId(tempCallId); // Set callId for caller
        setCallerName(receiverName); // Set receiver name as the person we're calling
        console.log("Set isInCall to true, callId:", tempCallId, "calling:", receiverName);

        // Initiate call through socket
        console.log("Emitting initiateVideoCall...");
        socket.emit("initiateVideoCall", {
          callerId: authProvider.getUserUuid(),
          callerName: authProvider.getUsername() || "Unknown",
          receiverId,
          receiverName,
          conversationId,
          callType,
          tempCallId, // Send temp ID to track
        });

        console.log("Call initiated to:", receiverId);
      } catch (error) {
        console.error("Error initiating call:", error);
        setIsConnecting(false);
        setIsInCall(false);
        // Clean up on error
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
          setLocalStream(null);
        }
      }
    },
    [socket, isConnected, getUserMedia, createPeerConnection],
  );

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!socket || !callId || !callerId) {
      console.error("❌ Missing socket, callId, or callerId when accepting call");
      console.log("📞 Accept call state:", { socket: !!socket, callId, callerId });
      return;
    }

    try {
      console.log("📞 Accepting call with ID:", callId);
      console.log("📞 Current state before accepting:", {
        peerConnectionExists: !!peerConnectionRef.current,
        localStreamExists: !!localStream,
        isIncomingCall,
        callType,
        currentCallIdRef: currentCallId.current,
      });

      // Clear any existing call state first
      if (peerConnectionRef.current) {
        console.log("📞 Cleaning up existing peer connection");
        peerConnectionRef.current.close();
        setPeerConnection(null);
      }

      // If peer connection is missing, try to recreate it
      if (!peerConnectionRef.current) {
        console.log("⚠️ Peer connection missing when accepting call - attempting to recreate");

        try {
          // Ensure we have local stream first
          let stream = localStream;
          if (!stream) {
            console.log("📞 Getting user media for accept call...");
            stream = await getUserMedia(callType === "video", true);
          }

          console.log("📞 Creating new peer connection for accept...");
          const peerConnection = createPeerConnection();
          peerConnectionRef.current = peerConnection;

          // Add local stream to peer connection
          stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
            console.log("📞 Added track to recreated peer connection:", track.kind, "enabled:", track.enabled);
          });

          console.log("✅ Peer connection recreated successfully for accept");
          console.log("📞 Recreated peer connection state:", {
            signalingState: peerConnection.signalingState,
            connectionState: peerConnection.connectionState,
            sendersCount: peerConnection.getSenders().length,
          });
        } catch (recreateError) {
          console.error("❌ Failed to recreate peer connection:", recreateError);
          console.error("❌ AcceptCall recreation error details:", {
            errorName: recreateError instanceof Error ? recreateError.name : "Unknown",
            errorMessage: recreateError instanceof Error ? recreateError.message : "Unknown error",
            callType,
            localStreamExists: !!localStream,
            callId,
            callerId,
          });

          // Reject call since we can't establish connection
          socket.emit("answerVideoCall", {
            callId,
            accepted: false,
            receiverId: authProvider.getUserUuid(),
          });
          setIsIncomingCall(false);
          return;
        }
      }

      // Verify local stream exists
      if (!localStream) {
        console.error("❌ No local stream when accepting call!");
        console.log("📞 Attempting to get user media...");

        try {
          await getUserMedia(callType === "video", true);
          console.log("✅ Got user media successfully");
        } catch (mediaError) {
          console.error("❌ Failed to get user media:", mediaError);
          socket.emit("answerVideoCall", {
            callId,
            accepted: false,
            receiverId: authProvider.getUserUuid(),
          });
          setIsIncomingCall(false);
          return;
        }
      }

      // Verify peer connection has local tracks
      const senders = peerConnectionRef.current.getSenders();
      console.log("📞 Peer connection senders:", senders.length);
      senders.forEach((sender, index) => {
        console.log(`📞 Sender ${index}:`, {
          track: sender.track ? `${sender.track.kind} (${sender.track.enabled})` : "null",
          trackReadyState: sender.track?.readyState,
        });
      });

      if (senders.length === 0 && localStream) {
        console.log("📞 No senders found - adding tracks to peer connection...");
        localStream.getTracks().forEach((track) => {
          peerConnectionRef.current!.addTrack(track, localStream);
          console.log("📞 Added track:", track.kind);
        });
      }

      console.log("📞 Final peer connection state before accepting:", {
        signalingState: peerConnectionRef.current.signalingState,
        connectionState: peerConnectionRef.current.connectionState,
        iceState: peerConnectionRef.current.iceConnectionState,
        sendersCount: peerConnectionRef.current.getSenders().length,
      });

      setIsConnecting(true);

      // Start connection timeout
      startConnectionTimeout();

      // Accept call via socket
      socket.emit("answerVideoCall", {
        callId,
        accepted: true,
        receiverId: authProvider.getUserUuid(),
        ready: true, // Signal that peer connection is ready
      });

      // Update states after successful acceptance
      setIsIncomingCall(false);
      setIsInCall(true);

      console.log("✅ Call accepted successfully");
      console.log("📞 Final state after accepting:", {
        isInCall: true,
        isIncomingCall: false,
        peerConnectionExists: !!peerConnectionRef.current,
        localStreamExists: !!localStream,
        isConnecting: true,
      });
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      // Handle error by emitting reject directly to avoid dependency issues
      if (socket && callId) {
        socket.emit("answerVideoCall", {
          callId,
          accepted: false,
          receiverId: authProvider.getUserUuid(),
        });
      }
      setIsIncomingCall(false);
    }
  }, [socket, callId, callerId, startConnectionTimeout, localStream, callType, getUserMedia, createPeerConnection]);

  // Reject call
  const rejectCall = useCallback(() => {
    if (!socket || !callId) return;

    console.log("📞 Rejecting call:", callId);

    socket.emit("answerVideoCall", {
      callId,
      accepted: false,
      receiverId: authProvider.getUserUuid(),
    });

    // Cleanup peer connection if created
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      setPeerConnection(null);
    }

    // Stop local stream if acquired
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Reset states
    setIsIncomingCall(false);
    setCallId(null);
    setCallerId(null);
    setCallerName(null);
    setCallType(null);
    setIsConnecting(false);
    remoteParticipantId.current = null;
    currentCallId.current = null;

    console.log("✅ Call rejected and cleaned up");
  }, [socket, callId, localStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isCallMuted;
        setIsCallMuted(!isCallMuted);
        console.log("Audio", isCallMuted ? "unmuted" : "muted");
      }
    }
  }, [localStream, isCallMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
        console.log("Video", isVideoOff ? "enabled" : "disabled");
      }
    }
  }, [localStream, isVideoOff]);

  // Handle remote stream updates
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("🎥 useEffect: Updating remote video element with stream");
      remoteVideoRef.current.srcObject = remoteStream;

      remoteVideoRef.current.onloadedmetadata = () => {
        console.log("🎥 useEffect: Remote video metadata loaded");
        remoteVideoRef.current?.play().catch((error) => {
          console.error("🎥 useEffect: Remote video play failed:", error);
        });
      };

      remoteVideoRef.current.onplay = () => {
        console.log("🎥 useEffect: Remote video started playing - resolving connection");
        // If video is playing but still connecting, resolve it
        if (isConnecting) {
          console.log("🎥 Auto-resolving connection - remote video is playing");
          setIsConnecting(false);
        }
      };

      // Try to play immediately
      remoteVideoRef.current.play().catch((error) => {
        console.log("🎥 useEffect: Initial play failed, waiting for metadata:", error);
      });
    }
  }, [remoteStream, isConnecting]);

  // Handle local stream updates
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log("🎥 useEffect: Updating local video element with stream");
      localVideoRef.current.srcObject = localStream;

      localVideoRef.current.onloadedmetadata = () => {
        console.log("🎥 useEffect: Local video metadata loaded");
        localVideoRef.current?.play().catch((error) => {
          console.error("🎥 useEffect: Local video play failed:", error);
        });
      };
    }
  }, [localStream]);

  // Force connection to resolve if stuck
  useEffect(() => {
    if (isConnecting && localStream && remoteStream) {
      console.log("🔄 Both streams available, forcing connection resolution...");
      const timer = setTimeout(() => {
        if (isConnecting) {
          console.log("🔄 Forcing isConnecting to false - streams are ready");
          setIsConnecting(false);
        }
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [isConnecting, localStream, remoteStream]);

  // Handle connection timeout trigger
  useEffect(() => {
    // If isConnecting becomes false and we don't have both streams, it might be a timeout
    if (!isConnecting && isInCall && (!localStream || !remoteStream)) {
      console.log("🔄 Connection failed - ending call due to missing streams");
      endCall();
    }
  }, [isConnecting, isInCall, localStream, remoteStream, endCall]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming call
    socket.on("incomingVideoCall", async (data) => {
      console.log("📞 Incoming video call from:", data.callerId, "type:", data.callType);
      console.log("📞 Full incoming call data:", data);

      try {
        // Clear any existing call state first
        if (peerConnectionRef.current) {
          console.log("📞 Cleaning up existing peer connection");
          peerConnectionRef.current.close();
          setPeerConnection(null);
        }

        if (localStream) {
          console.log("📞 Stopping existing local stream");
          localStream.getTracks().forEach((track) => track.stop());
          setLocalStream(null);
        }

        // Set call state first
        setIsIncomingCall(true);
        setCallId(data.callId);
        setCallerId(data.callerId);
        setCallerName(data.callerName);
        setCallType(data.callType);
        currentCallId.current = data.callId;
        remoteParticipantId.current = data.callerId;

        console.log("📞 Call state set for incoming call:", {
          callId: data.callId,
          callerId: data.callerId,
          callerName: data.callerName,
          callType: data.callType,
        });

        // Prepare for incoming call by getting user media and creating peer connection
        console.log("📞 Preparing for incoming call - getting user media...");
        const stream = await getUserMedia(data.callType === "video", true);
        console.log("📞 Got user media for incoming call:", stream.getTracks().length, "tracks");
        console.log(
          "📞 Stream tracks:",
          stream.getTracks().map((t) => `${t.kind}: ${t.enabled}`),
        );

        // Create peer connection early so it's ready for WebRTC offer
        console.log("📞 Creating peer connection for incoming call...");
        const peerConnection = createPeerConnection();
        setPeerConnection(peerConnection);
        console.log("📞 Peer connection created and stored in ref");
        console.log("📞 Peer connection reference set:", !!peerConnectionRef.current);

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
          console.log("📞 Added track to peer connection:", track.kind, "enabled:", track.enabled);
        });

        console.log("✅ Peer connection ready for incoming call");
        console.log("📞 Peer connection state:", {
          signalingState: peerConnection.signalingState,
          connectionState: peerConnection.connectionState,
          iceState: peerConnection.iceConnectionState,
          localTracksCount: stream.getTracks().length,
          peerConnectionExists: !!peerConnectionRef.current,
          peerConnectionSame: peerConnectionRef.current === peerConnection,
        });

        // Verify peer connection is actually stored
        if (!peerConnectionRef.current) {
          console.error("❌ CRITICAL: Peer connection ref is null after setting!");
          throw new Error("Failed to store peer connection reference");
        }

        // Double check by calling the ref
        console.log("📞 Final verification - peer connection ref:", {
          exists: !!peerConnectionRef.current,
          signalingState: peerConnectionRef.current?.signalingState,
          connectionState: peerConnectionRef.current?.connectionState,
        });

        // Add a small delay to ensure everything is properly set up
        console.log("📞 Waiting 500ms to ensure setup is complete...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Final verification before sending ready signal
        if (!peerConnectionRef.current) {
          throw new Error("Peer connection lost during setup delay");
        }

        console.log("📞 Final state verification before sending ready signal:", {
          peerConnectionExists: !!peerConnectionRef.current,
          localStreamExists: !!localStream,
          sendersCount: peerConnectionRef.current.getSenders().length,
          signalingState: peerConnectionRef.current.signalingState,
        });

        // Send ready signal to caller ONLY if everything is verified
        socket.emit("receiverReady", {
          callId: data.callId,
          receiverId: authProvider.getUserUuid(),
        });

        console.log("✅ Receiver ready signal sent after verification");

        // Additional protection: Schedule a verification check after ready signal
        setTimeout(() => {
          if (!peerConnectionRef.current) {
            console.error("❌ CRITICAL: Peer connection lost after sending ready signal!");
            console.log("📞 This indicates a serious timing or memory issue");
            // Don't end call here as offer might be in transit
          } else {
            console.log("🔒 Peer connection verification passed after ready signal");
          }
        }, 100);
      } catch (error) {
        console.error("❌ Error preparing for incoming call:", error);
        // If preparation fails, reject the call
        socket.emit("answerVideoCall", {
          callId: data.callId,
          accepted: false,
          receiverId: authProvider.getUserUuid(),
        });

        // Clean up state
        setIsIncomingCall(false);
        setCallId(null);
        setCallerId(null);
        setCallerName(null);
        setCallType(null);
        currentCallId.current = null;
        remoteParticipantId.current = null;

        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
      }
    });

    // Call accepted
    socket.on("videoCallAccepted", async (data) => {
      console.log("📞 Call accepted:", data);
      console.log("📞 Current caller state before update:", { isInCall, callId, callerName });

      // Update to real call ID from server
      const realCallId = data.callId;
      currentCallId.current = realCallId;
      setCallId(realCallId); // Update state with real call ID
      remoteParticipantId.current = data.receiverId;

      // Ensure caller maintains isInCall state
      setIsInCall(true);
      setIsConnecting(true);

      // Start connection timeout for WebRTC negotiation
      startConnectionTimeout();

      // Maintain the receiver name as the display name for caller
      if (!callerName) {
        setCallerName(data.receiverName || "Unknown");
      }

      console.log("📞 Caller state updated after acceptance:", {
        realCallId,
        isInCall: true,
        callerName: callerName || data.receiverName,
        callType,
      });

      // Wait for receiver ready signal before proceeding
      console.log("📞 Waiting for receiver ready signal...");
    });

    // Receiver ready signal
    socket.on("receiverReady", async (data) => {
      console.log("📞 Receiver is ready, proceeding with offer creation");
      console.log("📞 Current state before offer creation:", {
        peerConnectionExists: !!peerConnectionRef.current,
        localStreamExists: !!localStream,
        isInCall,
        callType,
        callId,
        remoteParticipantId: remoteParticipantId.current,
      });

      // Add a small delay to ensure receiver is truly ready
      console.log("📞 Waiting 300ms to ensure receiver is fully ready...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Ensure peer connection exists
      if (!peerConnectionRef.current) {
        console.error("❌ No peer connection when receiver is ready - this is a critical issue!");
        console.log("📞 Attempting to create peer connection for caller...");
        try {
          const peerConnection = createPeerConnection();
          peerConnectionRef.current = peerConnection;

          // Add local stream if available
          if (localStream) {
            localStream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, localStream);
              console.log("📞 Re-added track to new peer connection:", track.kind);
            });
          } else {
            console.error("❌ No local stream available for new peer connection!");
            endCall();
            return;
          }
        } catch (error) {
          console.error("❌ Error creating peer connection for caller:", error);
          endCall();
          return;
        }
      }

      // Verify local stream exists
      if (!localStream) {
        console.error("❌ No local stream when creating offer!");
        endCall();
        return;
      }

      // Additional verification before creating offer
      console.log("📞 Final verification before creating offer:", {
        peerConnectionExists: !!peerConnectionRef.current,
        localStreamExists: !!localStream,
        sendersCount: peerConnectionRef.current?.getSenders().length,
        signalingState: peerConnectionRef.current?.signalingState,
        connectionState: peerConnectionRef.current?.connectionState,
        localTracks: localStream
          ?.getTracks()
          .map((t) => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })),
      });

      if (peerConnectionRef.current) {
        try {
          console.log("📞 Creating offer as caller...");
          // Create offer
          const offer = await peerConnectionRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: callType === "video",
          });

          console.log("📞 Offer created successfully:", {
            type: offer.type,
            sdpLength: offer.sdp?.length,
            sdpPreview: offer.sdp?.substring(0, 100) + "...",
          });

          console.log("📞 Setting local description...");
          await peerConnectionRef.current.setLocalDescription(offer);
          console.log("✅ Local description set successfully");

          // Validate offer before sending
          if (!offer.sdp || offer.sdp.length === 0) {
            throw new Error("Generated offer has no SDP content");
          }

          console.log("📞 Offer validation passed - sending to receiver...");
          console.log("📞 Sending WebRTC offer to:", data.receiverId);
          socket.emit("webrtcOffer", {
            callId: data.callId,
            offer: {
              type: offer.type,
              sdp: offer.sdp,
            },
            from: authProvider.getUserUuid(),
            to: data.receiverId,
          });
          console.log("✅ WebRTC offer sent successfully");
        } catch (error) {
          console.error("❌ Error creating offer:", error);

          // Retry offer creation once
          console.log("📞 Retrying offer creation...");
          try {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

            const retryOffer = await peerConnectionRef.current!.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: callType === "video",
            });

            await peerConnectionRef.current!.setLocalDescription(retryOffer);

            if (!retryOffer.sdp || retryOffer.sdp.length === 0) {
              throw new Error("Retry offer also has no SDP content");
            }

            console.log("📞 Retry offer successful:", {
              type: retryOffer.type,
              sdpLength: retryOffer.sdp.length,
            });

            socket.emit("webrtcOffer", {
              callId: data.callId,
              offer: {
                type: retryOffer.type,
                sdp: retryOffer.sdp,
              },
              from: authProvider.getUserUuid(),
              to: data.receiverId,
            });
            console.log("✅ Retry WebRTC offer sent successfully");
          } catch (retryError) {
            console.error("❌ Retry offer creation also failed:", retryError);
            endCall();
          }
        }
      } else {
        console.error("❌ No peer connection available for caller after all checks!");
        endCall();
      }
    });

    // Call rejected
    socket.on("videoCallRejected", (data) => {
      console.log("Call rejected:", data);
      endCall();
    });

    // Call ended
    socket.on("videoCallEnded", (data) => {
      console.log("Call ended by other participant:", data);
      endCall();
    });

    // WebRTC Offer
    socket.on("webrtcOffer", async (data) => {
      console.log("📨 Received WebRTC offer from:", data.from, "for call:", data.callId);
      console.log("📨 Current state when receiving offer:", {
        isIncomingCall,
        isInCall,
        callId,
        callType,
        currentCallId: currentCallId.current,
        remoteParticipantId: remoteParticipantId.current,
        peerConnectionExists: !!peerConnectionRef.current,
        localStreamExists: !!localStream,
      });
      console.log("📨 Offer SDP:", data.offer?.sdp?.substring(0, 100) + "...");

      // Verify we're in the right state to receive an offer
      if (!isIncomingCall && !isInCall) {
        console.error("❌ Received offer but not in call state!");
        console.log("📨 Current call states:", { isIncomingCall, isInCall, callId });
        return;
      }

      // Verify call ID matches
      if (data.callId !== callId && data.callId !== currentCallId.current) {
        console.error("❌ Offer call ID doesn't match current call!");
        console.log("📨 Call ID mismatch:", {
          offerCallId: data.callId,
          currentCallId: callId,
          currentCallIdRef: currentCallId.current,
        });
        return;
      }

      // Ensure we have a peer connection before processing offer
      if (!peerConnectionRef.current) {
        console.log("⚠️ No peer connection available when receiving offer - attempting to recreate");
        console.log("📨 Call state debug:", {
          isIncomingCall,
          isInCall,
          callId,
          callType,
          localStreamExists: !!localStream,
        });

        try {
          // Try to recreate peer connection with current call state
          let stream = localStream;
          if (!stream) {
            console.log("📨 Getting user media for offer processing...");
            stream = await getUserMedia(callType === "video", true);
          }

          console.log("📨 Creating emergency peer connection for offer...");
          const peerConnection = createPeerConnection();
          peerConnectionRef.current = peerConnection;

          // Add local stream to peer connection
          stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
            console.log("📨 Added track to emergency peer connection:", track.kind, "enabled:", track.enabled);
          });

          console.log("✅ Emergency peer connection created successfully");
          console.log("📨 Emergency peer connection state:", {
            signalingState: peerConnection.signalingState,
            connectionState: peerConnection.connectionState,
            sendersCount: peerConnection.getSenders().length,
          });
        } catch (recreateError) {
          console.error("❌ Failed to recreate peer connection for offer:", recreateError);
          console.error("❌ Recreation error details:", {
            errorName: recreateError instanceof Error ? recreateError.name : "Unknown",
            errorMessage: recreateError instanceof Error ? recreateError.message : "Unknown error",
            callType,
            localStreamExists: !!localStream,
            isIncomingCall,
            isInCall,
          });
          console.log("📨 Ending call due to peer connection recreation failure");
          endCall();
          return;
        }
      }

      console.log("📨 Current peer connection state before offer:", {
        signalingState: peerConnectionRef.current?.signalingState,
        connectionState: peerConnectionRef.current?.connectionState,
        iceState: peerConnectionRef.current?.iceConnectionState,
      });

      if (peerConnectionRef.current && data.offer) {
        try {
          console.log("📨 Setting remote description from offer...");
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          console.log("✅ Remote description set successfully");
          console.log("📨 Peer connection state after setting remote description:", {
            signalingState: peerConnectionRef.current.signalingState,
            connectionState: peerConnectionRef.current.connectionState,
            iceState: peerConnectionRef.current.iceConnectionState,
          });

          console.log("📨 Creating answer...");
          const answer = await peerConnectionRef.current.createAnswer();
          console.log("📨 Answer created:", answer.type);
          console.log("📨 Answer SDP:", answer.sdp?.substring(0, 100) + "...");

          console.log("📨 Setting local description for answer...");
          await peerConnectionRef.current.setLocalDescription(answer);
          console.log("✅ Local description set successfully");
          console.log("📨 Peer connection state after setting local description:", {
            signalingState: peerConnectionRef.current.signalingState,
            connectionState: peerConnectionRef.current.connectionState,
            iceState: peerConnectionRef.current.iceConnectionState,
          });

          console.log("📨 Sending WebRTC answer to:", data.from);
          socket.emit("webrtcAnswer", {
            callId: data.callId,
            answer: {
              type: answer.type,
              sdp: answer.sdp,
            },
            from: authProvider.getUserUuid(),
            to: data.from,
          });
          console.log("✅ WebRTC answer sent successfully");
        } catch (error) {
          console.error("❌ Error handling offer:", error);
          endCall();
        }
      } else {
        // Invalid offer - add retry logic instead of immediately ending call
        console.error("❌ No peer connection or invalid offer - attempting recovery");
        console.log("📨 Debug info:", {
          peerConnectionExists: !!peerConnectionRef.current,
          offerExists: !!data.offer,
          offerType: data.offer?.type,
          offerSdpLength: data.offer?.sdp?.length,
          offerSdp: data.offer?.sdp ? "Present" : "Missing",
        });

        if (!data.offer || !data.offer.sdp) {
          console.log("📨 Offer is missing or corrupted - waiting for retry...");
          console.log("📨 Will wait up to 15 seconds for a valid offer before giving up");

          // Don't end call immediately - the caller might retry
          // This gives time for network issues to resolve or caller to retry
          setTimeout(() => {
            // Check if we're still in call state and haven't received a valid offer
            if ((isIncomingCall || isInCall) && callId === data.callId) {
              console.log("📨 Timeout waiting for valid offer - ending call");
              endCall();
            }
          }, 15000); // Wait 15 seconds total
        } else if (!peerConnectionRef.current) {
          console.log("📨 Peer connection missing but offer is valid - this should have been handled above");
          endCall();
        } else {
          console.log("📨 Unknown invalid state - ending call");
          endCall();
        }
      }
    });

    // WebRTC Answer
    socket.on("webrtcAnswer", async (data) => {
      console.log("📨 Received WebRTC answer from:", data.from, "for call:", data.callId);
      console.log("📨 Answer SDP:", data.answer?.sdp?.substring(0, 100) + "...");

      if (!peerConnectionRef.current) {
        console.error("❌ No peer connection available when receiving answer!");
        endCall();
        return;
      }

      console.log("📨 Current peer connection state before answer:", {
        signalingState: peerConnectionRef.current?.signalingState,
        connectionState: peerConnectionRef.current?.connectionState,
        iceState: peerConnectionRef.current?.iceConnectionState,
      });

      if (peerConnectionRef.current && data.answer) {
        try {
          console.log("📨 Setting remote description from answer...");
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log("✅ WebRTC answer processed successfully");
          console.log("📨 Peer connection state after setting remote description:", {
            signalingState: peerConnectionRef.current.signalingState,
            connectionState: peerConnectionRef.current.connectionState,
            iceState: peerConnectionRef.current.iceConnectionState,
          });
          console.log("🔄 Connection should establish soon - waiting for ICE candidates...");
        } catch (error) {
          console.error("❌ Error handling answer:", error);
          endCall();
        }
      } else {
        console.error("❌ No peer connection or invalid answer");
      }
    });

    // ICE Candidate
    socket.on("webrtcIceCandidate", async (data) => {
      console.log("🧊 Received ICE candidate from:", data.from, {
        type: data.candidate?.type,
        candidate: data.candidate?.candidate?.substring(0, 50) + "...",
        component: data.candidate?.component,
        foundation: data.candidate?.foundation,
        priority: data.candidate?.priority,
        protocol: data.candidate?.protocol,
        port: data.candidate?.port,
      });

      setIceCandidatesReceived((prev) => prev + 1);

      // Ensure peer connection exists
      if (!peerConnectionRef.current) {
        console.error("❌ No peer connection for ICE candidate!");
        console.log("🧊 This indicates a serious timing issue");
        return;
      }

      if (peerConnectionRef.current && data.candidate) {
        try {
          // Check if we can add this candidate
          if (peerConnectionRef.current.signalingState === "stable" || peerConnectionRef.current.remoteDescription) {
            await peerConnectionRef.current.addIceCandidate(data.candidate);
            console.log("✅ ICE candidate added successfully");
          } else {
            console.log("⚠️ Delaying ICE candidate - waiting for remote description");
            // Store candidate for later if remote description not set yet
            setTimeout(async () => {
              if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                try {
                  await peerConnectionRef.current.addIceCandidate(data.candidate);
                  console.log("✅ Delayed ICE candidate added successfully");
                } catch (error) {
                  console.error("❌ Error adding delayed ICE candidate:", error);
                }
              }
            }, 1000);
          }
        } catch (error) {
          console.error("❌ Error adding ICE candidate:", error);
        }
      } else {
        console.log("⚠️ No peer connection or candidate available");
      }
    });

    // Stream refresh request handler
    socket.on("requestStreamRefresh", async (data) => {
      console.log("🔄 Received stream refresh request from:", data.from);

      if (data.callId === callId && localStream && peerConnectionRef.current) {
        try {
          console.log("🔄 Refreshing local stream for peer...");

          // Remove existing senders
          const senders = peerConnectionRef.current.getSenders();
          for (const sender of senders) {
            if (sender.track) {
              await peerConnectionRef.current.removeTrack(sender);
              console.log("🔄 Removed existing track:", sender.track.kind);
            }
          }

          // Re-add tracks from current local stream
          localStream.getTracks().forEach((track) => {
            console.log("🔄 Re-adding track:", track.kind, "readyState:", track.readyState);
            if (track.readyState === "live") {
              peerConnectionRef.current!.addTrack(track, localStream);
            }
          });

          // Send refresh response
          socket.emit("streamRefreshResponse", {
            callId: data.callId,
            from: authProvider.getUserUuid(),
            to: data.from,
            success: true,
          });

          console.log("✅ Stream refresh completed and response sent");
        } catch (error) {
          console.error("❌ Error refreshing stream:", error);

          socket.emit("streamRefreshResponse", {
            callId: data.callId,
            from: authProvider.getUserUuid(),
            to: data.from,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });

    // Stream refresh response handler
    socket.on("streamRefreshResponse", (data) => {
      console.log("🔄 Received stream refresh response:", data);

      if (data.success) {
        console.log("✅ Peer successfully refreshed their stream");
      } else {
        console.error("❌ Peer failed to refresh stream:", data.error);
      }
    });

    return () => {
      socket.off("incomingVideoCall");
      socket.off("videoCallAccepted");
      socket.off("receiverReady");
      socket.off("videoCallRejected");
      socket.off("videoCallEnded");
      socket.off("webrtcOffer");
      socket.off("webrtcAnswer");
      socket.off("webrtcIceCandidate");
      socket.off("requestStreamRefresh");
      socket.off("streamRefreshResponse");
    };
  }, [
    socket,
    endCall,
    callType,
    getUserMedia,
    createPeerConnection,
    startConnectionTimeout,
    localStream,
    isIncomingCall,
    isInCall,
    callId,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only cleanup if we're actually in a call
      if (isInCall || isIncomingCall) {
        console.log("Component unmounting, cleaning up call");
        endCall();
      }
    };
  }, []); // Empty dependency array - only run on unmount

  return {
    // States
    isInCall,
    isIncomingCall,
    callId,
    callerId,
    callerName,
    callType,
    isCallMuted,
    isVideoOff,
    localStream,
    remoteStream,
    isConnecting,

    // Debug states
    iceConnectionState,
    connectionState,
    iceCandidatesReceived,
    iceCandidatesSent,

    // Refs
    localVideoRef,
    remoteVideoRef,

    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    syncRemoteStream,
    setIsConnecting,
  };
};
