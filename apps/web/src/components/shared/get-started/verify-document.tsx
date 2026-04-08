//import type { IOnboarding } from "@/utils/interfaces.util";
import { IconText } from "./IconText";
import { CircleDotIcon } from "lucide-react";

const VerifyDocumentForm = () => {
//   const {} = data;

  return (
    <>
      <div className="w-full">
        <div className="">
          <img
            src="/images/assets/verify-doc.png"
            alt="Authentication background"
            height={200}
            width={200}
          />
        </div>

        <IconText
          icon={CircleDotIcon}
          text="Upload a complete image of your ID document."
          className="text-sm text-muted-foreground mt-10"
        />

        <IconText
          icon={CircleDotIcon}
          text="Ensure all details are readable in the image you upload."
          className="text-sm text-muted-foreground mt-2"
        />

        <IconText
          icon={CircleDotIcon}
          text="Ensure all details are readable in the image you upload."
          className="text-sm text-muted-foreground mt-2"
        />

        <IconText
          icon={CircleDotIcon}
          text="Place documents against a solid-colored background."
          className="text-sm text-muted-foreground mt-2"
        />

      </div>
    </>
  );
};

export default VerifyDocumentForm;
