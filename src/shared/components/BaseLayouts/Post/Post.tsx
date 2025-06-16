import { useState, useRef, useEffect } from "react";
import Image from "next/image";
// import postData from "@/shared/sample-data/post.json";
import { TPost } from "@/shared/types/common-type/post-type";
import TimeAgo from "@/shared/components/ui/TimeAgo";
import { FaRegComment, FaRegHeart, FaRegBookmark, FaHeart } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import { TbMessageReport } from "react-icons/tb";
import ImageModal from "../Modal/ImageModal";
import ReportContent from "../Modal/ReportComment";
import { ensureHttps } from "@/shared/helpers/ensure-https";
import { useRouter } from "next/navigation";
import { PostSkeleton } from "./PostSkeleton";
import { TComment } from "@/shared/types/common-type/comment-type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import LabelShadcn from "@/shared/components/ui/LabelShadcn";
import NewPostModal from "../Modal/NewPostModal";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TReactionCreate } from "@/shared/types/common-type/reaction-type";

interface PostProps {
  type: "post" | "comment" | "comment-child";
  post?: TPost | null;
  comment?: TComment | null;
  isLoading?: boolean;
  isAdminReview?: boolean;
  onAddComment?: (comment: TComment) => void;
}

const Post = ({ post, comment, isLoading = false, type = "post", isAdminReview = false, onAddComment }: PostProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [startDragTime, setStartDragTime] = useState(0);
  const [moveDistance, setMoveDistance] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isReacted, setIsReacted] = useState<boolean>(
    type === "post" ? post?.isReacted || false : comment?.isReacted || false,
  );
  const [reactionCount, setReactionCount] = useState<number>(
    type === "post" ? post?.reactionsCount || 0 : comment?.reactionsCount || 0,
  );
  const [isHovered, setIsHovered] = useState(false);

  // Determine if we should show card based on type
  const showCard = type === "post";

  // Update local state when props change
  useEffect(() => {
    if (type === "post" && post) {
      setIsReacted(post.isReacted || false);
      setReactionCount(post.reactionsCount || 0);
    } else if (type === "comment" && comment) {
      setIsReacted(comment.isReacted || false);
      setReactionCount(comment.reactionsCount || 0);
    }
  }, [type, post?.isReacted, post?.reactionsCount, comment?.isReacted, comment?.reactionsCount]);

  if (isLoading || ((!post || !post.user) && (!comment || !comment.user))) {
    return <PostSkeleton />;
  }

  const handleReaction = () => {
    const reaction: TReactionCreate = {
      contentType: type === "post" ? "post" : "comment",
      contentUuid: type === "post" ? post?.uuid || "" : comment?.uuid || "",
    };
    if (isReacted) {
      TypeTransfer["Reaction"].otherAPIs?.unReact(reaction);
      setIsReacted(!isReacted);
      setReactionCount(reactionCount - 1);
    } else {
      TypeTransfer["Reaction"].otherAPIs?.react(reaction);
      setIsReacted(!isReacted);
      setReactionCount(reactionCount + 1);
    }
  };

  // Handlers for drag-to-scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setStartDragTime(Date.now()); // Store the time when drag started
    setMoveDistance(0); // Reset move distance on mouse down

    // Change cursor to grabbing
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      // Reset cursor
      scrollContainerRef.current.style.cursor = "grab";
    }

    // Only consider it a click if moved very little distance (less than 20px) and short duration
    const dragDuration = Date.now() - startDragTime;

    if (dragDuration < 150 && moveDistance < 20) {
      // This is a click rather than a drag
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        // Find the image URL
        const imgElement = target as HTMLImageElement;
        const imageUrl = imgElement.src;
        handleImageClick(imageUrl);
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "grab";
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault(); // Prevent selecting text while dragging
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier

    // Track total distance moved for better drag vs click detection
    setMoveDistance((prev) => prev + Math.abs(x - startX));

    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setStartDragTime(Date.now()); // Store the time when touch started
    setMoveDistance(0); // Reset move distance
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);

    // Better threshold for touch devices
    const dragDuration = Date.now() - startDragTime;

    if (dragDuration < 200 && moveDistance < 30) {
      // This is a tap rather than a drag
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        const imgElement = target as HTMLImageElement;
        const imageUrl = imgElement.src;
        handleImageClick(imageUrl);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;

    setMoveDistance((prev) => prev + Math.abs(x - startX));

    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handler for image click to open modal
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  const handleExplicitImageClick = (imageUrl: string) => {
    if (moveDistance < 10) {
      handleImageClick(imageUrl);
    }
  };

  const handleReportClose = () => {
    setShowReportModal(false);
  };

  const PostContent = (
    <div className="flex">
      <div className="flex flex-col items-center mr-4">
        <div className="relative group/avatar">
          <div
            className={`rounded-full overflow-hidden flex-shrink-0 ${
              type === "post" ? "w-12 h-12" : type === "comment" ? "w-10 h-10" : "w-8 h-8"
            }`}
          >
            <Image
              src={
                ensureHttps(type === "post" ? post?.user.profilePictureUrl : comment?.user.profilePictureUrl) ||
                "/assets/images/sample-avatar.png"
              }
              alt="avatar"
              width={type === "post" ? 48 : type === "comment" ? 40 : 32}
              height={type === "post" ? 48 : type === "comment" ? 40 : 32}
              className="object-cover"
            />
          </div>
        </div>

        <div className="w-0.5 bg-gradient-to-b from-purple-300 via-purple-200 to-transparent h-full mt-3 rounded-full opacity-60"></div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <p
              className={`cursor-pointer font-bold text-gray-800 hover:text-purple-600 transition-colors duration-200 ${
                type === "post" ? "text-lg" : "text-base"
              }`}
              onClick={() => {
                if (type === "post") {
                  router.push(`/profile/${post?.user.uuid}`);
                } else {
                  router.push(`/profile/${comment?.user.uuid}`);
                }
              }}
            >
              {type === "post" ? post?.user.username : comment?.user.username}
            </p>
            <TimeAgo
              timestamp={type === "post" ? post?.createdAt : comment?.createdAt || new Date()}
              className={`text-gray-500 transition-colors duration-200 ${
                showCard ? "bg-gray-100 px-2 py-1 rounded-full hover:bg-purple-100 text-sm" : "text-xs"
              }`}
            />
          </div>
          {!isAdminReview && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`text-gray-400 hover:text-gray-600 transition-all duration-200 ${
                    showCard ? "hover:bg-gray-100 p-2 rounded-full" : "p-1"
                  }`}
                >
                  <IoIosMore size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={showCard ? "w-48 bg-white/90 backdrop-blur-md border-0 shadow-2xl rounded-xl" : "w-40"}
              >
                <DropdownMenuItem
                  className={`flex items-center justify-between gap-2 cursor-pointer ${
                    showCard ? "rounded-lg hover:bg-red-50 transition-colors duration-200" : ""
                  }`}
                  onClick={() => setShowReportModal(true)}
                >
                  <LabelShadcn
                    text="common:button.report"
                    className={`font-semibold cursor-pointer ${showCard ? "text-gray-700" : ""}`}
                    inheritedClass
                    translate
                  />
                  <TbMessageReport className="h-4 w-4 text-red-500" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-line text-wrap break-words overflow-hidden max-w-full leading-relaxed text-base">
            {type === "post" ? post?.content : comment?.content}
          </p>
        </div>

        {/* Media - Enhanced with modern styling */}
        {type === "post" && post?.mediaUrl && post?.mediaUrl?.images && post?.mediaUrl?.images?.length > 0 && (
          <div className="mb-4">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-3 pb-3 hide-scrollbar scroll-smooth"
              style={{ cursor: "grab" }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >
              {post.mediaUrl.images.map((image, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 relative group/image overflow-hidden transition-all duration-500 rounded-xl`}
                  style={{
                    width: "auto",
                    height: showCard ? "320px" : "280px",
                  }}
                >
                  <Image
                    src={ensureHttps(image.url)}
                    alt={`post image ${index + 1}`}
                    width={300}
                    height={showCard ? 320 : 280}
                    className="w-full h-full object-cover cursor-pointer transition-all duration-500"
                    draggable={false}
                    onClick={() => handleExplicitImageClick(ensureHttps(image.url))}
                    priority={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "comment" &&
          comment?.mediaUrl &&
          comment?.mediaUrl?.images &&
          comment?.mediaUrl?.images?.length > 0 && (
            <div className="mb-4">
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-3 pb-3 hide-scrollbar scroll-smooth"
                style={{ cursor: "grab" }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
              >
                {comment.mediaUrl.images.map((image, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 relative overflow-hidden transition-all duration-500 ${
                      showCard ? "rounded-2xl shadow-lg hover:shadow-2xl" : "rounded-xl shadow-md hover:shadow-lg"
                    }`}
                    style={{
                      width: "auto",
                      height: showCard ? "240px" : "200px",
                    }}
                  >
                    <Image
                      src={ensureHttps(image.url)}
                      alt={`post image ${index + 1}`}
                      width={300}
                      height={showCard ? 240 : 200}
                      className="w-full h-full object-cover cursor-pointer transition-all duration-500"
                      draggable={false}
                      onClick={() => handleExplicitImageClick(ensureHttps(image.url))}
                      priority={true}
                    />
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" /> */}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Modern Actions Bar */}
        {!isAdminReview && (
          <div className={`flex items-center gap-6 mt-4 ${showCard ? "pt-3 border-t border-gray-100" : ""}`}>
            <button
              className="group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-red-50 transition-all duration-300"
              onClick={handleReaction}
            >
              <div className="relative">
                {isReacted ? (
                  <FaHeart className="w-5 h-5 text-red-500 transition-all duration-300 ease-out drop-shadow-sm" />
                ) : (
                  <FaRegHeart className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-all duration-300 ease-out" />
                )}
              </div>
              <span
                className={`font-medium transition-all duration-300 ${isReacted ? "text-red-500" : "text-gray-600 group-hover:text-red-500"}`}
              >
                {reactionCount}
              </span>
            </button>

            {type !== "comment-child" && (
              <button
                className={`group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-50 transition-all duration-300 ${
                  showCard ? "transform hover:scale-105" : ""
                }`}
                onClick={() => {
                  if (type === "post") {
                    router.push(`/post/${post?.uuid}`);
                  } else {
                    router.push(`/post/${comment?.post?.uuid}/${comment?.uuid}`);
                  }
                }}
              >
                <FaRegComment className="w-5 h-5 text-gray-600 group-hover:text-blue-500 transition-all duration-300 transform group-hover:scale-110" />
                <span className="font-medium text-gray-600 group-hover:text-blue-500 transition-colors duration-300">
                  {type === "post" ? post?.commentsCount : comment?.childrenCount}
                </span>
              </button>
            )}

            {type === "post" && (
              <button
                className={`group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-yellow-50 transition-all duration-300 ${
                  showCard ? "transform hover:scale-105" : ""
                }`}
              >
                <FaRegBookmark className="w-5 h-5 text-gray-600 group-hover:text-yellow-600 transition-all duration-300 transform group-hover:scale-110" />
              </button>
            )}

            {(type === "comment" || type === "comment-child") && (
              <button className="cursor-pointer text-primary-purple" onClick={() => setShowCommentForm(true)}>
                <LabelShadcn text="common:button.reply" translate inheritedClass className="cursor-pointer" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`w-full flex transition-all duration-500 ease-out ${
        type === "comment" ? "pl-6 md:pl-10" : type === "comment-child" ? "pl-12 md:pl-20" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showCard ? (
        <div className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-purple-200/50 p-6 relative overflow-hidden group">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-purple-50/15 via-transparent to-blue-50/15 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          />

          <div className="relative z-10">{PostContent}</div>
        </div>
      ) : (
        <div className="w-full">{PostContent}</div>
      )}

      {showImageModal && selectedImage && <ImageModal imageUrl={selectedImage} onClose={closeImageModal} />}

      {showReportModal && (
        <ReportContent onClose={handleReportClose} cmtUuid={type === "post" ? post?.uuid : comment?.uuid} type={type} />
      )}

      {showCommentForm && (
        <NewPostModal
          onClose={() => setShowCommentForm(false)}
          title="common:comment.add-comment"
          type="comment"
          postUuid={comment?.post?.uuid}
          parentUuid={type === "comment" ? comment?.uuid : comment?.parentUuid}
          setComments={onAddComment}
        />
      )}
    </div>
  );
};

export default Post;
