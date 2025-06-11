"use client";

import React, { useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import { useSocket } from "@/shared/hooks/use-socket";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "file";
}

interface ChatPageProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
}

export default function ChatPage({ conversationId, receiverId, receiverName, receiverAvatar }: ChatPageProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  // Example messages (replace with real data)
  useEffect(() => {
    setMessages([
      {
        id: "1",
        senderId: "other",
        content: "Hello! How are you doing?",
        timestamp: new Date(Date.now() - 60000),
        type: "text",
      },
      {
        id: "2",
        senderId: "me",
        content: "I'm good, thanks! How about you?",
        timestamp: new Date(Date.now() - 30000),
        type: "text",
      },
    ]);
  }, []);

  // Socket listeners for user online status
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for user online status
    socket.on("userOnlineStatus", (data: { userId: string; isOnline: boolean }) => {
      if (data.userId === receiverId) {
        setIsOnline(data.isOnline);
      }
    });

    // Request current online status
    socket.emit("getUserOnlineStatus", receiverId);

    return () => {
      socket.off("userOnlineStatus");
    };
  }, [socket, isConnected, receiverId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: "me",
      content: newMessage,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, message]);

    // Send message via socket
    socket.emit("sendMessage", {
      conversationId,
      receiverId,
      content: newMessage,
      type: "text",
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat Header with Video Call Buttons */}
      <ChatHeader
        conversationId={conversationId}
        receiverId={receiverId}
        receiverName={receiverName}
        receiverAvatar={receiverAvatar}
        isOnline={isOnline}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.senderId === "me" ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
