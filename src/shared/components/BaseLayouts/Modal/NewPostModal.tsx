import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { IoImageOutline } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { BsPlayFill } from "react-icons/bs";
import { useTranslation } from "next-i18next";
import EmojiPicker, { EmojiClickData, Theme, SuggestionMode } from "emoji-picker-react";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { toast } from "@/shared/components/ui/toast";
import { authProvider } from "@/shared/utils/middleware/auth-provider";
import {
  TMediaFile,
  isValidMediaType,
  getFilesFromMedia,
  validateNewMedia,
} from "@/shared/types/common-type/file-type";
import LabelShadcn from "../../ui/LabelShadcn";
import { TComment } from "@/shared/types/common-type/comment-type";
import { useRouter } from "next/navigation";

const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;

const isEmoji = (text: string): boolean => {
  return emojiRegex.test(text);
};

interface NewPostModalProps {
  type: "post" | "comment";
  title: string;
  onClose: () => void;
  postUuid?: string;
  parentUuid?: string;
  setComments?: (comment: TComment) => void;
}

const MAX_CHARS = 500;
const MAX_LINES = 5;

const NewPostModal = (props: NewPostModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [postContent, setPostContent] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMedia, setSelectedMedia] = useState<TMediaFile[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const charsRemaining = MAX_CHARS - postContent.length;

  // Fetch username from token when component mounts
  useEffect(() => {
    // Get username from token
    const usernameFromToken = authProvider.getUsername();
    setUsername(usernameFromToken);
  }, []);

  // Handle clicks outside of emoji picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".emoji-button")
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    if (newText.length <= MAX_CHARS) {
      setPostContent(newText);
    }

    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const lineCount = postContent.split("\n").length;

    if (e.key === "Enter" && lineCount >= MAX_LINES) {
      e.preventDefault();
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = validateNewMedia(selectedMedia, files);

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const typeCheck = isValidMediaType(file);
          setSelectedMedia((prev) => [
            ...prev,
            {
              file: file,
              preview: e.target!.result as string,
              type: typeCheck.type!,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleSubmitPost = async () => {
    if (!postContent.trim()) return;

    setIsPosting(true);

    try {
      const mediaFiles = getFilesFromMedia(selectedMedia);

      const checkToxic = await TypeTransfer["AI"].otherAPIs?.checkLevelToxicOfComment(postContent);

      if (checkToxic?.payload?.is_toxic) {
        toast.error({
          title: "common:notification.error",
          description: "common:message.post-toxic",
        });
        return;
      }

      const response = await TypeTransfer["Post"].otherAPIs?.createPost(postContent, mediaFiles);

      if (response?.payload?.postUuid) {
        toast.success({
          title: "common:notification.success",
          description: "common:message.post-created",
        });
        props.onClose();
        router.push(`/post/${response.payload.postUuid}`);
        return;
      }
      // eslint-disable-next-line
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error({
        title: "common:notification.error",
        description: error.message || "common:error.something_went_wrong",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!postContent.trim()) return;

    setIsPosting(true);

    try {
      const mediaFiles = getFilesFromMedia(selectedMedia);

      const checkToxic = await TypeTransfer["AI"].otherAPIs?.checkLevelToxicOfComment(postContent);

      if (checkToxic?.payload?.is_toxic) {
        toast.error({
          title: "common:notification.error",
          description: "common:message.comment-toxic",
        });
        return;
      }

      const response = await TypeTransfer["Comment"].otherAPIs?.postComment(
        postContent,
        props.postUuid,
        mediaFiles,
        props.parentUuid,
      );

      if (response?.payload?.comment) {
        toast.success({
          title: "common:notification.success",
          description: "common:message.comment-created",
        });
        props.onClose();
        if (props.setComments) {
          const newComment = response.payload.comment;
          console.log("newComment", newComment);
          props.setComments(newComment);
        }
      }
      // eslint-disable-next-line
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error({
        title: "common:notification.error",
        description: error.message || "common:error.something_went_wrong",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      const emoji = emojiData.emoji;

      if (postContent.length + emoji.length > MAX_CHARS) {
        return;
      }

      const cursorPosition = textAreaRef.current?.selectionStart || postContent.length;
      const textBeforeCursor = postContent.slice(0, cursorPosition);
      const textAfterCursor = postContent.slice(cursorPosition);

      let newContent = "";
      let newCursorPosition = cursorPosition + emoji.length;

      if (cursorPosition > 0 && isEmoji(postContent[cursorPosition - 1])) {
        newContent = textBeforeCursor.slice(0, -1) + emoji + textAfterCursor;
        newCursorPosition = cursorPosition - 1 + emoji.length;
      } else if (cursorPosition < postContent.length && isEmoji(postContent[cursorPosition])) {
        newContent = textBeforeCursor + emoji + textAfterCursor.slice(1);
      } else {
        newContent = textBeforeCursor + emoji + textAfterCursor;
      }

      setPostContent(newContent);

      requestAnimationFrame(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);

          // Update height
          textAreaRef.current.style.height = "auto";
          textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
      });
    },
    [postContent],
  );

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Tối ưu hóa sử dụng useMemo để memo hóa các component tĩnh
  const emojiPickerComponent = useMemo(
    () =>
      showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute z-10 bottom-12 left-0">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={350}
            theme={Theme.LIGHT}
            searchDisabled={false}
            lazyLoadEmojis={true}
            suggestedEmojisMode={SuggestionMode.RECENT}
            skinTonesDisabled
            previewConfig={{
              showPreview: false,
            }}
          />
        </div>
      ),
    [showEmojiPicker, handleEmojiClick],
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      onClick={props.onClose}
    >
      <div
        className="flex flex-col bg-white rounded-2xl max-w-[600px] w-full h-[60vh] shadow-xl overflow-hidden"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <button onClick={props.onClose}>
            <LabelShadcn text="common:button.cancel" translate className="font-medium text-black" />
          </button>
          {/* <h2 className="font-bold text-lg">{t("common:post.new-post")}</h2> */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <LabelShadcn text={props.title} translate className="font-bold text-lg" />
          </div>
          <button
            className={`font-medium ${postContent.trim() ? "text-primary-purple" : "text-gray-300"} ${isPosting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onClick={props.type === "post" ? handleSubmitPost : handleSubmitComment}
            disabled={isPosting || !postContent.trim()}
          >
            {props.type === "post" ? (
              isPosting ? (
                <LabelShadcn text="common:button.posting" translate className="font-medium text-inherit" />
              ) : (
                <LabelShadcn text="common:button.post" translate className="font-medium text-inherit" />
              )
            ) : isPosting ? (
              <LabelShadcn text="common:button.submitting" translate className="font-medium text-inherit" />
            ) : (
              <LabelShadcn text="common:button.submit-comment" translate className="font-medium text-inherit" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content area with fixed layout */}
          <div className="flex gap-3 flex-1 p-4 overflow-hidden">
            {/* User Avatar */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src="/assets/images/sample-avatar.png"
                  alt="user avatar"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="w-0.5 bg-gray-200 h-full flex-1 mt-2"></div>
            </div>

            {/* Post Content */}
            <div className="w-full flex-1 flex flex-col overflow-hidden">
              <div className="font-semibold">{username || "Loading..."}</div>

              {/* Scrollable content area */}
              <div className="mt-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="relative">
                  <textarea
                    ref={textAreaRef}
                    value={postContent}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t("common:post.news")}
                    className="w-full outline-none resize-none text-base overflow-y-auto"
                    rows={1}
                    maxLength={MAX_CHARS}
                  ></textarea>

                  {/* Character counter */}
                  <div className={`text-xs mt-1 text-right ${charsRemaining < 20 ? "text-red-500" : "text-gray-400"}`}>
                    {charsRemaining}/{MAX_CHARS}
                  </div>
                </div>

                {/* Media Preview */}
                {selectedMedia.length > 0 && (
                  <div className="mt-3 flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                    {selectedMedia.map((media, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 relative group"
                        style={{
                          width: "auto",
                          height: "280px",
                          // minWidth: selectedMedia.length === 1 ? "100%" : "280px",
                        }}
                      >
                        {media.type === "image" ? (
                          <Image
                            src={media.preview}
                            alt={`post media ${index + 1}`}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover rounded-xl cursor-pointer border border-slate-300"
                            draggable={false}
                          />
                        ) : (
                          <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-300">
                            <video src={media.preview} className="w-full h-full object-cover" controls />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                              <BsPlayFill size={48} className="text-white" />
                            </div>
                          </div>
                        )}
                        <button
                          className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70"
                          onClick={() => setSelectedMedia(selectedMedia.filter((_, i) => i !== index))}
                        >
                          <IoClose size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 p-3 bg-white">
            <div className="flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaUpload}
              />
              <button
                className="p-2 text-gray-500 hover:text-primary-purple hover:bg-gray-100 rounded-full transition-colors"
                onClick={openFileSelector}
              >
                <IoImageOutline size={20} />
              </button>
              <div className="relative">
                <button
                  className={`p-2 text-gray-500 hover:text-primary-purple hover:bg-gray-100 rounded-full transition-colors emoji-button ${postContent.length >= MAX_CHARS ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={toggleEmojiPicker}
                  disabled={postContent.length >= MAX_CHARS}
                >
                  <BsEmojiSmile size={20} />
                </button>
                {/* Emoji Picker */}
                {emojiPickerComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default NewPostModal;
