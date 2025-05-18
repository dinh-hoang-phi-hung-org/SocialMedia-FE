import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import postData from "@/shared/sample-data/post.json";
import { TPost } from "@/shared/types/common-type/post-type";
import TimeAgo from "@/shared/components/ui/TimeAgo";
import { FaRegComment, FaRegHeart, FaRegBookmark } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import ImageModal from "../Modal/ImageModal";
import { ensureHttps } from "@/shared/helpers/ensure-https";

const Post = ({ post }: { post: TPost }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [startDragTime, setStartDragTime] = useState(0);
  const [moveDistance, setMoveDistance] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  return (
    <div className="w-full flex">
      {/* Left Side - Avatar and Thread Line */}
      <div className="flex flex-col items-center mr-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 z-10">
          <Image src="/assets/images/sample-avatar.jpeg" alt="avatar" width={40} height={40} className="object-cover" />
        </div>

        {/* Thread Line */}
        <div className="w-0.5 bg-primary-purple h-full mt-2 "></div>
      </div>

      {/* Right Side - Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{post?.user.username}</p>
            <TimeAgo timestamp={post?.createdAt || ""} className="text-xs text-gray-500" />
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <IoIosMore size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-1 mb-3">
          <p className="text-gray-800 whitespace-pre-line text-wrap break-words overflow-hidden max-w-full">
            {post?.content}
          </p>
        </div>

        {/* Media - Horizontal Scrolling with Drag */}
        {post?.mediaUrl && post?.mediaUrl?.images && post?.mediaUrl?.images?.length > 0 && (
          <div className="mb-3">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar"
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
                  className="flex-shrink-0 relative group"
                  style={{
                    width: "auto",
                    height: "280px",
                  }}
                >
                  <Image
                    src={ensureHttps(image.url)}
                    alt={`post image ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover rounded-xl cursor-pointer border border-slate-300"
                    draggable={false}
                    onClick={() => handleExplicitImageClick(ensureHttps(image.url))}
                    priority={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          <button className="text-gray-600 hover:text-red-500">
            <FaRegHeart className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-blue-500">
            <FaRegComment className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <FaRegBookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Post Stats */}
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <span>{post?.likesCount || 0} likes</span>
          <span className="mx-2">•</span>
          <span>{post?.commentsCount || 0} replies</span>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && <ImageModal imageUrl={selectedImage} onClose={closeImageModal} />}
    </div>
  );
};

export default Post;
