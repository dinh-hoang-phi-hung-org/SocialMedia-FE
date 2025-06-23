"use client";

import { IoClose } from "react-icons/io5";
import LabelShadcn from "../../ui/LabelShadcn";
import { useSidebarState } from "../../MainLayout/MainLayout";
import Image from "next/image";
import { getRelativeTime } from "@/shared/helpers/time-formatter";
import { useRouter } from "next/navigation";
import { TNotification } from "@/shared/types/common-type/notification-type";
import { TypeTransfer } from "@/shared/constants/type-transfer";

const Notification = () => {
  const { setIsNotificationActive, notifications, markAsRead } = useSidebarState();
  const router = useRouter();
  const handleCloseNotification = () => {
    setIsNotificationActive(false);
  };

  const handleClickNotification = async (notification: TNotification) => {
    // Mark as read locally and on server
    markAsRead(notification.uuid);
    await TypeTransfer["Notification"]?.otherAPIs?.markAsRead(notification.uuid);

    if (notification.type === "reaction" || notification.type === "comment") {
      router.push(`/post/${notification.relatedUuid}`);
    } else if (notification.type === "follow") {
      router.push(`/profile/${notification.userRelated?.uuid}`);
    }
  };

  return (
    <div className="h-full overflow-auto no-scrollbar bg-white">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 pb-2">
          <h1 className="text-2xl font-bold">
            <LabelShadcn text="notification:title" translate className="font-bold text-primary-purple text-[1.2rem]" />
          </h1>
          <button onClick={handleCloseNotification} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IoClose className="w-5 h-5 text-primary-purple" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>
              </div>
              <LabelShadcn text="common:text.no-notification" translate className="text-gray-500 text-sm" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.uuid}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer relative"
                  onClick={() => handleClickNotification(notification)}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative">
                    <Image
                      src={notification.userRelated?.profilePictureUrl || "/assets/images/sample-avatar.png"}
                      alt="avatar"
                      width={44}
                      height={44}
                      className="rounded-full object-cover"
                    />
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 leading-5">
                          <span className="font-semibold">{notification.userRelated?.username || "Unknown User"}</span>{" "}
                          <LabelShadcn
                            text={notification.content}
                            translate
                            className="text-sm font-normal text-gray-700 inline"
                          />
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{getRelativeTime(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post thumbnail for post-related notifications */}
                  {(notification.type === "like" || notification.type === "comment") && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                        <div className="w-6 h-6 bg-gray-400 rounded"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
