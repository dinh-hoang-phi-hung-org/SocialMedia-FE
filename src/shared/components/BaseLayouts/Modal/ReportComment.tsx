import { useState } from "react";
import { createPortal } from "react-dom";
import LabelShadcn from "../../ui/LabelShadcn";
import { useTranslation } from "react-i18next";
import { TypeTransfer } from "@/shared/constants/type-transfer";
import { TReportCreate } from "@/shared/types/common-type/report-type";
import { toast } from "../../ui/toast";
interface ReportContentProps {
  cmtUuid: string | undefined;
  onClose: () => void;
  type: string;
}

const ReportContent: React.FC<ReportContentProps> = ({ onClose, cmtUuid, type }) => {
  const { t } = useTranslation();
  const reportContents = ["Toxic", "Severe Toxic", "Obscene", "Threat", "Insult", "Identity Hate"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedStates, setSelectedStates] = useState<any[]>(Array(reportContents.length).fill(0));
  const [textareaContent, setTextareaContent] = useState("");

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  const handleCheckboxChange = (index: number) => {
    setSelectedStates((prevStates) => prevStates.map((state, idx) => (idx === index ? 1 - state : state)));
  };

  const handleSubmit = async () => {
    const finalReportContents = [...selectedStates];
    if (textareaContent.trim()) {
      finalReportContents.push(textareaContent.trim());
    }
    console.log("Final Report Contents:", finalReportContents.join(","));

    const payload: TReportCreate = {
      details: finalReportContents.join(","),
      contentType: type === "post" ? "post" : "comment",
      contentUuid: cmtUuid || "",
    };
    try {
      const response = await TypeTransfer["Report"]?.otherAPIs?.createReport(payload);
      if (response) {
        toast.success({
          title: "common:notification.success",
          description: "common:message.report-success",
        });
      }
      onClose();
    } catch (error) {
      console.log(error);
    }
  };
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 shadow-md  z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white w-[30%] rounded-lg p-5 shadow-md border-2">
        <LabelShadcn
          text="report-management:title.report-content"
          className="font-bold text-center mb-5 text-2xl text-primary-purple"
          translate
        />
        <div className="grid grid-cols-2 gap-5 gap-x-16 mb-5">
          {reportContents.map((content, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="contentCheck"
                id={`contentCheck${index}`}
                checked={selectedStates[index] === 1}
                onChange={() => handleCheckboxChange(index)}
                className="accent-primary-purple md:w-4 md:h-4"
              />
              <LabelShadcn
                text={content}
                className="font-semibold cursor-pointer"
                inheritedClass
                translate
                htmlFor={`contentCheck${index}`}
              />
            </div>
          ))}
        </div>
        <div className="w-full mb-4">
          <textarea
            className="w-full h-[100px] outline-none p-2 rounded-md border-2 border-primary-purple text-black text-sm"
            name=""
            id=""
            placeholder={t("common:report.placeholder")}
            value={textareaContent}
            onChange={(e) => setTextareaContent(e.target.value)}
          ></textarea>
        </div>
        <div className="flex justify-center gap-x-8">
          <button
            onClick={() => {
              onClose();
            }}
            className="px-8 py-2 font-semibold border-2 border-primary-purple text-primary-purple rounded-xl"
          >
            <LabelShadcn
              text="common:button.cancel"
              className="font-semibold cursor-pointer"
              inheritedClass
              translate
            />
          </button>
          <button onClick={handleSubmit} className="px-8 py-2 bg-primary-purple text-white rounded-xl font-semibold">
            <LabelShadcn
              text="common:button.submit"
              className="font-semibold cursor-pointer"
              inheritedClass
              translate
            />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReportContent;
