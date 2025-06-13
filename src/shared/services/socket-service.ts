"use client";

import { io, Socket } from "socket.io-client";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private socketUrl: string;

  private constructor() {
    // Kết nối đến socket server của backend
    this.socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
    console.log("Socket URL:", this.socketUrl);
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(userId: string): Socket | null {
    if (!this.socket) {
      try {
        console.log("Attempting to connect to socket server at:", this.socketUrl);

        this.socket = io(`${this.socketUrl}`, {
          transports: ["websocket"],
          autoConnect: true,
        });

        // Setup default listeners
        this.socket.on("connect", () => {
          console.log("Socket connected successfully");
          // Xác thực người dùng khi kết nối thành công
          this.socket?.emit("authenticate", userId);
        });

        this.socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });

        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          console.log("Will try to reconnect automatically");
        });
      } catch (error) {
        console.error("Error creating socket connection:", error);
        return null;
      }
    }

    return this.socket;
  }
}

export const socketService = SocketService.getInstance();
