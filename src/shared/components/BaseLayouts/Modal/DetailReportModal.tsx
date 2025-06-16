import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import LabelShadcn from "../../ui/LabelShadcn";
import { useTranslation } from "react-i18next";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TReport } from "@/shared/types/common-type/report-type";
import { toast } from "../../ui/toast";
import Post from "../Post/Post";
import { TComment } from "@/shared/types/common-type/comment-type";
import { TPost } from "@/shared/types/common-type/post-type";
import { IoCheckboxSharp } from "react-icons/io5";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
interface DetailReportModalProps {
  type: string;
  reportUuid: string | undefined;
  onClose: () => void;
}

const DetailReportModal: React.FC<DetailReportModalProps> = ({ onClose, type, reportUuid }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<TReport | null>(null);
  const [post, setPost] = useState<TPost | null>(null);
  const [comment, setComment] = useState<TComment | null>(null);

  useEffect(() => {
    if (reportUuid) {
      const getReport = async () => {
        setIsLoading(true);
        const response = await TypeTransfer["Report"]?.otherAPIs?.getReportByUuid(type, reportUuid);
        if (response?.payload) {
          setReport(response.payload.report);
          setComment(response.payload.comment);
          setPost(response.payload.post);
          handleFillReportContents(response.payload.report.details);
        }
        setIsLoading(false);
      };

      getReport();
    }
  }, []);
  const reportContents = ["Toxic", "Severe Toxic", "Obscene", "Threat", "Insult", "Identity Hate"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedStates, setSelectedStates] = useState<any[]>(Array(reportContents.length).fill(0));
  const [textareaContent, setTextareaContent] = useState("");

  const handleFillReportContents = (details: string) => {
    if (details) {
      const reportContentsArray = details.split(",");
      const reportFlags = reportContentsArray.slice(0, 6).map((value) => parseInt(value));
      setSelectedStates(reportFlags);

      if (reportContentsArray.length > 6) {
        const textContent = reportContentsArray.slice(6).join(",");
        setTextareaContent(textContent);
      }
    }
  };

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleDeleteContent = async () => {
    const response = await TypeTransfer["Report"]?.otherAPIs?.updateReport(reportUuid, "banned", type);
    if (response) {
      toast.success({
        title: "common:notification.success",
        description: "common:message.delete-content-success",
      });
    }
    onClose();
  };

  const handleCloseReport = async () => {
    const response = await TypeTransfer["Report"]?.otherAPIs?.updateReport(reportUuid, "closed", type);
    if (response) {
      toast.success({
        title: "common:notification.success",
        description: "common:message.close-report-success",
      });
    }
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 shadow-md  z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white w-[50%] rounded-lg p-5 shadow-md border-2">
        <LabelShadcn
          text="report-management:title.detail-report-title"
          className="font-bold text-center mb-5 text-2xl text-primary-purple"
          translate
        />

        <div className="w-full flex border-b-2 border-background-primary-purple pb-5">
          <div className="flex-1">
            <Post post={post} type="post" isLoading={isLoading} isAdminReview={true} />
          </div>

          {type === "comment" && (
            <div className="flex-1">
              <Post comment={comment} type="comment" isLoading={isLoading} isAdminReview={true} />
            </div>
          )}
        </div>

        <div className="w-full flex mt-5">
          <div className="grid grid-cols-2 gap-5 gap-x-16 mb-5 flex-1">
            {reportContents.map((content, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex gap-2 items-center">
                  {selectedStates[index] === 1 ? (
                    <IoCheckboxSharp className="text-primary-purple" />
                  ) : (
                    <MdCheckBoxOutlineBlank className="text-primary-purple" />
                  )}
                  <LabelShadcn
                    text={content}
                    className="font-semibold cursor-not-allowed"
                    inheritedClass
                    translate
                    htmlFor={`contentCheck${index}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 mb-4">
            <textarea
              className="w-full h-[100px] outline-none p-2 rounded-md border-2 border-primary-purple text-black text-sm bg-gray-50"
              name=""
              id=""
              placeholder={t("common:report.placeholder")}
              value={textareaContent}
              readOnly
            ></textarea>
          </div>
        </div>

        {report?.status === "pending" && (
          <div className="flex justify-center gap-x-8">
            <button
              onClick={handleCloseReport}
              className="px-8 py-2 font-semibold border-2 border-primary-purple text-primary-purple rounded-xl"
            >
              <LabelShadcn
                text="report-management:button.close-report"
                className="font-semibold cursor-pointer"
                inheritedClass
                translate
              />
            </button>
            <button
              onClick={handleDeleteContent}
              className="px-8 py-2 bg-primary-purple text-white rounded-xl font-semibold"
            >
              <LabelShadcn
                text="report-management:button.delete-content"
                className="font-semibold cursor-pointer"
                inheritedClass
                translate
              />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default DetailReportModal;
