import { useState } from "react";
import IconRadioSelect from "./IconRadioSelect";
import { FaIdCard, FaPassport } from "react-icons/fa";

const SelectDocumentType = () => {
  const [contactType, setContactType] = useState("email");

  return (
    <>
      <div className="text-base text-muted-foreground">
        <p>Document Type</p>
      </div>

      <div className="mt-2">
        <IconRadioSelect
          value={contactType}
          onChange={setContactType}
          options={[
            {
              label: "National Identity Number (NIN)",
              value: "nin",
              icon: <FaIdCard className="w-5 h-5" />,
            },
            {
              label: "Driver’s License",
              value: "drivers-license",
              icon: <FaIdCard className="w-5 h-5" />,
            },
            {
              label: "International Passport",
              value: "passport",
              icon: <FaPassport className="w-5 h-5" />,
            },
          ]}
        />
      </div>
    </>
  );
};

export default SelectDocumentType;
