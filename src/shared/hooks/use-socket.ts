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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketInstance.emit("authenticate", userUuid, (response: any) => {
          console.log("Socket authentication response:", response);
        });
      };

      const onDisconnect = () => {
        console.log("Socket disconnected in hook");
        setIsConnected(false);
      };

      socketInstance.on("connect", onConnect);
      socketInstance.on("disconnect", onDisconnect);

      if (socketInstance.connected) {
        setIsConnected(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketInstance.emit("authenticate", userUuid, (response: any) => {
          console.log("Socket authentication response:", response);
        });
      }

      return () => {
        socketInstance.off("connect", onConnect);
        socketInstance.off("disconnect", onDisconnect);
      };
    } else {
      console.error("Failed to create socket instance");
    }
  }, []);

  return { socket, isConnected };
}
