"use client";
import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { TPost } from "@/shared/types/common-type/post-type";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { useParams, useRouter } from "next/navigation";
import Post from "@/shared/components/BaseLayouts/Post/Post";
import { TComment } from "@/shared/types/common-type/comment-type";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { FaPlus } from "react-icons/fa6";
import NewPostModal from "@/shared/components/BaseLayouts/Modal/NewPostModal";
import NotFound from "@/shared/components/BaseLayouts/NotFound/NotFound";

export default function PostPage() {
  const { uuid } = useParams();
  const [post, setPost] = useState<TPost>({} as TPost);
  const [comments, setComments] = useState<TComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const post = await TypeTransfer["Post"]?.otherAPIs?.getPostByUuid(uuid as string);
        if (post?.payload) {
          setPost(post.payload);
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      const comments = await TypeTransfer["Comment"]?.otherAPIs?.getComments(uuid as string, {
        page: 1,
        limit: 10,
      });
      if (comments?.payload) {
        setComments(comments.payload.data);
      }
    };

    fetchPost();
    fetchComments();
  }, [uuid]);

  const handleAddComment = (comment: TComment) => {
    setComments([comment, ...comments]);
  };

  if (isError) {
    return <NotFound />;
  }

  return (
    <Card className="2xl:mx-96 xl:mx-60 min-h-[calc(100vh-2.5rem)]">
      <div className="w-full border-b-2 border-background-primary-purple py-7 px-10">
        <Post post={post} isLoading={loading} type="post" />
      </div>
      <div className="w-full py-4 px-10 border-b-2 border-background-primary-purple flex justify-between items-center">
        <LabelShadcn text="common:comment.comments" translate className="font-bold text-[1.1rem]" />
        <div
          className="flex items-center cursor-pointer p-2 rounded-full bg-background-primary-purple"
          onClick={() => setShowCommentForm(!showCommentForm)}
        >
          <FaPlus className="w-5 h-5 text-primary-purple" />
        </div>
      </div>
      {comments &&
        comments.map((comment) => (
          <div className="w-full py-5 px-10 border-b-2 border-background-primary-purple " key={comment.uuid}>
            <Post comment={comment} isLoading={loading} type="comment" />
          </div>
        ))}
      {showCommentForm && (
        <NewPostModal
          onClose={() => setShowCommentForm(false)}
          title="common:comment.add-comment"
          type="comment"
          postUuid={uuid as string}
          setComments={handleAddComment}
        />
      )}
    </Card>
  );
}
