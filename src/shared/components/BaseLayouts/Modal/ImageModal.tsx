import { IoClose } from "react-icons/io5";
import { createPortal } from "react-dom";

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal = ({ imageUrl, onClose }: ImageModalProps) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh]">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <IoClose size={24} />
        </button>

        {/* Image */}
        <div className="relative w-full h-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <img src={imageUrl} alt="Enlarged image" className="max-w-full max-h-[90vh] object-contain" />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ImageModal;
