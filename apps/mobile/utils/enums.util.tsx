export enum ImageResizeMode {
    CONTAIN = 'contain',
    COVER = 'cover',
    STRETCH = 'stretch',
    CENTER = 'center',
}

export enum ENVType {
    PRODUCTION = 'production',
    STAGING = 'staging',
    DEVELOPMENT = 'development',
}

export enum EAppChannel {
    WEB = 'web',
    MOBILE = 'mobile',
    DESKTOP = 'desktop',
    WATCH = 'watch',
}

export enum QueuingType {
    PlayingNext = 'PLAYING_NEXT',
    DirectlyQueued = 'DIRECTLY_QUEUED',
    FromSelection = 'FROM_SELECTION',
}

export enum StreamingQuality {
    Original = 'original', // Direct Play
    High = 'high', // 320
    Medium = 'medium', // 256
    Low = 'low', // 128
}

/**
 * An enum of all the keys used with MMKV storage.
 */
export enum MMKVStorageKeys {
    PlayQueue = 'PLAY_QUEUE',
    Server = 'SERVER',
    User = 'USER',
    Library = 'LIBRARY',
    NowPlaying = 'NowPlaying',
    Queue = 'Queue',
    CurrentIndex = 'CurrentIndex',
    Api = 'Api',
    LibrarySortDescending = 'LibrarySortDescending',
    LibraryIsFavorites = 'LibraryIsFavorites',
    SendMetrics = 'SEND_METRICS',
    AutoDownload = 'AutoDownload',
    DownloadQuality = 'DownloadQuality',
    StreamingQuality = 'StreamingQuality',
    LibraryIsDownloaded = 'LibraryIsDownloaded',
    DevTools = 'DevTools',
    LibraryArtistPageParam = 'LibraryArtistPageParam',
    UnshuffledQueue = 'UnshuffledQueue',
    Shuffled = 'Shuffled',
    RepeatMode = 'RepeatMode',
    ReducedHaptics = 'ReducedHaptics',
    Theme = 'Theme',
}

/**
 * An enum of all the keys of mutation functions.
 */
export enum MutationKeys {
    AuthenticationWithCredentials = 'AUTH_WITH_CREDS',
    AccessToken = 'ACCESS_TOKEN',
    Credentials = 'CREDENTIALS',
}

/**
 * An enum of all the keys of query functions.
 */
export enum QueryKeys {
    AddToQueue = 'ADD_TO_QUEUE',
    AlbumTracks = 'ALBUM_TRACKS',
    Api = 'API',
    ArtistAlbums = 'ARTIST_ALBUMS',
    ArtistById = 'ARTIST_BY_ID',
    Credentials = 'CREDENTIALS',

    /**
     * @deprecated React Native Fast Image is being used instead of
     * querying for the images with Tanstack
     */
    ItemImage = 'IMAGE_BY_ITEM_ID',
    Libraries = 'LIBRARIES',
    Pause = 'PAUSE',
    Play = 'PLAY',

    /**
     * Query representing the fetching of a user's created playlists.
     *
     * Invalidation occurs by providing this query key
     */
    Playlists = 'PLAYLISTS',
    Progress = 'PROGRESS',
    PlayQueue = 'PLAY_QUEUE',
    PublicApi = 'PUBLIC_API',
    PublicSystemInfo = 'PUBLIC_SYSTEM_INFO',
    RemoveFromQueue = 'REMOVE_FROM_QUEUE',
    RemoveMultipleFromQueue = 'REMOVE_MULTIPLE_FROM_QUEUE',
    ReportPlaybackPosition = 'REPORT_PLAYBACK_POSITION',
    ReportPlaybackStarted = 'REPORT_PLAYBACK_STARTED',
    ReportPlaybackStopped = 'REPORT_PLAYBACK_STOPPED',
    ServerUrl = 'SERVER_URL',
    Playlist = 'Playlist',
    RecentlyPlayed = 'RecentlyPlayed',
    RecentlyPlayedArtists = 'RecentlyPlayedArtists',
    ArtistFeaturedAlbums = 'ArtistFeaturedAlbums',
    ArtistImage = 'ArtistImage',
    PlaybackStateChange = 'PlaybackStateChange',
    Player = 'Player',
    NetworkStatus = 'NetworkStatus',

