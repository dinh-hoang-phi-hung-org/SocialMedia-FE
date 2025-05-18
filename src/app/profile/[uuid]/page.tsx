"use client";

import { Card } from "@/shared/components/ui/card";
import Profile from "@/shared/components/BaseLayouts/Profile/Profile";
import Post from "@/shared/components/BaseLayouts/Post/Post";
import { useEffect, useState } from "react";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TUser } from "@/shared/types/common-type/user-type";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import { TPost } from "@/shared/types/common-type/post-type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useParams } from "next/navigation";
export default function InstagramPage() {
    const [user, setUser] = useState<TUser>({} as TUser);
    const [posts, setPosts] = useState<TPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { uuid } = useParams();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const me = await TypeTransfer["User"]?.otherAPIs?.getUserByUuid(uuid as string);
                if (me?.payload) {
                    setUser(me.payload);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await TypeTransfer["Post"]?.otherAPIs?.getPosts(authProvider.getUserUuid(), {
                    page: 1,
                    limit: 10,
                });

                if (response?.payload) {
                    setPosts(response.payload.data);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
        fetchPosts();
    }, []);

    return (
        <Card className="2xl:mx-96 xl:mx-60 min-h-[calc(100vh-2.5rem)]">
            <div className="w-full pt-10 pb-5 px-10">
                <Profile isMyProfile={authProvider.getUserUuid() === uuid} user={user} />
            </div>
            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="flex w-full border-b border-gray-200 bg-transparent rounded-none h-auto p-0 shadow-none">
                    <TabsTrigger
                        value="posts"
                        className="flex-1 border-b-2 border-transparent py-3 text-base font-semibold text-gray-500 hover:text-gray-700 data-[state=active]:border-primary-purple data-[state=active]:text-primary-purple data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
                    >
                        Posts
                    </TabsTrigger>
                    <TabsTrigger
                        value="saved"
                        className="flex-1 border-b-2 border-transparent py-3 text-base font-semibold text-gray-500 hover:text-gray-700 data-[state=active]:border-primary-purple data-[state=active]:text-primary-purple data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
                    >
                        Saved
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="posts">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <p>Loading posts...</p>
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map((post, index) => (
                            <div key={index} className="w-full border-b-2 border-gray-200 py-7 px-10">
                                <Post post={post} />
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center py-10">
                            <p>No posts found</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </Card>
    );
}
