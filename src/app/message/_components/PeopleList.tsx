"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { TConversation } from "@/shared/types/common-type/conversation-type";
import TimeAgo from "@/shared/components/ui/TimeAgo";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { useSocket } from "@/shared/hooks/use-socket";

interface PeopleListProps {
  selectedUser: string | null;
  onSelectUser: (userId: string) => void;
  conversations?: TConversation[]; // Make this optional
}

export default function PeopleList({
  selectedUser,
  onSelectUser,
  conversations: initialConversations,
}: PeopleListProps) {
  // const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<TConversation[]>([]);
  const { socket, isConnected } = useSocket();

  // Fetch conversations function
  const fetchConversations = async () => {
    try {
      const response = await TypeTransfer["Message"].otherAPIs?.getConversations({
        page: 1,
        limit: 10,
      });

      if (response?.payload.data) {
        setConversations(response.payload.data as unknown as TConversation[]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  useEffect(() => {
    if (initialConversations && initialConversations.length > 0) {
      setConversations(initialConversations);
    } else {
      fetchConversations();
    }
  }, [initialConversations]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = async () => {
      await fetchConversations();
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("messageSent", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("messageSent", handleNewMessage);
    };
  }, [socket, isConnected]);

  // Refresh conversations periodically
  useEffect(() => {
    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchConversations, 10000); // Every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold mb-4">Messages</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 pl-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
            // value={searchQuery}
            // onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {conversations?.map((conversation) => (
          <div
            key={conversation.conversationUuid}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              selectedUser === conversation.user.uuid ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
            onClick={() => onSelectUser(conversation.user.uuid)}
          >
            <div className="relative">
              <Image
                src={conversation.user.profilePictureUrl || "/assets/images/sample-avatar.jpeg"}
                alt={conversation.user.username}
                width={48}
                height={48}
                className="rounded-full"
              />
              {/* {conversation.user === "online" && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
              )} */}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{conversation.user.username}</h3>
                <TimeAgo
                  timestamp={conversation.lastMessage.createdAt}
                  className="text-xs text-gray-500 dark:text-gray-400"
                />
              </div>
              {conversation.lastMessage && (
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conversation.lastMessage.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
