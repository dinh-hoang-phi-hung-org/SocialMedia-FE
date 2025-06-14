import { TUser } from "@/shared/types/common-type/user-type";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

type ListModalProps = {
  listUsers: TUser[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

const ListModal = ({ listUsers, isOpen, onClose, title }: ListModalProps) => {
  const router = useRouter();
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="relative bg-white rounded-xl shadow-lg overflow-hidden w-[400px] max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="w-10"></div>
          <h1 className="font-semibold text-center">{title}</h1>
          <button onClick={onClose} className="w-10 flex justify-end">
            <IoClose size={24} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[400px] p-4">
          {listUsers.map((user) => (
            <div
              key={user.uuid}
              className="flex items-center justify-between py-2 cursor-pointer"
              onClick={() => {
                router.push(`/profile/${user.uuid}`);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <Image
                    src={user.profilePictureUrl || "/assets/images/sample-avatar.png"}
                    alt={user.username || "avatar"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-gray-500">
                    {user.firstName} {user.lastName}
                  </div>
                </div>
              </div>
              <button className="px-4 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-semibold">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ListModal;
