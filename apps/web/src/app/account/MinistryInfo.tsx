import MinistryInput from "@/components/shared/get-started/MinistryInput";
import PageHeader from "@/components/shared/get-started/PageHeader";

export default function MinistryInputPage() {
  return (
    <>
      <div className="mb-8">
        <PageHeader
          title="Tell Us About Your Ministry"
          description="FThis information helps us understand your focus so we </br> can better support your content and connect you with <br/> the right audience"
        />
      </div>

      <div className="mt-8">
        <MinistryInput />
      </div>
    </>
  );
}
