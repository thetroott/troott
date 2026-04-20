import MinistryDescription from "./MinistryDescription";
import MinistryForm from "./MinistryForm";
import MinistryLocation from "./MinistryLocation";
import MinistryWebsite from "./MinistryWebsite";


const MinistryInput = () => {
  

  return (
    <>
      <div className="max-w-[410px]">
        <MinistryForm 
        ministry=""
        className="mt-6"
        />

        <MinistryWebsite 
        website=""
        className="mt-6"
        />

        <MinistryLocation
          location=""
          className="mt-6"

        />

        <MinistryDescription
          description=""
          className="mt-6"
        />
      

      </div>
    </>
  );
};

export default MinistryInput;
