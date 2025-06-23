"use client";
import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { TPost } from "@/shared/types/common-type/post-type";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { useParams } from "next/navigation";
import Post from "@/shared/components/BaseLayouts/Post/Post";
import { TComment } from "@/shared/types/common-type/comment-type";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { FaPlus } from "react-icons/fa6";
import NewPostModal from "@/shared/components/BaseLayouts/Modal/NewPostModal";
import NotFound from "@/shared/components/BaseLayouts/NotFound/NotFound";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function PostPage() {
  const { uuid } = useParams();
  const { t } = useTranslation();
  const [post, setPost] = useState<TPost>({} as TPost);
  const [comments, setComments] = useState<TComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isError, setIsError] = useState(false);
  const [visibleComments, setVisibleComments] = useState<TComment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const COMMENTS_PER_VIEW = 5;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const post = await TypeTransfer["Post"]?.otherAPIs?.getPostByUuid(uuid as string);
        if (post?.payload) {
          setPost(post.payload);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      const comments = await TypeTransfer["Comment"]?.otherAPIs?.getComments(uuid as string, {
        page: 1,
        limit: COMMENTS_PER_VIEW,
      });
      if (comments?.payload) {
        setComments(comments.payload.data);
        setTotalComments(comments.payload.meta.total);
        setCurrentPage(parseInt(comments.payload.meta.page));
        setLastPage(comments.payload.meta.lastPage);
      }
    };

    fetchPost();
    fetchComments();
  }, [uuid]);

  useEffect(() => {
    if (comments.length > 0) {
      if (isExpanded) {
        setVisibleComments(comments);
      } else {
        setVisibleComments(comments.slice(0, COMMENTS_PER_VIEW));
      }
    }
  }, [comments, isExpanded]);

  useEffect(() => {
    if (isExpanded && comments.length < totalComments && currentPage < lastPage) {
      handleLoadMoreComments();
    }
  }, [isExpanded]);

  const handleLoadMoreComments = async () => {
    if (currentPage < lastPage) {
      try {
        setLoading(true);
        const nextPage = currentPage + 1;
        const comment = await TypeTransfer["Comment"]?.otherAPIs?.getComments(uuid as string, {
          page: nextPage,
          limit: COMMENTS_PER_VIEW,
        });
        if (comment?.payload) {
          const newComments = [...comments, ...comment.payload.data];
          setComments(newComments);
          setCurrentPage(nextPage);
        }
      } catch (error) {
        console.error("Error loading more comments:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleComments = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddComment = (comment: TComment) => {
    setComments([comment, ...comments]);
  };

  if (isError) {
    return <NotFound />;
  }

  return (
    <Card className="2xl:mx-96 xl:mx-60 md:mx-16 lg:mx-24 xl:min-h-[calc(100vh-2.5rem)] md:mb-14 xl:mb-0">
      <LabelShadcn text="common:post.post" translate className="font-bold text-[1.4rem] mx-auto mt-5 text-center" />
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
        visibleComments.map((comment) => (
          <div className="w-full py-5 px-10 border-b-2 border-background-primary-purple " key={comment.uuid}>
            <Post comment={comment} isLoading={loading} type="comment" />
          </div>
        ))}

      {totalComments > COMMENTS_PER_VIEW && (
        <div
          className="flex items-center justify-center gap-1 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={toggleComments}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 text-primary-purple" />
              <LabelShadcn
                text="common:button.show-less"
                translate
                className="text-sm font-medium text-primary-purple"
              />
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-primary-purple" />
              <LabelShadcn
                text="common:button.show-more"
                translate
                className="text-sm font-medium text-primary-purple"
              />
              <LabelShadcn
                text={t(`common:text.more-number`, {
                  count: totalComments - COMMENTS_PER_VIEW,
                })}
                translate
                className="text-sm font-medium text-primary-purple"
              />
            </>
          )}
        </div>
      )}

      {isExpanded && comments.length < totalComments && currentPage < lastPage && (
        <div
          className="flex items-center justify-center gap-2 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleLoadMoreComments}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-primary-purple rounded-full animate-spin"></div>
          ) : (
            <LabelShadcn text="common:button.load-more" translate className="text-sm font-medium text-primary-purple" />
          )}
        </div>
      )}

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
