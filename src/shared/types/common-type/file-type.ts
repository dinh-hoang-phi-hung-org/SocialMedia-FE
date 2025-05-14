import { toast } from "@/shared/components/ui/toast";

export type TMediaFile = {
  file: File;
  preview: string;
  type: "image" | "video";
};

export type TMediaUrl = {
  url: string;
  type: "image" | "video";
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB - kích thước tối đa của mỗi file
export const MAX_TOTAL_FILES = 10;

export const isValidMediaType = (file: File): { valid: boolean; type: "image" | "video" | null } => {
  if (file.type.startsWith("image/")) {
    return { valid: true, type: "image" };
  }
  if (file.type.startsWith("video/")) {
    return { valid: true, type: "video" };
  }
  return { valid: false, type: null };
};

export const isValidFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

export const isValidFileCount = (currentCount: number, newCount: number): boolean => {
  return currentCount + newCount <= MAX_TOTAL_FILES;
};

export const getFilesFromMedia = (mediaFiles: TMediaFile[]): File[] => {
  return mediaFiles.map((media) => media.file);
};

export const createMediaError = (errorType: string): Error => {
  switch (errorType) {
    case "fileSize":
      return new Error(`common:error.file_size_limit`);
    case "fileCount":
      return new Error(`common:error.file_count_limit`);
    case "invalidType":
      return new Error("common:error.invalid_file_type");
    default:
      return new Error("common:error.invalid_file_type");
  }
};

export const validateNewMedia = (selectedMedia: TMediaFile[], files: FileList): File[] => {
  const validFiles: File[] = [];
  const errors: { type: string }[] = [];

  // Kiểm tra số lượng tệp
  if (!isValidFileCount(selectedMedia.length, files.length)) {
    const error = createMediaError("fileCount");
    toast.error({
      title: "common:notification.error",
      description: error.message,
    });
    return validFiles;
  }

  // Kiểm tra từng tệp về loại và kích thước
  Array.from(files).forEach((file) => {
    // Kiểm tra loại tệp
    const typeCheck = isValidMediaType(file);
    if (!typeCheck.valid) {
      errors.push({ type: "invalidType" });
      return;
    }

    // Kiểm tra kích thước tệp
    if (!isValidFileSize(file)) {
      errors.push({ type: "fileSize" });
      return;
    }

    validFiles.push(file);
  });

  if (errors.length > 0) {
    errors.forEach((error) => {
      if (error.type === "invalidType") {
        const mediaError = createMediaError("invalidType");
        toast.error({
          title: "common:notification.error",
          description: mediaError.message,
        });
      } else if (error.type === "fileSize") {
        const mediaError = createMediaError("fileSize");
        toast.error({
          title: "common:notification.error",
          description: mediaError.message,
        });
      }
    });
  }

  return validFiles;
};
