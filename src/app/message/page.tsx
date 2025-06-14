"use client";

import { useState } from "react";
import PeopleList from "./_components/PeopleList";
import ChatSection from "./_components/ChatSection";
import { Card } from "@/shared/components/ui/card";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";

export default function InstagramPage() {
  const [selectedConversation, setSelectedConversation] = useState<{ conversationUuid?: string; userId?: string }>({});
  console.log(selectedConversation);
  return (
    <Card className="flex mx-20 h-[calc(100vh-2.5rem)]">
      {/* Sidebar with people list */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-800">
        <PeopleList
          onSelectUser={(conversationUuid, userId) => setSelectedConversation({ conversationUuid, userId })}
          selectedConversation={selectedConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1">
        {selectedConversation.userId || selectedConversation.conversationUuid ? (
          <ChatSection
            receiverUuid={selectedConversation.userId}
            conversationUuid={selectedConversation.conversationUuid}
          />
        ) : (
          <div className="flex h-full items-center justify-center ">
            <LabelShadcn
              text="message:title.select-conversation"
              translate
              className="text-gray-500 dark:text-gray-400"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
