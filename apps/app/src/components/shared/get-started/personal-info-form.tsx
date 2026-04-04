import CountrySelect from "@/components/shared/get-started/CountrySelect";
import LegalNameInput from "./LegalNameInput";
import DateOfBirthPicker from "./DOBPicker";

const PersonalInfoForm = () => {
  

  return (
    <>
      <div className="">
        <CountrySelect />

        <LegalNameInput
          id="Legal-name"
          firstName="Damola"
          lastName="Oladipo"
          label="Legal Name"
          description="As shown on your government-issued ID"
          // description="This will be your legal name on your account"
          className="mt-8 "
        />

        <DateOfBirthPicker
          label="Date of Birth"
          className="mt-6"

        />
      

      </div>
    </>
  );
};

export default PersonalInfoForm;
