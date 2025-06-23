"use client";

import NotFound from "@/shared/components/BaseLayouts/NotFound/NotFound";
import Post from "@/shared/components/BaseLayouts/Post/Post";
import { Card } from "@/shared/components/ui/card";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TComment } from "@/shared/types/common-type/comment-type";
import { TPost } from "@/shared/types/common-type/post-type";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function CommentDetailPage() {
  const params = useParams();
  const { t } = useTranslation();
  const [comment, setComment] = useState<TComment>({} as TComment);
  const [post, setPost] = useState<TPost>({} as TPost);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const [commentsChildren, setCommentsChildren] = useState<TComment[]>([]);
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
        const post = await TypeTransfer["Post"]?.otherAPIs?.getPostByUuid(params.uuid as string);
        if (post?.payload) {
          setPost(post.payload);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      const comment = await TypeTransfer["Comment"]?.otherAPIs?.getCommentByUuid(params.commentUuid as string);
      if (comment?.payload) {
        setComment(comment.payload);
      }
    };

    fetchPost();
    fetchComments();
    // handleLoadCommentChildren();
  }, [params]);

  useEffect(() => {
    if (params.uuid && params.commentUuid) {
      handleLoadCommentChildren();
    }
  }, [params.uuid, params.commentUuid]);

  useEffect(() => {
    if (commentsChildren.length > 0) {
      if (isExpanded) {
        setVisibleComments(commentsChildren);
      } else {
        setVisibleComments(commentsChildren.slice(0, COMMENTS_PER_VIEW));
      }
    }
  }, [commentsChildren, isExpanded]);

  useEffect(() => {
    if (isExpanded && commentsChildren.length < totalComments && currentPage < lastPage) {
      handleLoadMoreComments();
    }
  }, [isExpanded]);

  const handleLoadCommentChildren = async () => {
    try {
      setLoading(true);
      const comment = await TypeTransfer["Comment"]?.otherAPIs?.getCommentsByUuidParent(
        params.uuid as string,
        params.commentUuid as string,
        {
          page: 1,
          limit: COMMENTS_PER_VIEW,
        },
      );
      if (comment?.payload) {
        setCommentsChildren(comment.payload.data);
        setTotalComments(comment.payload.meta.total);
        setCurrentPage(parseInt(comment.payload.meta.page));
        setLastPage(comment.payload.meta.lastPage);
      }
    } catch (error) {
      console.error("Error loading comment children:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMoreComments = async () => {
    if (currentPage < lastPage) {
      try {
        setLoading(true);
        const nextPage = currentPage + 1;
        const comment = await TypeTransfer["Comment"]?.otherAPIs?.getCommentsByUuidParent(
          params.uuid as string,
          params.commentUuid as string,
          {
            page: nextPage,
            limit: COMMENTS_PER_VIEW,
          },
        );
        if (comment?.payload) {
          const newComments = [...commentsChildren, ...comment.payload.data];
          setCommentsChildren(newComments);
          setCurrentPage(nextPage);
        }
      } catch (error) {
        console.error("Error loading more comments:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddComment = (comment: TComment) => {
    setCommentsChildren([comment, ...commentsChildren]);
  };

  const toggleComments = () => {
    setIsExpanded(!isExpanded);
  };

  if (isError) {
    return <NotFound />;
  }

  return (
    <Card className="2xl:mx-96 xl:mx-60 md:mx-16 lg:mx-24 xl:min-h-[calc(100vh-2.5rem)] md:mb-14 xl:mb-0">
      <div className="flex items-center justify-center mx-10 relative">
        <div
          className="flex items-center justify-center gap-2 cursor-pointer absolute left-0 w-8 h-8 rounded-full bg-background-primary-purple"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-5 h-5 text-primary-purple" />
        </div>
        <LabelShadcn text="common:post.post" translate className="font-bold text-[1.4rem] mx-auto mt-5 text-center" />
      </div>
      <div className="w-full border-b-2 border-background-primary-purple py-7 px-10">
        <Post post={post} isLoading={loading} type="post" />
      </div>
      <div className="w-full py-4 px-10 border-b-2 border-background-primary-purple flex justify-between items-center">
        <LabelShadcn text="common:comment.comments" translate className="font-bold text-[1.1rem]" />
      </div>
      <div className="w-full py-5 px-10 border-b-2 border-background-primary-purple">
        <Post comment={comment} isLoading={loading} type="comment" onAddComment={handleAddComment} />
      </div>

      {commentsChildren.length > 0 && (
        <div className="pb-4">
          <div className="w-full px-10 pt-4 flex justify-between items-center">
            <LabelShadcn text="common:comment.reply" translate className="font-semibold text-sm text-gray-600" />
          </div>

          {visibleComments.map((comment) => (
            <div key={comment.uuid} className="w-full py-5 px-10 border-b border-gray-200">
              <Post comment={comment} isLoading={loading} type="comment-child" onAddComment={handleAddComment} />
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
                    className="text-sm font-medium text-primary-purple cursor-pointer"
                  />
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-primary-purple" />
                  <LabelShadcn
                    text="common:button.show-more"
                    translate
                    className="text-sm font-medium text-primary-purple cursor-pointer"
                  />
                  <LabelShadcn
                    text={t(`common:text.more-number`, {
                      count: totalComments - COMMENTS_PER_VIEW,
                    })}
                    translate
                    className="text-sm font-medium text-primary-purple cursor-pointer"
                  />
                </>
              )}
            </div>
          )}

          {isExpanded && commentsChildren.length < totalComments && currentPage < lastPage && (
            <div
              className="flex items-center justify-center gap-2 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleLoadMoreComments}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-primary-purple rounded-full animate-spin"></div>
              ) : (
                <LabelShadcn
                  text="common:button.load-more"
                  translate
                  className="text-sm font-medium text-primary-purple"
                />
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
