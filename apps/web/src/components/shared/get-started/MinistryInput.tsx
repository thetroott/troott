import { useState } from "react";
import MinistryDescription from "./MinistryDescription";
import MinistryForm from "./MinistryForm";
import MinistryLocation from "./MinistryLocation";
import MinistryWebsite from "./MinistryWebsite";


const MinistryInput = () => {
  const [ministry, setMinistry] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  return (
    <>
      <div className="max-w-[410px]">
        <MinistryForm 
        ministry={ministry}
        onChange={setMinistry}
        className="mt-6"
        />

        <MinistryWebsite 
        website={website}
        onChange={setWebsite}
        className="mt-6"
        />

        <MinistryLocation
          location={location}
          onChange={setLocation}
          className="mt-6"

        />

        <MinistryDescription
          description={description}
          onChange={setDescription}
          className="mt-6"
        />
      

      </div>
    </>
  );
};

export default MinistryInput;
