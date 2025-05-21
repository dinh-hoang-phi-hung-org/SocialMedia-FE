import { useEffect, useState, useRef } from "react";
import { IoCameraOutline, IoSettingsOutline } from "react-icons/io5";
// import profileData from "@/shared/sample-data/profile.json";
import { TUser } from "@/shared/types/common-type/user-type";
import Image from "next/image";
import { Button } from "../../ui/button";
import LabelShadcn from "../../ui/LabelShadcn";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import ListModal from "../Modal/ListModal";
type ProfileProps = {
  isMyProfile: boolean;
  user: TUser;
};

const Profile = (props: ProfileProps) => {
  const [user, setUser] = useState<TUser>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [listUsers, setListUsers] = useState<TUser[]>([]);

  useEffect(() => {
    setUser(props.user);
  }, [props.user]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file);
    }
  };

  const handleFollowersModalOpen = async () => {
    try {
      const response = await TypeTransfer["Follow"]?.otherAPIs?.getFollowers(user?.uuid, { page: 1, limit: 10 });
      setListUsers(response?.payload?.data || []);
      setIsFollowersModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollowingModalOpen = async () => {
    try {
      const response = await TypeTransfer["Follow"]?.otherAPIs?.getFollowing(user?.uuid, { page: 1, limit: 10 });
      setListUsers(response?.payload?.data || []);
      setIsFollowingModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await TypeTransfer["Follow"]?.otherAPIs?.followUser(user?.uuid);
      if (response?.success && user) {
        setUser({ ...user, isFollowed: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await TypeTransfer["Follow"]?.otherAPIs?.unfollowUser(user?.uuid);
      if (response?.success && user) {
        setUser({ ...user, isFollowed: false });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full grid grid-cols-5">
      <div className="object-center w-32 h-32 relative group">
        <Image
          alt="profile"
          src={user?.profilePictureUrl || "/assets/images/sample-avatar.jpeg"}
          className="rounded-full w-full h-full object-cover border border-slate-300"
          width={128}
          height={128}
        />
        {props.isMyProfile && (
          <div
            className="absolute bottom-0 right-0 bg-white rounded-full p-1 group-hover:bg-gray-200 cursor-pointer transition-colors"
            onClick={handleUploadClick}
          >
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
            <IoCameraOutline className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="col-span-4 flex flex-col gap-4">
        <div className="text-gray-800 flex flex-row gap-5 items-center">
          <div className="text-2xl">{user?.username}</div>

          {props.isMyProfile ? (
            <Button variant="outline" className="p-2 rounded-md bg-primary-purple text-white">
              <LabelShadcn text="common:button.edit-profile" className="font-semibold cursor-pointer" inheritedClass translate />
            </Button>
          ) : (
            <div className="flex flex-row gap-2">
              {user?.isFollowed ? (
                <Button variant="outline" className="p-2 rounded-md" onClick={handleUnfollow}>
                  <LabelShadcn text="common:button.unfollow" className="font-semibold cursor-pointer" inheritedClass translate />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="p-2 rounded-md bg-primary-purple text-white"
                  onClick={handleFollow}
                >
                  <LabelShadcn text="common:button.follow" className="font-semibold cursor-pointer" inheritedClass translate />
                </Button>
              )}
              <Button variant="outline" className="p-2 rounded-md">
                <LabelShadcn text="common:button.message" className="font-semibold cursor-pointer" inheritedClass translate />
              </Button>
            </div>
          )}

          <IoSettingsOutline className="h-6 w-6" />
        </div>

        <div className="text-gray-800 flex flex-row gap-10 items-center">
          <div className="flex flex-row gap-1 items-center">
            <span className="font-semibold"> {user?.postsCount} </span>
            <LabelShadcn text="common:profile.posts" translate />
          </div>

          <div className="flex flex-row gap-1 items-center cursor-pointer" onClick={handleFollowingModalOpen}>
            <span className="font-semibold"> {user?.followersCount} </span>
            <LabelShadcn text="common:profile.followers" translate />
          </div>

          <div className="flex flex-row gap-1 items-center cursor-pointer" onClick={handleFollowersModalOpen}>
            <span className="font-semibold"> {user?.followingsCount} </span>
            <LabelShadcn text="common:profile.following" translate />
          </div>
        </div>

        {user?.bio && (
          <div className="text-gray-800 flex flex-col">
            <div>{user?.bio}</div>
          </div>
        )}

        {isFollowersModalOpen && (
          <ListModal
            listUsers={listUsers}
            isOpen={isFollowersModalOpen}
            onClose={() => setIsFollowersModalOpen(false)}
            title="Following"
          />
        )}
        {isFollowingModalOpen && (
          <ListModal
            listUsers={listUsers}
            isOpen={isFollowingModalOpen}
            onClose={() => setIsFollowingModalOpen(false)}
            title="Followers"
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
