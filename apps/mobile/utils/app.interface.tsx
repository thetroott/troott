export interface IAppState {
  player: IIPlayerState;
  auth: IAuthState;
  media: IMedia
  notifications: INotifications
  subscription: ISubscription
  ui: IUi
  isPlayerReady: boolean;
}

export interface IIPlayerState {
  isPlaying: boolean;
  isSetup: boolean;
  currentTrack: {
    title: string | null;
    artist: string | null;
    artwork: string | null;
  };
  position: number;
  duration: number;
  playlist: Array<string>
}

export interface IAuthState {
  isAuthenticated: boolean;
  user: {
    name: string | null;
    email: string | null;
  };
  token: string | null;
}

export interface IPlayer {
  isPlaying: boolean;
  currentTrack: {
    title: string | null;
    artist: string | null;
    artwork: string | null;
  };
  position: number;
  duration: number;
  playlist: any[]; // Stores user-created playlists
}

export interface IMedia {
  favorites: any[];
  downloads: any[];
  searchHistory: string[];
}

export interface INotifications {
  alerts: any[];
  pushToken: string | null;
}

export interface ISubscription {
  plan: string | null;
  paymentStatus: string | null;
}

export interface IUi {
  isLoading: boolean;
  error: string | null;
}

// initialstate
const initialState: IAppState = {
  auth: {
    isAuthenticated: false,
    user: { name: null, email: null },
    token: null,
  },
  player: {
    isSetup: false,
    isPlaying: false,
    currentTrack: { title: null, artist: null, artwork: null },
    position: 0,
    duration: 0,
    playlist: [],
  },
  media: { favorites: [], downloads: [], searchHistory: [] },
  notifications: { alerts: [], pushToken: null },
  subscription: { plan: null, paymentStatus: null },
  ui: { isLoading: false, error: null },
  isPlayerReady: false
};

export default initialState;