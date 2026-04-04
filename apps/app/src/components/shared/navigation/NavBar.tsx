import { BellIcon, HelpCircleIcon } from "lucide-react";
import TopNav from "./TopNav";
import Trigger from "./Trigger";
import UserAvatar from "./UserAvatar";

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between p-4 h-14 w-full top-0 z-50 bg-neutral-900">
      {/* LEFT */}
      <div className="flex items-center ">
        <Trigger />
        <TopNav />
      </div>
      {/* RIGHT */}
      <div className="flex items-center cursor-pointer gap-2 justify-end">
        <BellIcon className="h-5 w-5" />
        <HelpCircleIcon className="h-5 w-5" />
        <UserAvatar />
      </div>
    </nav>
  );
};

// className="h-[84px] border-b flex justify-end items-center pr-[54px]
//       sticky top-0 z-40 bg-surface-page"
export default NavBar;
