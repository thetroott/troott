import PageHeader from "@/components/shared/get-started/PageHeader";
import PersonalInfoForm from "@/components/shared/get-started/personal-info-form";

function PersonalInfo() {
  return (
    <>
      <div className="mb-8">
        <PageHeader
          title="Personal Information"
          description="Please provide the following information as shown <br/>  on your passport or ID card."
        />
      </div>

      <div className="mt-0 mx-auto pr-80">
        <PersonalInfoForm />
      </div>
      
    </>
  );
}

export default PersonalInfo;