    /**
     * @deprecated Use Playlists instead
     */
    UserPlaylists = 'UserPlaylists',

    /**
     * Query representing the fetching of tracks for an album or playlist.
     *
     * Invalidation occurs when the ID of the album or playlist is provided
     * as a query key
     */
    ItemTracks = 'ItemTracks',
    RefreshHome = 'RefreshHome',
    FavoriteArtists = 'FavoriteArtists',
    FavoriteAlbums = 'FavoriteAlbums',
    FavoriteTracks = 'FavoriteTracks',
    UserData = 'UserData',
    UpdatePlayerOptions = 'UpdatePlayerOptions',
    Item = 'Item',
    Search = 'Search',
    CatalogSearch = 'CatalogSearch',
    SearchSuggestions = 'SearchSuggestions',
    FavoritePlaylists = 'FavoritePlaylists',
    UserViews = 'UserViews',
    Audio = 'Audio',
    RecentlyAdded = 'RecentlyAdded',
    SimilarItems = 'SimilarItems',
    AudioCache = 'AudioCache',
    FrequentArtists = 'FrequentArtists',
    FrequentlyPlayed = 'FrequentlyPlayed',
    InstantMix = 'InstantMix',

    /**
     * Query representing a cache of playlist items used to check if tracks
     * are already in playlists to prevent adding duplicates
     */
    PlaylistItemCheckCache = 'PlaylistItemCheckCache',
    ArtistFeaturedOn = 'ArtistFeaturedOn',
    AllArtists = 'AllArtists',
    AllTracks = 'AllTracks',
    AllAlbums = 'AllAlbums',
    StorageInUse = 'StorageInUse',
    Patrons = 'Patrons',

    /**
     * @deprecated Use {@link InfiniteArtists} instead
     */
    AllArtistsAlphabetical = 'AllArtistsAlphabetical',

    /**
     * @deprecated Use {@link InfiniteAlbums} instead after refactoring
     * the infinite query in the {@link LibraryProvider}
     */
    AllAlbumsAlphabetical = 'AllAlbumsAlphabetical',
    RecentlyAddedAlbums = 'RecentlyAddedAlbums',
    PublicPlaylists = 'PublicPlaylists',

    /**
     * Query representing the fetching of artists in an infinite query
     */
    InfiniteArtists = 'InfiniteArtists',

    /**
     * Query representing the fetching of albums in an infinite query
     */
    InfiniteAlbums = 'InfiniteAlbums',

    /**
     * Query representing the fetching of suggested artists in an infinite query
     */
    InfiniteSuggestedArtists = 'InfiniteSuggestedArtists',
    Album = 'Album',
    TrackArtists = 'TrackArtists',
}

export enum EPasswordType {
    USERGENERATED = 'user-generated',
    SYSTEMGENERATED = 'system-generated',
    TEMPORARY = 'temporary',
    RESET = 'reset',
}

export { UserType } from '@troott/api-client';

export enum EVerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    UNDER_REVIEW = 'under-review',
    NEEDS_REVISION = 'needs-revision',
    SUSPENDED = 'suspended',
}

export enum EModels {
    USER = 'user',
    ROLE = 'role',
    PERMISSION = 'permission',
    API_KEY = 'ApiKey',
    BITE = 'pite',
    CATALOG = 'catalog',
    CREATOR = 'creator',
    LIBRARY = 'library',
    LISTENER = 'listener',
    PLAN = 'plan',
    PLAYLIST = 'playlist',
    MINISTER = 'minister',
    SUBSCRIPTION = 'subscription',
    SERIES = 'series',
    SERMON = 'sermon',
    ADMIN = 'admin',
    TRANSACTION = 'transaction',
}

export enum EdeviceType {
    ANDROID = 'android',
    IOS = 'ios',
}

export enum OtpType {
    REGISTER = 'register',
    LOGIN = 'login',
    GENERIC = 'generic',
    ACTIVATEACCOUNT = 'activate-account',
    CHANGEPASSWORD = 'change-password',
    FORGOTPASSWORD = 'forgot-password',
}
