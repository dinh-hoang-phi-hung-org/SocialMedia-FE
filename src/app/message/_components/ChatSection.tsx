"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Send, Image as ImageIcon, Smile, MoreVertical, X, Users as UsersIcon } from "lucide-react";
import { TMessage } from "@/shared/types/common-type/message-type";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TConversation } from "@/shared/types/common-type/conversation-type";
// import TimeAgo from "@/shared/components/ui/TimeAgo";
import { ensureHttps } from "@/shared/helpers/ensure-https";
import { useSocket } from "@/shared/hooks/use-socket";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { toast } from "@/shared/components/ui/toast";
import {
  getFilesFromMedia,
  isValidMediaType,
  TMediaFile,
  validateNewMedia,
} from "@/shared/types/common-type/file-type";
import { MessageType } from "@/shared/enums/message";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { useTranslation } from "react-i18next";
import EmojiPicker, { EmojiClickData, SuggestionMode } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import GroupMembersModal from "./GroupMembersModal";

interface ChatSectionProps {
  receiverUuid?: string;
  conversationUuid?: string;
}

const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;

const isEmoji = (text: string): boolean => {
  return emojiRegex.test(text);
};

const formatTimeSeparator = (date: string): string => {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 0) {
    return messageDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (diffInDays === 1) {
    const time = messageDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return "Hôm qua " + time;
  }

  if (diffInDays < 7) {
    const weekday = messageDate.toLocaleDateString("vi-VN", { weekday: "long" });
    const time = messageDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return weekday + " " + time;
  }

  const date_str = messageDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = messageDate.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return date_str + " " + time;
};

const shouldShowTimeSeparator = (currentMessage: TMessage, previousMessage: TMessage | null): boolean => {
  if (!previousMessage) return true; // Show for first message

  const currentTime = new Date(currentMessage.createdAt).getTime();
  const previousTime = new Date(previousMessage.createdAt).getTime();
  const timeDifference = Math.abs(currentTime - previousTime);

  const twoHoursInMs = 2 * 60 * 60 * 1000;
  return timeDifference > twoHoursInMs;
};

const TimeSeparator = ({ timestamp }: { timestamp: string }) => {
  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{formatTimeSeparator(timestamp)}</span>
      </div>
    </div>
  );
};

