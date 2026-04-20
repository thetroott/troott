import { Outlet } from "react-router-dom";
import PageHeader from "@/components/shared/get-started/PageHeader";
import HomeAddressForm from "@/components/shared/get-started/Home-address-form";


function HomeProfile() {
  return (
    <>
      <div className="mb-8">
        <PageHeader
          title="Home Address"
          description="Fill in your current residential address"
        />
      </div>

      <div className="mt-8 mx-auto pr-80">
        <HomeAddressForm />
        <Outlet />
      </div>
    </>
  );
}

export default HomeProfile;
