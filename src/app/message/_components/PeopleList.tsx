"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { MdGroupAdd } from "react-icons/md";
import { TConversation } from "@/shared/types/common-type/conversation-type";
import TimeAgo from "@/shared/components/ui/TimeAgo";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { useSocket } from "@/shared/hooks/use-socket";
import { TUser } from "@/shared/types/common-type/user-type";
import { motion } from "framer-motion";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import CreateGroupModal from "./CreateGroupModal";
import { useTranslation } from "react-i18next";

interface PeopleListProps {
  selectedConversation: { conversationUuid?: string; userId?: string };
  onSelectUser: (conversationUuid?: string, userId?: string) => void;
  conversations?: TConversation[]; // Make this optional
}

export default function PeopleList({
  selectedConversation,
  onSelectUser,
  conversations: initialConversations,
}: PeopleListProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<TConversation[]>([]);
  const { socket, isConnected } = useSocket();
  const [searchResults, setSearchResults] = useState<TUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await TypeTransfer["User"]?.otherAPIs?.getUsers({
        page: 1,
        limit: 10,
        searchFields: "username,first_name,last_name",
        searchValue: query,
      });

      setSearchResults(results?.payload?.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const fetchConversations = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      }

      const response = await TypeTransfer["Message"].otherAPIs?.getConversations({
        page,
        limit: ITEMS_PER_PAGE,
      });

      if (response?.payload.data) {
        const newConversations = response.payload.data as unknown as TConversation[];

        if (append) {
          setConversations((prev) => [...prev, ...newConversations]);
        } else {
          setConversations(newConversations);
        }

        const totalPages = response.payload.meta?.lastPage || 1;
        setHasMoreData(page < totalPages);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      }
    }
  };

  const loadMoreConversations = useCallback(() => {
    if (!isLoadingMore && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchConversations(nextPage, true);
    }
  }, [currentPage, isLoadingMore, hasMoreData]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    if (isNearBottom && !isLoadingMore && hasMoreData && !searchQuery) {
      loadMoreConversations();
    }
  }, [loadMoreConversations, isLoadingMore, hasMoreData, searchQuery]);

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (initialConversations && initialConversations.length > 0) {
      setConversations(initialConversations);
    } else {
      // Reset pagination when component mounts
      setCurrentPage(1);
      setHasMoreData(true);
      fetchConversations(1, false);
    }
  }, [initialConversations]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = async () => {
      console.log("New message received");
      setCurrentPage(1);
      setHasMoreData(true);
      await fetchConversations(1, false);
    };

    const handleUpdateConversation = async (data: { userUuid: string }) => {
      console.log("Update conversation", data);
      const currentUserUuid = authProvider.getUserUuid();
      if (currentUserUuid && data.userUuid === currentUserUuid) {
        setCurrentPage(1);
        setHasMoreData(true);
        await fetchConversations(1, false);
      }
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("messageSent", handleNewMessage);
    socket.on("updateConversation", handleUpdateConversation);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("messageSent", handleNewMessage);
      socket.off("updateConversation", handleUpdateConversation);
    };
  }, [socket, isConnected]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex md:flex-col lg:flex-row md:items-start md:gap-2 items-center justify-between mb-4">
          <LabelShadcn text="message:title.messages" translate className="text-xl font-bold" />
          <button
            onClick={() => setIsCreateGroupModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-dark transition-colors text-sm md:w-full lg:w-auto"
          >
            <MdGroupAdd className="h-4 w-4" />
            <LabelShadcn
              text="message:group.create-group"
              translate
              className="text-white text-sm hidden md:block lg:hidden xl:block"
            />
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder={t("common:text.search-users")}
            className="w-full p-2 pl-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none md:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      <div ref={scrollContainerRef} className="overflow-y-auto flex-1 relative">
        {/* Search Overlay */}
        {searchQuery && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 z-10 p-4">
            <div className="text-center">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <Search className="h-10 w-10 mx-auto mb-2 opacity-50 text-primary-purple" />
                    <LabelShadcn text="common:text.searching" translate className="" />
                  </div>
                </div>
              ) : searchResults?.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.uuid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                      onClick={() => onSelectUser(undefined, user.uuid)}
                    >
                      <div className="h-10 w-10 rounded-full border border-gray-200">
                        <Image
                          src={user.profilePictureUrl || "/assets/images/sample-avatar.png"}
                          alt={user.username || ""}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover rounded-full"
                        />
                      </div>
                      <div className="flex-1 flex flex-col items-start">
                        <p className="font-medium text-sm">{user.username}</p>
                        <p className="text-xs text-gray-500">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <LabelShadcn
                    text="common:text.search-not-found"
                    translate
                    className="text-gray-500 dark:text-gray-400"
                  />
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <LabelShadcn text="common:text.delete-search" translate className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversations List */}
        {conversations?.map((conversation) => (
          <div
            key={conversation.conversationUuid}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors 
              ${conversation.isGroupChat ? (selectedConversation.conversationUuid === conversation.conversationUuid ? "bg-gray-100 dark:bg-gray-800" : "") : selectedConversation.userId === conversation.user.uuid ? "bg-gray-100 dark:bg-gray-800" : ""}
              `}
            onClick={() => {
              // Mark conversation as seen when clicked
              if (
                conversation.lastMessage &&
                !conversation.lastMessage.isMyMessage &&
                !conversation.lastMessage.isSeen
              ) {
                // Update local state immediately for instant UI feedback
                setConversations((prevConversations) =>
                  prevConversations.map((conv) =>
                    conv.conversationUuid === conversation.conversationUuid
                      ? ({
                          ...conv,
                          lastMessage: conv.lastMessage
                            ? {
                                ...conv.lastMessage,
                                isSeen: true,
                              }
                            : conv.lastMessage,
                        } as TConversation)
                      : conv,
                  ),
                );

                // TODO: Call API to mark message as seen
                // TypeTransfer["Message"].otherAPIs?.markMessageAsSeen(conversation.lastMessage.messageUuid);
              }

              onSelectUser(
                conversation.isGroupChat ? conversation.conversationUuid : undefined,
                conversation.isGroupChat ? undefined : conversation.user.uuid,
              );
            }}
          >
            <div className="relative w-12 h-12 rounded-full shadow-md border border-background-primary-purple">
              <Image
                src={
                  conversation.isGroupChat
                    ? conversation.conversationUrl || "/assets/images/sample-group.png"
                    : conversation.user.profilePictureUrl || "/assets/images/sample-avatar.png"
                }
                alt={conversation.isGroupChat ? conversation.conversationTitle : conversation.user.username}
                width={48}
                height={48}
                className="w-full h-full rounded-full object-cover"
              />
              {/* {conversation.user === "online" && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
              )} */}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {conversation.isGroupChat ? conversation.conversationTitle : conversation.user.username}
                  </h3>
                  {conversation.lastMessage &&
                    !conversation.lastMessage.isMyMessage &&
                    !conversation.lastMessage.isSeen &&
                    !(conversation.isGroupChat
                      ? selectedConversation.conversationUuid === conversation.conversationUuid
                      : selectedConversation.userId === conversation.user.uuid) && (
                      <div className="w-2 h-2 bg-primary-purple rounded-full flex-shrink-0"></div>
                    )}
                </div>

                <div className="hidden xl:block">
                  {conversation.lastMessage && (
                    <TimeAgo
                      timestamp={conversation.lastMessage.createdAt}
                      className="text-xs text-gray-500 dark:text-gray-400"
                    />
                  )}
                </div>
              </div>
              {conversation.lastMessage && (
                <LabelShadcn
                  text={conversation.lastMessage.content}
                  splitAndTranslate
                  translate
                  className={`text-sm truncate ${
                    conversation.lastMessage.isMyMessage
                      ? "text-gray-500 dark:text-gray-400 font-normal"
                      : (
                            conversation.isGroupChat
                              ? selectedConversation.conversationUuid === conversation.conversationUuid
                              : selectedConversation.userId === conversation.user.uuid
                          )
                        ? "text-gray-500 dark:text-gray-400 font-normal"
                        : conversation.lastMessage.isSeen
                          ? "text-gray-500 dark:text-gray-400 font-normal"
                          : "text-gray-900 dark:text-gray-100 font-semibold"
                  }`}
                />
              )}
            </div>
          </div>
        ))}

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary-purple" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Đang tải thêm...</span>
          </div>
        )}

        {/* No More Data Indicator */}
        {!hasMoreData && conversations.length > 0 && !searchQuery && (
          <div className="flex justify-center items-center py-4">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Đã tải hết dữ liệu</span>
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onGroupCreated={async () => {
          // Refresh conversations after group creation
          setCurrentPage(1);
          setHasMoreData(true);
          fetchConversations(1, false);
          // Optionally navigate to the new group conversation
          // You can implement this based on your routing logic
        }}
      />
    </div>
  );
}
