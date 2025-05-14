"use client";

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { socketService } from "../services/socket-service";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Lấy ID người dùng từ localStorage hoặc hệ thống xác thực của bạn
    const userId = localStorage.getItem("userId") || "guest";

    // Kết nối đến socket server
    const socketInstance = socketService.connect(userId);

    if (socketInstance) {
      setSocket(socketInstance);

      // Thiết lập event listeners
      const onConnect = () => {
        console.log("Socket connected in hook");
        setIsConnected(true);
      };

      const onDisconnect = () => {
        console.log("Socket disconnected in hook");
        setIsConnected(false);
      };

      socketInstance.on("connect", onConnect);
      socketInstance.on("disconnect", onDisconnect);

      // Kiểm tra nếu đã kết nối
      if (socketInstance.connected) {
        setIsConnected(true);
      }

      // Dọn dẹp event listeners khi unmount
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
