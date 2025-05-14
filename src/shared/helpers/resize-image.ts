interface ResizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const DEFAULT_MAX_WIDTH = 200;
const DEFAULT_MAX_HEIGHT = 200;
const DEFAULT_QUALITY = 0.8;

/**
 * Resizes an image file while maintaining aspect ratio
 * @param file The image file to resize
 * @param options Resize options including max dimensions and quality
 * @returns Promise that resolves with the resized image as a File object
 */
export const resizeImage = async (file: File, options: ResizeImageOptions = {}): Promise<File> => {
  const { maxWidth = DEFAULT_MAX_WIDTH, maxHeight = DEFAULT_MAX_HEIGHT, quality = DEFAULT_QUALITY } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const imgUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(imgUrl);

      const { width, height } = img;

      console.log(`old : ${width}x${height}`);

      // If image is smaller than max dimensions, return original
      if (width <= maxWidth && height <= maxHeight) {
        resolve(file);
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      let newWidth = width;
      let newHeight = height;

      if (newWidth > newHeight) {
        newWidth = maxWidth;
        newHeight = (height * maxWidth) / width;
      } else {
        newHeight = maxHeight;
        newWidth = (width * maxHeight) / height;
      }

      console.log(`new : ${newWidth}x${newHeight}`);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw and resize image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not create blob from canvas"));
            return;
          }

          // Create a new File from the blob
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        file.type,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(imgUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = imgUrl;
  });
};
