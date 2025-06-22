import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoClose, IoCameraOutline } from "react-icons/io5";
import Image from "next/image";
import { TUser } from "@/shared/types/common-type/user-type";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import LabelShadcn from "../../ui/LabelShadcn";
import { useTranslation } from "react-i18next";

type EditProfileProps = {
  user: TUser;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: FormData) => void;
};

const EditProfile = ({ user, isOpen, onClose, onSave }: EditProfileProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    profilePictureUrl: "",
    gender: undefined as string | undefined,
    dateOfBirth: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFormDataFromUser = (userData: TUser) => {
    let genderValue: string | undefined = undefined;
    if (userData.gender !== undefined && userData.gender !== null) {
      if (typeof userData.gender === "boolean") {
        genderValue = userData.gender ? "male" : "female";
      } else {
        genderValue = (userData.gender as string).toLowerCase();
      }
    }

    return {
      username: userData?.username || "",
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      bio: userData?.bio || "",
      profilePictureUrl: userData?.profilePictureUrl || "",
      gender: genderValue,
      dateOfBirth: userData?.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split("T")[0] : "",
    };
  };

  useEffect(() => {
    if (user) {
      setFormData(getFormDataFromUser(user));
    }
  }, [user]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    if (field === "gender") {
      setFormData((prev) => ({
        ...prev,
        [field]: value === "" ? undefined : value,
      }));
    } else if (field === "dateOfBirth") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        profilePictureUrl: url,
      }));
      console.log("File selected:", file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("username", formData.username);
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("bio", formData.bio);

      if (formData.gender !== undefined && formData.gender !== "") {
        formDataToSend.append("gender", formData.gender);
      }

      if (formData.dateOfBirth) {
        formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      }

      if (selectedFile) {
        formDataToSend.append("profilePictureUrl", selectedFile);
      }

      await onSave(formDataToSend);
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(getFormDataFromUser(user));
    }
    setSelectedFile(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="relative bg-white rounded-xl shadow-lg overflow-hidden w-[500px] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="w-10"></div>
          <h1 className="font-semibold text-xl text-center">
            <LabelShadcn text="common:user.edit-profile" translate />
          </h1>
          <button onClick={onClose} className="w-10 flex justify-end hover:bg-gray-100 rounded-full p-2">
            <IoClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={formData.profilePictureUrl || "/assets/images/sample-avatar.png"}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute bottom-0 right-0 bg-primary-purple rounded-full p-2 group-hover:bg-purple-700 cursor-pointer transition-colors"
                  onClick={handleUploadClick}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <IoCameraOutline className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                <LabelShadcn text="common:user.change-profile-picture" translate />
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LabelShadcn text="common:user.username" translate />
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Enter username"
                  className="w-full"
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LabelShadcn text="common:user.first-name" translate />
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  className="w-full"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LabelShadcn text="common:user.last-name" translate />
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  className="w-full"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LabelShadcn text="common:user.bio" translate />
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder={t("common:user.bio-placeholder")}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              {/* Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LabelShadcn text="common:user.gender" translate />
                  </label>
                  <select
                    value={formData.gender || ""}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">{t("common:user.select-gender")}</option>
                    <option value="male">{t("common:user.male")}</option>
                    <option value="female">{t("common:user.female")}</option>
                  </select>
                </div>

                {/* Birthday */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LabelShadcn text="common:user.date-of-birth" translate />
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3 bg-gray-50">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="px-6">
            <LabelShadcn text="common:button.cancel" translate />
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 bg-primary-purple hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <LabelShadcn text="common:button.saving" translate className="text-white" />
              </div>
            ) : (
              <LabelShadcn text="common:button.save" translate className="text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EditProfile;