export default function ChatSection({ receiverUuid, conversationUuid }: ChatSectionProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [conversation, setConversation] = useState<TConversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<TMediaFile[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const pageSize = 10;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationUuid && !receiverUuid) return;

    setMessages([]);
    setConversation(null);
    setPage(1);
    setHasMore(true);

    const fetchMessages = async () => {
      console.log("Fetching messages with:", { conversationUuid, receiverUuid });
      const response = await TypeTransfer["Message"].otherAPIs?.getMessages(
        conversationUuid || "",
        receiverUuid || "",
        { page: 1, limit: pageSize },
      );
      if (response?.payload) {
        setConversation(response.payload.conversation);
        setMessages(response.payload.messages?.data || []);
        setHasMore(response.payload.messages?.data?.length >= pageSize);
        setPage(1);
        setShouldScrollToBottom(true);

        // Join the conversation room if socket is connected
        if (isConnected && socket && response.payload.conversation?.conversationUuid) {
          console.log(`Joining conversation room: ${response.payload.conversation.conversationUuid}`);
          socket.emit("joinRoom", { conversationId: response.payload.conversation.conversationUuid });
        }
      }
    };

    fetchMessages();
  }, [conversationUuid, receiverUuid, isConnected, socket]);

  const handleScroll = useCallback(async () => {
    if (!messagesContainerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight } = messagesContainerRef.current;

    // Trigger load when near the top (within 100px)
    if (scrollTop < 100) {
      setIsLoading(true);
      const nextPage = page + 1;
      setShouldScrollToBottom(false);

      // Save current scroll position and height
      const previousScrollHeight = scrollHeight;

      try {
        const response = await TypeTransfer["Message"].otherAPIs?.getMessages(
          conversationUuid || "",
          receiverUuid || "",
          {
            page: nextPage,
            limit: pageSize,
          },
        );

        if (response?.payload?.messages?.data?.length) {
          const newMessages = response.payload.messages.data;
          setMessages((prevMessages) => {
            // Filter out messages that already exist to prevent duplicates
            const existingUuids = new Set(prevMessages.map((msg: TMessage) => msg.messageUuid));
            const uniqueNewMessages = newMessages.filter((msg: TMessage) => !existingUuids.has(msg.messageUuid));
            return [...prevMessages, ...uniqueNewMessages];
          });
          setPage(nextPage);
          setHasMore(response.payload.messages.data.length >= pageSize);

          // Maintain scroll position after loading old messages
          setTimeout(() => {
            if (messagesContainerRef.current) {
              const newScrollHeight = messagesContainerRef.current.scrollHeight;
              const scrollDifference = newScrollHeight - previousScrollHeight;
              messagesContainerRef.current.scrollTop = scrollTop + scrollDifference;
            }
          }, 100);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading more messages:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [page, isLoading, hasMore, receiverUuid, conversationUuid, pageSize]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("Setting up real-time message listeners");

    const handleReceiveMessage = (data: TMessage) => {
      console.log("Received message:", data);

      // Kiểm tra xem tin nhắn có thuộc về conversation hiện tại không
      if (conversation?.conversationUuid && data.conversationUuid !== conversation.conversationUuid) {
        console.log("Message not for current conversation, ignoring");
        return;
      }

      const newMessage: TMessage = {
        conversationUuid: data.conversationUuid,
        messageUuid: data.messageUuid,
        content: data.content,
        isMyMessage: data.user.uuid === authProvider.getUserUuid(),
        createdAt: data.createdAt,
        user: data.user,
        mediaUrl: data.mediaUrl,
        type: data.type,
      };

      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prevMessages.some((msg: TMessage) => msg.messageUuid === newMessage.messageUuid);
        if (messageExists) {
          return prevMessages;
        }
        return [newMessage, ...prevMessages];
      });
      // setShouldScrollToBottom(true);
    };

    // Listen for typing indicators
    const handleTypingEvent = (data: {
      userId: string;
      username: string;
      isTyping: boolean;
      conversationId: string;
    }) => {
      console.log("Typing event:", data);
      const currentUserId = authProvider.getUserUuid();

      // Only show typing for other users, not current user
      if (data.userId !== currentUserId && data.conversationId === conversation?.conversationUuid) {
        setIsTyping(data.isTyping);

        // Auto clear typing indicator after 3 seconds
        if (data.isTyping) {
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    };

    // Xử lý sự kiện join conversation mới
    const handleJoinNewConversation = (data: { conversationUuid: string; message: TMessage }) => {
      console.log("Join new conversation:", data);

      // Chỉ xử lý nếu tin nhắn liên quan đến user hiện tại
      const currentUserUuid = authProvider.getUserUuid();
      const isMessageForMe = data.message.user.uuid === receiverUuid && data.message.isMyMessage === false;
      const isMyMessage = data.message.user.uuid === currentUserUuid;

      // Chỉ xử lý nếu đây là conversation mới với người đang chat
      if (!(isMessageForMe || isMyMessage) || data.conversationUuid === conversation?.conversationUuid) {
        return;
      }

      // Join vào room conversation mới
      socket.emit("joinRoom", { conversationId: data.conversationUuid });

      // Cập nhật conversation hiện tại nếu đang chat với người này
      setConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          conversationUuid: data.conversationUuid,
        };
      });

      // Thêm tin nhắn vào danh sách
      const newMessage: TMessage = {
        conversationUuid: data.message.conversationUuid,
        messageUuid: data.message.messageUuid,
        content: data.message.content,
        isMyMessage: data.message.user.uuid === currentUserUuid,
        createdAt: data.message.createdAt,
        user: data.message.user,
        mediaUrl: data.message.mediaUrl,
        type: data.message.type,
      };

      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg: TMessage) => msg.messageUuid === newMessage.messageUuid);
        if (messageExists) {
          return prevMessages;
        }
        return [newMessage, ...prevMessages];
      });
      setShouldScrollToBottom(true);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleTypingEvent);
    socket.on("joinNewConversation", handleJoinNewConversation);

    // Handle when current user is removed from group
    const handleRemovedFromGroup = (data: { conversationUuid: string; message: string }) => {
      console.log("Current user removed from group:", data);
      if (data.conversationUuid === conversation?.conversationUuid) {
        socket.emit("leaveRoom", { conversationId: data.conversationUuid });

      }
    };

    socket.on("removedFromGroup", handleRemovedFromGroup);

    return () => {
      console.log("Cleaning up message listeners");
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleTypingEvent);
      socket.off("joinNewConversation", handleJoinNewConversation);
      socket.off("removedFromGroup", handleRemovedFromGroup);

      // Cleanup typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, isConnected, receiverUuid, conversationUuid, conversation]);

  useEffect(() => {
    if (!socket || !isConnected || !conversation?.conversationUuid) return;

    console.log(`Joining conversation room: ${conversation.conversationUuid}`);
    socket.emit("joinRoom", { conversationId: conversation.conversationUuid });

    return () => {
      if (conversation?.conversationUuid) {
        console.log(`Leaving conversation room: ${conversation.conversationUuid}`);
        socket.emit("leaveRoom", { conversationId: conversation.conversationUuid });
      }
    };
  }, [socket, isConnected, conversation]);

  useEffect(() => {
    if (shouldScrollToBottom && messagesContainerRef.current) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages.filter((msg) => !msg.isMyMessage && !msg.isSeen);
      if (unreadMessages.length > 0) {
        TypeTransfer["Message"].otherAPIs?.markMessageAsSeen(unreadMessages[0].messageUuid);
      }
    }
  }, [messages]);

  // Handle file selection
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = validateNewMedia(selectedMedia, files);

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const typeCheck = isValidMediaType(file);
          setSelectedMedia((prev) => [
            ...prev,
            {
              file: file,
              preview: e.target!.result as string,
              type: typeCheck.type!,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImagePreviewUrls((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))]);
    e.target.value = "";
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedMedia((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });

    setImagePreviewUrls((prev) => {
      // Revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected || !socket) return;

    // Clear typing timeout and send typing stopped before sending message
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing stopped
    const currentUserUuid = authProvider.getUserUuid();
    const currentUsername = authProvider.getUsername();
    if (currentUserUuid && conversation?.conversationUuid) {
      socket.emit("typing", {
        conversationId: conversation.conversationUuid,
        userId: currentUserUuid,
        username: currentUsername || "Unknown User",
        isTyping: false,
      });
    }

    try {
      const mediaFiles = getFilesFromMedia(selectedMedia);
      const response = await TypeTransfer["Message"].otherAPIs?.sendMessage(
        conversation?.conversationUuid,
        receiverUuid,
        message,
        mediaFiles,
      );
      if (response?.payload) {
        console.log("Response:", response.payload);

        if (socket && isConnected) {
          console.log("Sending events via socket...");
          console.log("Socket state:", { connected: socket.connected, isConnected });

          socket.emit("messageSent", {
            conversationId: conversation?.conversationUuid || response.payload.conversationUuid,
            message: response.payload,
            receiverUuid: receiverUuid,
          });
          console.log("Emitted messageSent with receiver:", receiverUuid);
        } else {
          console.log("Socket not ready in ChatSection:", { socket: !!socket, isConnected });
        }
      }
      // eslint-disable-next-line
    } catch (error: any) {
      toast.error({
        title: "common:error.post_failed",
        description: error.message || "common:error.something_went_wrong",
      });
    }

    setMessage("");
    setShouldScrollToBottom(true);

    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedMedia([]);
    setImagePreviewUrls([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Send typing status if connected and in a conversation
    if (isConnected && socket && conversation?.conversationUuid) {
      const currentUserUuid = authProvider.getUserUuid();
      const currentUsername = authProvider.getUsername();

      if (currentUserUuid) {
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Send typing started
        socket.emit("typing", {
          conversationId: conversation.conversationUuid,
          userId: currentUserUuid,
          username: currentUsername || "Unknown User",
          isTyping: e.target.value.length > 0,
        });

        if (e.target.value.length > 0) {
          typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typing", {
              conversationId: conversation.conversationUuid,
              userId: currentUserUuid,
              username: currentUsername || "Unknown User",
              isTyping: false,
            });
          }, 2000);
        }
      }
    }
  };

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      const emoji = emojiData.emoji;

      const cursorPosition = message.length;
      const textBeforeCursor = message.slice(0, cursorPosition);
      const textAfterCursor = message.slice(cursorPosition);

      let newContent = "";

      if (cursorPosition > 0 && isEmoji(message[cursorPosition - 1])) {
        newContent = textBeforeCursor.slice(0, -1) + emoji + textAfterCursor;
      } else if (cursorPosition < message.length && isEmoji(message[cursorPosition])) {
        newContent = textBeforeCursor + emoji + textAfterCursor.slice(1);
      } else {
        newContent = textBeforeCursor + emoji + textAfterCursor;
      }

      setMessage(newContent);

      // requestAnimationFrame(() => {

      // });
    },
    [message],
  );

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const emojiPickerComponent = useMemo(
    () =>
      showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute z-10 bottom-16 left-0" onClick={handleModalClick}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={350}
            theme={Theme.LIGHT}
            searchDisabled={false}
            lazyLoadEmojis={true}
            suggestedEmojisMode={SuggestionMode.RECENT}
            skinTonesDisabled
            previewConfig={{
              showPreview: false,
            }}
          />
        </div>
      ),
    [showEmojiPicker, handleEmojiClick],
  );

  // Check if current conversation is a group chat
  const isGroupChat = conversation?.conversationTitle && !receiverUuid;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Image
              src={
                conversation?.conversationUrl ||
                (conversation?.isGroupChat ? "/assets/images/sample-group.png" : "/assets/images/sample-avatar.png")
              }
              alt={conversation?.conversationTitle || ""}
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-medium">{conversation?.conversationTitle}</h2>
            </div>
            {isTyping && <p className="text-xs text-gray-500 dark:text-gray-400">Typing...</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGroupChat && (
            <button
              onClick={() => setShowGroupMembersModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="View group members"
            >
              <UsersIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Scroll up indicator */}
        {hasMore && !isLoading && (
          <div className="flex justify-center py-2 opacity-60 hover:opacity-100 transition-opacity">
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              ↑ Lướt lên để xem tin nhắn cũ
            </div>
          </div>
        )}

        {isLoading && hasMore && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-purple"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Đang tải tin nhắn cũ...</span>
            </div>
          </div>
        )}
        {[...messages].reverse().map((msg, index) => {
          const reversedMessages = [...messages].reverse();
          const previousMessage = index > 0 ? reversedMessages[index - 1] : null;
          const showTimeSeparator = shouldShowTimeSeparator(msg, previousMessage);

          return (
            <div key={msg.messageUuid}>
              {/* Time separator */}
              {showTimeSeparator && <TimeSeparator timestamp={msg.createdAt.toString()} />}

              {msg.type !== MessageType.NOTIFICATION ? (
                <div
                  className={`flex ${msg.isMyMessage ? "justify-end" : "justify-start"} cursor-default`}
                  title={new Date(msg.createdAt).toLocaleString()}
                >
                  {!msg.isMyMessage && (
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0 self-end mb-1 ring-2 ring-white dark:ring-gray-800 shadow-md">
                      <Image
                        src={msg.user.profilePictureUrl || "/assets/images/sample-avatar.png"}
                        alt={msg.user.username}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col" style={{ maxWidth: "70%" }}>
                    {/* Images container - separate from the text message */}
                    {msg.mediaUrl && msg.mediaUrl.images && msg.mediaUrl.images.length > 0 && (
                      <div className={`mb-2 ${msg.isMyMessage ? "self-end" : "self-start"}`}>
                        <div
                          className="grid grid-cols-2 gap-2 p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                          style={{
                            width: msg.mediaUrl.images.length === 1 ? "140px" : "280px",
                          }}
                        >
                          {msg.mediaUrl.images.map((image, index) => (
                            <div
                              key={index}
                              className={`overflow-hidden rounded-xl border-2 border-white dark:border-gray-700 shadow-md`}
                              style={{
                                width: "130px",
                                height: "130px",
                                gridColumn: msg.mediaUrl.images.length === 1 ? "span 2" : "auto",
                              }}
                            >
                              <Image
                                src={ensureHttps(image.url)}
                                alt="Message image"
                                width={130}
                                height={130}
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Text message */}
                    {msg.content && (
                      <div className={`${msg.isMyMessage ? "self-end" : "self-start"}`}>
                        <div
                          className={`p-3 rounded-full text-sm font-medium w-fit ${msg.isMyMessage
                            ? "bg-gradient-to-br from-primary-purple to-purple-600 text-white rounded-br-md shadow-lg shadow-purple-500/25 "
                            : "bg-gradient-to-br from-white to-gray-50  text-gray-900 rounded-bl-md shadow-xl shadow-gray-300/60 border border-blue-200/30 ring-1 ring-gray-200/40"
                            }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    )}

                    {/* Timestamp - separate container */}
                    {/* <div className={`${msg.isMyMessage ? "self-end" : "self-start"}`}>
                    <div className={`text-xs text-gray-400 mt-2 px-2 font-medium`}>
                      <TimeAgo timestamp={msg.createdAt} />
                    </div>
                 </div> */}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <LabelShadcn
                    text={msg.content}
                    splitAndTranslate
                    translate
                    className="p-3 rounded-lg bg-transparent text-primary-purple text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {/* Image previews */}
        {imagePreviewUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3 p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            {imagePreviewUrls.map((url, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 ring-2 ring-white dark:ring-gray-800"
              >
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-center bg-gradient-to-r from-white to-gray-50 rounded-3xl p-2 border border-gray-200/70 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40 transition-all duration-300 backdrop-blur-sm">
          <button
            className="p-2.5 rounded-full hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-110"
            onClick={toggleEmojiPicker}
          >
            <Smile className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          {emojiPickerComponent}

          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 focus:border-none focus:outline-none resize-none max-h-32 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 px-3 py-2 font-medium"
            placeholder={t("message:text.message")}
            rows={1}
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-2">
            {/* {/* <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button> */}
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleMediaUpload}
              className="hidden"
            />
            <button
              className="p-2.5 rounded-full hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-110"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              className="p-2.5 rounded-full bg-gradient-to-r from-primary-purple to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 hover:scale-110"
              onClick={handleSendMessage}
              disabled={(!message.trim() && selectedMedia.length === 0) || !isConnected}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Group Members Modal */}
      <GroupMembersModal
        isOpen={showGroupMembersModal}
        onClose={() => setShowGroupMembersModal(false)}
        conversation={conversation}
        users={conversation?.users || []}
      />
    </div>
  );
}
