"use client";

import { useState, useEffect } from "react";
import { X, Search, Users, Check } from "lucide-react";
import Image from "next/image";
import { TUser } from "@/shared/types/common-type/user-type";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { toast } from "@/shared/components/ui/toast";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { useTranslation } from "react-i18next";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversationUuid: string) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const { t } = useTranslation();
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<TUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch users when modal opens or search query changes
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, searchQuery]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await TypeTransfer["User"]?.otherAPIs?.getUsers({
        page: 1,
        limit: 20,
        searchFields: searchQuery ? "username,first_name,last_name" : "",
        searchValue: searchQuery,
      });

      if (response?.payload?.data) {
        setUsers(response.payload.data);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGroupImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error({
        title: "common:notification.error",
        description: "message:message.group-name-required",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error({
        title: "common:notification.error",
        description: "message:message.at-least-one-member-required",
      });
      return;
    }

    setIsCreating(true);
    try {
      const participantUuids = selectedUsers.map((user) => user.uuid);

      const formData = new FormData();
      formData.append("title", groupName);

      participantUuids.forEach((uuid) => {
        formData.append("participantUuids", uuid);
      });

      if (groupImage) {
        formData.append("groupPictureUrl", groupImage);
      }

      const response = await TypeTransfer["Message"]?.otherAPIs?.createGroup(formData);

      if (response?.payload?.conversationUuid) {
        // Send initial message to group to trigger updateConversation events
        try {
          const currentUsername = authProvider.getUsername();
          const initialMessage = `${currentUsername || "Someone"} message:group.created "${groupName}"`;

          await TypeTransfer["Message"]?.otherAPIs?.sendMessage(
            response.payload.conversationUuid,
            undefined,
            initialMessage,
            "notification",
          );

          console.log("Initial group message sent to trigger notifications");
        } catch (error) {
          console.error("Error sending initial group message:", error);
        }

        toast.success({
          title: "common:notification.success",
          description: "message:message.group-created",
        });

        onGroupCreated(response.payload.conversationUuid);
        handleClose();
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error({
        title: "common:notification.error",
        description: "message:message.group-created-failed",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setGroupName("");
    setSearchQuery("");
    setSelectedUsers([]);
    setUsers([]);
    setGroupImage(null);
    setImagePreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <LabelShadcn
            text="message:group.create-group"
            translate
            className="text-lg font-semibold text-gray-900 dark:text-white"
          />
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Group Image Upload */}
        <div className='flex w-full'>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 w-1/2">
            <LabelShadcn
              text="message:group.group-image"
              translate
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            />
            <div className="flex justify-center">
              <label htmlFor="group-image-input" className="relative w-20 h-20 cursor-pointer hover:opacity-80 transition-opacity">
                <Image
                  src={imagePreview || "/assets/images/sample-group.png"}
                  alt="Group preview"
                  fill
                  className="rounded-full object-cover shadow-md border border-background-primary-purple"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="group-image-input"
                />
              </label>
            </div>
          </div>

          {/* Group Name Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <LabelShadcn
              text="message:group.group-name"
              translate
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            />
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t("message:group.enter-group-name")}
              className="text-sm w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Search Users */}
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
              <Users className="h-4 w-4 text-gray-500" />
              <LabelShadcn
                text={`${t("message:group.selected")} (${selectedUsers.length})`}
                translate
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              />
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
              {users.map((user) => {
                const isSelected = selectedUsers.some((u) => u.uuid === user.uuid);
                return (
                  <div
                    key={user.uuid}
                    onClick={() => toggleUserSelection(user)}
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
                        {user.firstName || ""} {user.lastName || ""}
                      </p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-primary-purple" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LabelShadcn text="common:button.cancel" translate className="cursor-pointer text-sm" />
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating}
            className="flex-1 px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-purple-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LabelShadcn
              text={isCreating ? "common:button.creating" : "message:group.create-group"}
              translate
              className="cursor-pointer text-sm text-white"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
