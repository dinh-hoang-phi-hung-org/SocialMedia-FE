"use client";

import { useState, useEffect } from "react";
import { X, Search, Users, UserPlus } from "lucide-react";
import { FaUserMinus } from "react-icons/fa";
import Image from "next/image";
import { TUser, TUserShortCut } from "@/shared/types/common-type/user-type";
import { TConversation } from "@/shared/types/common-type/conversation-type";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { toast } from "@/shared/components/ui/toast";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { useTranslation } from "react-i18next";

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: TConversation | null;
  users: TUserShortCut[];
}

export default function GroupMembersModal({ isOpen, onClose, conversation, users }: GroupMembersModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"members" | "add">("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const currentUserUuid = authProvider.getUserUuid();
  const [usersSearch, setUsersSearch] = useState<TUserShortCut[]>([]);

  // Fetch users for adding when switching to add tab
  useEffect(() => {
    if (isOpen && activeTab === "add") {
      fetchUsersToAdd();
    }
  }, [isOpen, activeTab, searchQuery]);

  const fetchUsersToAdd = async () => {
    setIsLoading(true);
    try {
      const response = await TypeTransfer["User"]?.otherAPIs?.getUsers({
        page: 1,
        limit: 20,
        searchFields: searchQuery ? "username,first_name,last_name" : "",
        searchValue: searchQuery,
      });
      if (response?.payload?.data) {
        // Filter out users who are already members
        const memberUuids = new Set(users.map((user: TUserShortCut) => user.uuid));
        const availableUsers = response.payload.data.filter((user: TUserShortCut) => !memberUuids.has(user.uuid));
        setUsersSearch(availableUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error({
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserSelection = (user: TUser) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.uuid === user.uuid);
      if (isSelected) {
        return prev.filter((u) => u.uuid !== user.uuid);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error({
        title: "common:notification.error",
        description: "message:message.at-least-one-member-required",
      });
      return;
    }

    if (!conversation?.conversationUuid) return;

    setIsAdding(true);
    try {
      const userUuids = selectedUsers.map((user) => user.uuid);
      const response = await TypeTransfer["Message"]?.otherAPIs?.addMembersToGroup(
        conversation.conversationUuid,
        userUuids,
      );

      if (response?.success) {
        const currentUsername = authProvider.getUsername();
        const initialMessage = `${currentUsername || "Someone"} message:group.added-members`;

        await TypeTransfer["Message"]?.otherAPIs?.sendMessage(
          conversation.conversationUuid,
          undefined,
          initialMessage,
          "notification",
        );
        onClose();
      }
    } catch (error) {
      console.error("Error adding group members:", error);
      toast.error({
        title: "Error",
        description: "message:message.add-members-failed",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (memberUuid: string, memberUsername: string) => {
    if (!conversation?.conversationUuid) return;

    try {
      const response = await TypeTransfer["Message"]?.otherAPIs?.removeMembersFromGroup(
        conversation.conversationUuid,
        memberUuid,
      );

      if (response?.success) {
        const currentUsername = authProvider.getUsername();
        const initialMessage = `${currentUsername || "Someone"} message:group.removed-members ${memberUsername}`;

        await TypeTransfer["Message"]?.otherAPIs?.sendMessage(
          conversation.conversationUuid,
          undefined,
          initialMessage,
          "notification",
        );
        onClose();
      }
    } catch (error) {
      console.error("Error removing group member:", error);
      toast.error({
        title: "Error",
        description: "Failed to remove member",
      });
    }
  };

  const handleLeaveConversation = async () => {
    if (!conversation?.conversationUuid) return;
    await TypeTransfer["Message"]?.otherAPIs?.leaveConversation(conversation.conversationUuid);
    onClose();
  };

  const handleClose = () => {
    setActiveTab("members");
    setSearchQuery("");
    setSelectedUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Image
              src={conversation?.conversationUrl || "/assets/images/sample-group.png"}
              alt={conversation?.conversationTitle || "Group"}
              width={40}
              height={40}
              className="rounded-full w-10 h-10"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{conversation?.conversationTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {users.length} {t("message:group.members")}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "members"
              ? "text-primary-purple border-b-2 border-primary-purple bg-purple-50 dark:bg-purple-900/20"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>{t("message:group.members")}</span>
            </div>
          </button>
          {conversation?.isGroupChat && conversation?.adminUuid === currentUserUuid && (
            <button
              onClick={() => setActiveTab("add")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "add"
                ? "text-primary-purple border-b-2 border-primary-purple bg-purple-50 dark:bg-purple-900/20"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span>{t("message:group.add-members")}</span>
              </div>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "members" ? (
            /* Members List */
            <div className="h-full overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-purple"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.uuid}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.profilePictureUrl || "/assets/images/sample-avatar.png"}
                          alt={user.username || "User"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                            {user.uuid === currentUserUuid && (
                              <LabelShadcn text="common:text.you" translate className="text-xs bg-primary-purple text-white px-2 py-1 rounded-full" />
                            )}
                          </div>
                          {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.firstName || ""} {user.lastName || ""}
                          </p> */}
                        </div>
                      </div>

                      {/* Only show options if current user is admin and it's not themselves */}
                      {conversation?.isGroupChat && conversation?.adminUuid === currentUserUuid && user.uuid !== currentUserUuid && (
                        <button
                          onClick={() => handleRemoveMember(user.uuid, user.username)}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title="Remove member"
                        >
                          <FaUserMinus className="h-4 w-4 text-gray-500" />
                        </button>
                      )}

                      {
                        conversation?.isGroupChat && conversation?.adminUuid !== currentUserUuid && user.uuid === currentUserUuid && (
                          <button
                            onClick={() => handleLeaveConversation()}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Leave group"
                          >
                            <FaUserMinus className="h-4 w-4 text-gray-500" />
                          </button>
                        )
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Add Members */

            <div className="h-3/5 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("message:group.search-users")}
                    className="text-sm w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("message:group.selected")} ({selectedUsers.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.uuid}
                        className="flex items-center gap-2 bg-primary-purple text-white px-2 py-1 rounded-full text-xs"
                      >
                        <Image
                          src={user.profilePictureUrl || "/assets/images/sample-avatar.png"}
                          alt={user.username || "User"}
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                        <span>{user.username}</span>
                        <button onClick={() => toggleUserSelection(user)} className="text-white hover:text-gray-200">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-purple"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {usersSearch.map((user) => {
                      const isSelected = selectedUsers.some((u) => u.uuid === user.uuid);
                      return (
                        <div
                          key={user.uuid}
                          onClick={() => toggleUserSelection(user as TUser)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected
                            ? "bg-primary-purple bg-opacity-10 border border-primary-purple"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                          <Image
                            src={user.profilePictureUrl || "/assets/images/sample-avatar.png"}
                            alt={user.username || "User"}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {/* {user.firstName || ""} {user.lastName || ""} */}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-primary-purple rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Button */}
              {activeTab === "add" && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleAddMembers}
                    disabled={selectedUsers.length === 0 || isAdding}
                    className="w-full px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <LabelShadcn
                      text={isAdding ? "common:button.adding" : `message:group.add-members (${selectedUsers.length})`}
                      translate
                      className="cursor-pointer text-sm text-white"
                      splitAndTranslate
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
