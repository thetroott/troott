import { Outlet } from "react-router-dom";
import PageHeader from "@/components/shared/get-started/PageHeader";
import VerifyAccountForm from "@/components/shared/get-started/verify-account-form";


function UserAccount() {
  return (
    <>
      <div className="mb-8">
        <PageHeader
          title="Let’s get you verified"
          description="Select your residence and follow the steps"
        />
      </div>

      <div className="mt-8 mx-auto pr-80">
        <VerifyAccountForm />
        <Outlet />
      </div>
    </>
  );
}

export default UserAccount;
