import { ImageSourcePropType, ViewStyle } from "react-native";

export interface ITrackCard {
  id?: string;
  title: string;
  variant: "small" | "large";
  minister: string;
  duration: string | number;
  image: string;
  cardStyle?: ViewStyle;
  sermon?: string;
}

export interface IPlayListCard {
  coverImage?: string | ImageSourcePropType;
  title: string;
  church: string;
  description: string;
  tracks: Omit<ITrackCard, "cardStyle" | "variant">[];
  cardStyle?: ViewStyle;
}

export interface ISermon {
  
  // react-native-track-player requirement 
  id: string;
  title: string;
  description: string;
  minister: string;
  duration: number;
  releaseDate: string;
  releaseYear: number;
  sermon: string;
  image: string;
  size: number;

  type: SermonStreamType

  topic: string;
  tags: Array<string>;
  isPublic: boolean;
  shareableUrl: string;


  // troott extensible data model for smooth experience

  isSeries: boolean;
  series: Array<string>; // series IDs as string

  variant: "small" | "large";
  cardStyle?: ViewStyle;
  totalPlays?: number; // optional for small cards
}


export enum RatingType {
    Heart,
    ThumbsUpDown,
    ThreeStars,
    FourStars,
    FiveStars,
    Percentage
}

export enum SermonStreamType {
    Default = "default",
    Dash = "dash",
    HLS = "hls",
    SmoothStreaming = "smoothstreaming"
}

export interface ISeries {
  id: string;
  title: string;
  description: string;
  minister: string;
  sermons: Array<string>;
  image?: string;
  part: string;
  totalDuration: string;
  tags: Array<string>;

  isPublic: boolean;

  totalPlay: number;
  totalShares: number;
  totalLikes: number;
}

export interface ILibrary {
  id: string;
  user: string;
  likedSermons: Array<string>;
  savedBtes: Array<string>;
  playlists: Array<string>;
  favouriteministers: Array<string>;
  mostPlayed: Array<string>;
  recentlyPlayed: Array<string>;
}

export interface IPlaylist {
  title: string;
  description: string;
  playlistCover: string;
  totalDuration: string;
  isCollaborative: boolean;
  isPublic: boolean;
  likes: number;
  playlistType: string;
  items: { itemId: string; type: string }[];

  user: string;
  createdBy: string;

  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: string;
  id: string;
}

export interface IPlan {
  name: string;
  isEnabled: boolean;
  description: string;
  label: string;
  currency: string;
  code: string;
  slug: string;

  pricing: IPlanPricing;
  trial: IPlanTrial;
  sermon: IPlanSermon;
  user: string;

  createdAt: string;
  updatedAt: string;
  _versions: number;
  _id: string;
  id: string;
}

export enum PasswordType {
  USERGENERATED = "user-generated",
  SYSTEMGENERATED = "system-generated",
  TEMPORARY = "temporary",
  RESET = "reset",
}

export enum UserType {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  minister = "minister",
  CREATOR = "creator",
  LISTENER = "listener",
  USER = "user",
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string; // frontend will only send this to API, not store it
  passwordType: PasswordType;
  userType: UserType;

  phoneNumber: string;
  phoneCode: string;
  country: string;
  countryPhone: string;

  avatar: string;
  dateOfBirth: string; // ISO date string
  gender: string;

  accessToken: string;
  accessTokenExpiry: string;
  tokenVersion: number;

  isActivated: boolean;
  isDeactivated: boolean;

  lastLogin: string;
  isActive: boolean;
  loginLimit: number;
  isLocked: boolean;
  lockedUntil: string | null;
  twoFactorEnabled: boolean;

  preferences: {
    topics: Array<string>;
    minister: Array<string>; // minister IDs
  };

  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };

  role: string;

  createdAt: string;
  updatedAt: string;
  _version: number;
  _id: string;
  id: string;
}

export interface IBillingInfo {
  amount: number;
  startDate: Date;
  paidDate: Date;
  dueDate: Date;
  graceDate: Date;
  frequency: string;
}
export interface IPlanPricing {
  monthly: number;
  yearly: number;
  perMonth: number;
}

export interface IPlanTrial {
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  days: number;
}

export interface IPlanSermon {
  limit: {
    value: number;
    frequency: string;
  };
}
