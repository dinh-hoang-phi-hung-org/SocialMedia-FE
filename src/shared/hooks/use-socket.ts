"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { socketService } from "../services/socket-service";
import { authProvider } from "../utils/middleware/auth-provider";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const userUuid = authProvider.getUserUuid();

    if (!userUuid) {
      console.log("No user UUID found, not connecting socket");
      return;
    }

    const socketInstance = socketService.connect(userUuid);

    if (socketInstance) {
      setSocket(socketInstance);

      const onConnect = () => {
        console.log("Socket connected in hook");
        setIsConnected(true);

        socketInstance.emit("authenticate", userUuid, (response: any) => {
          console.log("Socket authentication response:", response);
        });
      };

      const onDisconnect = (reason: string) => {
        console.log("Socket disconnected in hook, reason:", reason);
        setIsConnected(false);

        // If disconnect wasn't intentional, attempt to reconnect
        if (reason !== "io client disconnect") {
          console.log("Unexpected disconnect, socket will attempt to reconnect automatically");
        }
      };

      const onReconnect = (attemptNumber: number) => {
        console.log(`Socket reconnected successfully after ${attemptNumber} attempts`);
        setIsConnected(true);

        // Re-authenticate on reconnection
        socketInstance.emit("authenticate", userUuid, (response: any) => {
          console.log("Socket re-authentication response:", response);
        });
      };

      const onReconnectError = (error: Error) => {
        console.error("Socket reconnection failed:", error);
      };

      socketInstance.on("connect", onConnect);
      socketInstance.on("disconnect", onDisconnect);
      socketInstance.on("reconnect", onReconnect);
      socketInstance.on("reconnect_error", onReconnectError);

      if (socketInstance.connected) {
        setIsConnected(true);
        socketInstance.emit("authenticate", userUuid, (response: any) => {
          console.log("Socket authentication response:", response);
        });
      }

      return () => {
        socketInstance.off("connect", onConnect);
        socketInstance.off("disconnect", onDisconnect);
        socketInstance.off("reconnect", onReconnect);
        socketInstance.off("reconnect_error", onReconnectError);
      };
    } else {
      console.error("Failed to create socket instance");
    }
  }, []);

  return { socket, isConnected };
}
