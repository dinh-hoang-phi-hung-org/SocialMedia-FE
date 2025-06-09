"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Send, Image as ImageIcon, Smile, Paperclip, MoreVertical, X } from "lucide-react";
import { TMessage } from "@/shared/types/common-type/message-type";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TConversation } from "@/shared/types/common-type/conversation-type";
import TimeAgo from "@/shared/components/ui/TimeAgo";
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

interface ChatSectionProps {
  receiverUuid: string;
}

export default function ChatSection({ receiverUuid }: ChatSectionProps) {
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

  // Fetch messages and set up conversation
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await TypeTransfer["Message"].otherAPIs?.getMessages(receiverUuid, { page: 1, limit: pageSize });
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
  }, [receiverUuid, isConnected, socket]);

  const handleScroll = useCallback(async () => {
    if (!messagesContainerRef.current || isLoading || !hasMore) return;

    const { scrollTop } = messagesContainerRef.current;

    if (scrollTop === 0) {
      setIsLoading(true);
      const nextPage = page + 1;
      setShouldScrollToBottom(false);

      try {
        const response = await TypeTransfer["Message"].otherAPIs?.getMessages(receiverUuid, {
          page: nextPage,
          limit: pageSize,
        });

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
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading more messages:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [page, isLoading, hasMore, receiverUuid, pageSize]);

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

      const newMessage: TMessage = {
        conversationUuid: data.conversationUuid,
        messageUuid: data.messageUuid,
        content: data.content,
        isMyMessage: data.user.uuid === authProvider.getUserUuid(),
        createdAt: data.createdAt,
        user: data.user,
        mediaUrl: data.mediaUrl,
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
    const handleTypingEvent = (data: { userId: string; isTyping: boolean }) => {
      console.log("Typing event:", data);
      const currentUserId = authProvider.getUserUuid();
      if (data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleTypingEvent);

    return () => {
      console.log("Cleaning up message listeners");
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleTypingEvent);
    };
  }, [socket, isConnected]);

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
    if (!message.trim() || !isConnected || !socket || !conversation?.conversationUuid) return;

    try {
      const mediaFiles = getFilesFromMedia(selectedMedia);
      const response = await TypeTransfer["Message"].otherAPIs?.sendMessage(
        conversation.conversationUuid,
        receiverUuid,
        message,
        mediaFiles,
      );
      if (response?.payload) {
        console.log("Response:", response.payload);

        // Emit a custom event to notify that a message was sent
        // This will trigger the PeopleList to refresh
        if (socket && isConnected) {
          socket.emit("messageSent", {
            conversationId: conversation.conversationUuid,
            message: response.payload,
          });
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

    // Send typing status if connected
    if (isConnected && socket && conversation?.conversationUuid) {
      const currentUserId = localStorage.getItem("userId") || "guest";
      socket.emit("typing", {
        conversationId: conversation.conversationUuid,
        userId: currentUserId,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={conversation?.conversationUrl || "/assets/images/sample-avatar.jpeg"}
              alt={conversation?.conversationTitle || ""}
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="font-medium">{conversation?.conversationTitle}</h2>
            </div>
            {isTyping && <p className="text-xs text-gray-500 dark:text-gray-400">Typing...</p>}
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-purple"></div>
          </div>
        )}
        {[...messages].reverse().map((msg) => (
          <div
            key={msg.messageUuid}
            className={`flex ${msg.isMyMessage ? "justify-end" : "justify-start"}`}
            title={new Date(msg.createdAt).toLocaleString()}
          >
            {!msg.isMyMessage && (
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 self-end mb-1">
                <Image
                  src={msg.user.profilePictureUrl || "/assets/images/sample-avatar.jpeg"}
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
                <div className={`mb-1 ${msg.isMyMessage ? "self-end" : "self-start"}`}>
                  <div
                    className="grid grid-cols-2 gap-1"
                    style={{
                      width: msg.mediaUrl.images.length === 1 ? "120px" : "240px",
                    }}
                  >
                    {msg.mediaUrl.images.map((image, index) => (
                      <div
                        key={index}
                        className={`overflow-hidden rounded-lg ${msg.isMyMessage ? "rounded-br-none" : "rounded-bl-none"
                          } border border-gray-200`}
                        style={{
                          width: "120px",
                          height: "120px",
                          gridColumn: msg.mediaUrl.images.length === 1 ? "span 2" : "auto",
                        }}
                      >
                        <Image
                          src={ensureHttps(image.url)}
                          alt="Message image"
                          width={120}
                          height={120}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text message */}
              {msg.content && (
                <div
                  className={`p-3 rounded-lg ${msg.isMyMessage
                    ? "bg-primary-purple text-white rounded-br-none self-end"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none self-start"
                    }`}
                >
                  {msg.content}
                </div>
              )}

              <div className={`text-xs text-gray-500 mt-1 px-1 ${msg.isMyMessage ? "self-end" : "self-start"}`}>
                <TimeAgo timestamp={msg.createdAt} />
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {/* Image previews */}
        {imagePreviewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-black bg-opacity-50 rounded-full p-1"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-2">
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <Smile className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Message..."
            rows={1}
            value={message}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-1">
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleMediaUpload}
              className="hidden"
            />
            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white"
              onClick={handleSendMessage}
              disabled={(!message.trim() && selectedMedia.length === 0) || !isConnected}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
