"use client";

import MainLayout from "@/shared/components/MainLayout/MainLayout";
import { Card } from "@/shared/components/ui/card";
import Image from "next/image";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { Button } from "@/shared/components/ui/button";
import Post from "@/shared/components/BaseLayouts/Post/Post";
import { useState } from "react";
import NewPostModal from "@/shared/components/BaseLayouts/Modal/NewPostModal";

export default function Home() {
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  return (
    <MainLayout>
      <Card className="mx-60">
        <div
          className="flex justify-between items-center p-8 border-b border-border-primary-purple cursor-pointer"
          onClick={() => setShowNewPostModal(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={"/assets/images/sample-avatar.jpeg"}
                alt="avatar"
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
            <div>
              <LabelShadcn text="common:post.news" className="text-base text-gray-500" translate />
            </div>
          </div>
          <div>
            <Button variant="outline" className="bg-background-primary-purple">
              <LabelShadcn
                text="common:button.post"
                className="text-base text-primary-purple font-bold cursor-pointer"
                translate
              />
            </Button>
          </div>
        </div>
        <div className="p-8">
          <Post />
        </div>
      </Card>
      {showNewPostModal && <NewPostModal onClose={() => setShowNewPostModal(false)} />}
    </MainLayout>
  );
}
