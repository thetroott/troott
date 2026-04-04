import { SolidIcons } from "@/assets/icons";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import {
  ArchiveAdd,
  DocumentDownload,
  Heart,
  Message,
  MusicFilter,
  Next,
  Profile,
  Share,
  Timer1,
  Warning2,
} from "iconsax-react-nativejs";

export const TrackListActions = [
  {
    icon: <Heart color={theme.colors.grey[50]} />,
    label: "Like",
    action: () => {},
  },
  {
    icon: <ArchiveAdd color={theme.colors.grey[50]} />,
    label: "Save to playlist",
    action: () => {router.push("/playlist/user-playlist-add-track");},
  },
  {
    icon: <Next color={theme.colors.grey[50]} />,
    label: "Add to play next",
    action: () => {},
  },
  {
    icon: <MusicFilter color={theme.colors.grey[50]} />,
    label: "Add to queue",
    action: () => {},
  },
  {
    icon: <DocumentDownload color={theme.colors.grey[50]} />,
    label: "Download",
    action: () => {},
  },
  {
    icon: <Share color={theme.colors.grey[50]} />,
    label: "Share",
    action: () => {},
  },
  {
    icon: <Profile color={theme.colors.grey[50]} />,
    label: "View Preacher",
    action: () => {},
  },
  {
    icon: <Warning2 color={theme.colors.grey[50]} />,
    label: "Report",
    action: () => {},
  },
  {
    icon: <Timer1 color={theme.colors.grey[50]} />,
    label: "Sleep Timer",
    action: () => {},
  },
];
