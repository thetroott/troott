import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useState } from 'react';
import useAuth from '@/hooks/app/useAuth';
import { PATH_PROFILE, PATH_SETTINGS } from '@/routes/paths';

const UserAvatar = () => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const { logout } = useAuth();

    const handleImageError = () => {
        setImageError(true);
    };

    const avatarSrc = 'https://github.com/shadcn.png';

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
                    <DropdownMenuItem
                        onClick={() => navigate(PATH_PROFILE)}
                    >
                        <FaUser />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => navigate(PATH_SETTINGS)}
                    >
                        <Settings />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => void logout()}
                    >
                        <LogOut />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default UserAvatar;
