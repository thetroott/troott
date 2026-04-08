import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { FaUser } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";

const UserAvatar = () => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const avatarSrc = "https://github.com/shadcn.png";

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="flex cursor-pointer justify-center items-center pt-1.5">
            {!imageError && (
              <AvatarImage
                src={avatarSrc}
                width={24}
                height={24}
                className="rounded-lg h-5 w-5"
                onError={handleImageError}
                loading="lazy"
              />
            )}
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              <FaUser className="h-3 w-3" />
            </AvatarFallback>
            <ChevronDown className="h-5 w-5" />
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={10}>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <FaUser />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">
            {" "}
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserAvatar;
