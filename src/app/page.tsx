"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/shared/components/MainLayout/MainLayout";
import Image from "next/image";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { Button } from "@/shared/components/ui/button";
import Post from "@/shared/components/BaseLayouts/Post/Post";
import NewPostModal from "@/shared/components/BaseLayouts/Modal/NewPostModal";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TPost } from "@/shared/types/common-type/post-type";
import { PostSkeleton } from "@/shared/components/BaseLayouts/Post/PostSkeleton";
import { FiPlus, FiImage, FiSmile } from "react-icons/fi";

export default function Home() {
  const [homeFeed, setHomeFeed] = useState<TPost[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHomeFeed = async () => {
      setIsLoading(true);
      const response = await TypeTransfer["Post"]?.otherAPIs?.getHomeFeed({ page: 1, limit: 10 });
      if (response?.payload) {
        setHomeFeed(response.payload.data as TPost[]);
      }
      setIsLoading(false);
    };
    fetchHomeFeed();
  }, []);

  return (
    <MainLayout>
      <div className="mx-60 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/50 hover:border-purple-200/50 p-6 group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group/avatar">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={"/assets/images/sample-avatar.png"}
                    alt="avatar"
                    width={48}
                    height={48}
                    className="rounded-full object-cover transition-transform duration-300"
                  />
                </div>
              </div>

              <div
                className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-full px-6 py-3 cursor-pointer transition-all duration-300 hover:shadow-md border hover:border-purple-200"
                onClick={() => setShowNewPostModal(true)}
              >
                <LabelShadcn
                  text="common:post.news"
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  translate
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                  onClick={() => setShowNewPostModal(true)}
                >
                  <FiImage className="w-5 h-5" />
                  <LabelShadcn text="common:text.photo" className="text-sm font-medium" translate />
                </button>

                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-yellow-50 text-gray-600 hover:text-yellow-600 transition-all duration-300 transform hover:scale-105"
                  onClick={() => setShowNewPostModal(true)}
                >
                  <FiSmile className="w-5 h-5" />
                  <LabelShadcn text="common:text.feeling" className="text-sm font-medium" translate />
                </button>
              </div>

              <Button
                variant="default"
                className="!bg-gradient-to-r !from-purple-500 !to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-full px-6"
                onClick={() => setShowNewPostModal(true)}
              >
                <FiPlus className="w-4 h-4 text-white" />
                <LabelShadcn text="common:button.post" className="font-semibold text-white cursor-pointer" translate />
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6 animate-pulse"
                >
                  <PostSkeleton />
                </div>
              ))}
            </>
          ) : (
            homeFeed.map((post, index) => (
              <div
                key={post.uuid}
                className="transform transition-all duration-500 ease-out"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <Post post={post} type="post" />
              </div>
            ))
          )}
        </div>

        {!isLoading && homeFeed.length > 0 && (
          <div className="flex justify-center pt-8">
            <button className="px-8 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-2xl border border-gray-100/50 hover:border-purple-200/50 text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 transform hover:scale-105">
              Load More Posts
            </button>
          </div>
        )}

        {!isLoading && homeFeed.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
              <FiPlus className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share something with your community!</p>
            <Button
              variant="default"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-full px-8"
              onClick={() => setShowNewPostModal(true)}
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </div>
        )}
      </div>

      {showNewPostModal && (
        <NewPostModal onClose={() => setShowNewPostModal(false)} title="common:post.new-post" type="post" />
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </MainLayout>
  );
}
