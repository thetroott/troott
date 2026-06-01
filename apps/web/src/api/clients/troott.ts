import AxiosService from '../core/axios';
import AuthAPI from './auth';
import UserAPI from './user';
import StorageAPI from './storage';
import SermonAPI from './sermon';
import LibraryAPI from './library';
import PlaylistAPI from './playlist';
import PlaybackAPI from './playback';
import ListenerAPI from './listener';
import MinisterAPI from './minister';
import CreatorAPI from './creator';
import StudioAPI from './studio';
import PlanAPI from './plan';
import SubscriptionAPI from './subscription';
import DiscoveryAPI from './discovery';
import SearchAPI from './search';
import InvitationAPI from './invitation';
import ShareAPI from './share';
import AdminAPI from './admin';
import AnalyticsAPI from './analytics';

export class TroottAPIClient {
    public readonly auth: AuthAPI;
    public readonly user: UserAPI;
    public readonly storage: StorageAPI;
    public readonly sermon: SermonAPI;
    public readonly library: LibraryAPI;
    public readonly playlist: PlaylistAPI;
    public readonly playback: PlaybackAPI;
    public readonly listener: ListenerAPI;
    public readonly minister: MinisterAPI;
    public readonly creator: CreatorAPI;
    public readonly studio: StudioAPI;
    public readonly plan: PlanAPI;
    public readonly subscription: SubscriptionAPI;
    public readonly discovery: DiscoveryAPI;
    public readonly search: SearchAPI;
    public readonly invitation: InvitationAPI;
    public readonly share: ShareAPI;
    public readonly admin: AdminAPI;
    public readonly analytics: AnalyticsAPI;

    constructor(axiosService: AxiosService) {
        this.auth = new AuthAPI(axiosService);
        this.user = new UserAPI(axiosService);
        this.storage = new StorageAPI(axiosService);
        this.sermon = new SermonAPI(axiosService);
        this.library = new LibraryAPI(axiosService);
        this.playlist = new PlaylistAPI(axiosService);
        this.playback = new PlaybackAPI(axiosService);
        this.listener = new ListenerAPI(axiosService);
        this.minister = new MinisterAPI(axiosService);
        this.creator = new CreatorAPI(axiosService);
        this.studio = new StudioAPI(axiosService);
        this.plan = new PlanAPI(axiosService);
        this.subscription = new SubscriptionAPI(axiosService);
        this.discovery = new DiscoveryAPI(axiosService);
        this.search = new SearchAPI(axiosService);
        this.invitation = new InvitationAPI(axiosService);
        this.share = new ShareAPI(axiosService);
        this.admin = new AdminAPI(axiosService);
        this.analytics = new AnalyticsAPI(axiosService);
    }
}

let globalInstance: TroottAPIClient | null = null;

export function troottAPIClient(): TroottAPIClient {
    if (!globalInstance) {
        throw new Error(
            'Troott SDK not initialized. Create an instance first with `new Troott(baseUrl)`.',
        );
    }
    return globalInstance;
}

/**
 * Web Troott HTTP client (v1 paths, local session storage via {@link AxiosService}).
 *
 * @example
 * ```ts
 * import api from '@/api/config';
 * await api.auth.loginUser({ email, password });
 * ```
 */
export default class Troott extends TroottAPIClient {
    constructor(baseUrl: string) {
        const axiosService = new AxiosService(baseUrl);
        super(axiosService);
        globalInstance = this;
    }
}
