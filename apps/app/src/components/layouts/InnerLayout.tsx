import { Outlet } from "react-router-dom";
import SaveAndExit from "../shared/get-started/SaveAndExit";
import ProgressButtons from "../shared/get-started/ProgressButtons";

const InnerLayout = () => {
  return (
    <div className="flex-1 m-10 pl-6 pt-2 pr-6 rounded-md overflow-auto">
      <div className="flex justify-end items-center cursor-pointer mb-10">
        <SaveAndExit />
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <Outlet />

           <div className="justify-items-start">
        <ProgressButtons />
      </div>
      </div>

   

    </div>
  );
};

export default InnerLayout;
