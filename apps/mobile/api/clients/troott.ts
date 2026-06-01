import { AuthService } from './auth';
import { UserService } from './user';
import { ListenerService } from './listener';
import { LibraryService } from './library';
import { PlaylistService } from './playlist';
import { ShareService } from './share';
import { DiscoveryService } from './discovery';
import { SearchService } from './search';
import { SermonService } from './sermon';
import { PlaybackService } from './playback';
import { MinisterService } from './minister';
import { StorageService } from './storage';
import { InvitationService } from './invitation';
import { PlanService } from './plan';
import { SubscriptionService } from './subscription';
import { StudioService } from './studio';

export class TroottAPIClient {
    public readonly auth: AuthService;
    public readonly user: UserService;
    public readonly listener: ListenerService;
    public readonly library: LibraryService;
    public readonly playlist: PlaylistService;
    public readonly share: ShareService;
    public readonly discovery: DiscoveryService;
    public readonly search: SearchService;
    public readonly sermon: SermonService;
    public readonly playback: PlaybackService;
    public readonly minister: MinisterService;
    public readonly storage: StorageService;
    public readonly invitation: InvitationService;
    public readonly plan: PlanService;
    public readonly subscription: SubscriptionService;
    public readonly studio: StudioService;

    constructor() {
        this.auth = new AuthService();
        this.user = new UserService();
        this.listener = new ListenerService();
        this.library = new LibraryService();
        this.playlist = new PlaylistService();
        this.share = new ShareService();
        this.discovery = new DiscoveryService();
        this.search = new SearchService();
        this.sermon = new SermonService();
        this.playback = new PlaybackService();
        this.minister = new MinisterService();
        this.storage = new StorageService();
        this.invitation = new InvitationService();
        this.plan = new PlanService();
        this.subscription = new SubscriptionService();
        this.studio = new StudioService();
    }
}
