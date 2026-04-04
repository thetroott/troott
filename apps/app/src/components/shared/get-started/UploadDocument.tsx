import { useState } from "react";
import IconRadioSelect from "./IconRadioSelect";
import { Camera, UploadCloud } from "lucide-react";

function UploadDocument() {
  const [contactType, setContactType] = useState("email");

  return (
    <>
      <div className="text-base text-muted-foreground">
        <p>Upload Options</p>
      </div>

      <div className="mt-2">
        <IconRadioSelect
          value={contactType}
          onChange={setContactType}
          options={[
            {
              label: "Take picture with phone",
              value: "images",
              icon: <Camera className="w-5 h-5" />,
            },
            {
              label: "Upload Photos",
              value: "photos",
              icon: <UploadCloud className="w-5 h-5" />,
            },
          ]}
        />
      </div>
    </>
  );
}

export default UploadDocument;
