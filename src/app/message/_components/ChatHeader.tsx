"use client";

import React from "react";
import { VideoCallButton } from "@/shared/providers/VideoCallProvider";

interface ChatHeaderProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar?: string;
  isOnline?: boolean;
}

export default function ChatHeader({
  conversationId,
  receiverId,
  receiverName,
  receiverAvatar,
  isOnline = false,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={receiverAvatar || "/assets/images/sample-avatar.jpeg"}
            alt={receiverName}
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{receiverName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Voice call button */}
        <VideoCallButton
          receiverId={receiverId}
          receiverName={receiverName}
          conversationId={conversationId}
          callType="audio"
        />

        {/* Video call button */}
        <VideoCallButton
          receiverId={receiverId}
          receiverName={receiverName}
          conversationId={conversationId}
          callType="video"
        />
      </div>
    </div>
  );
}
