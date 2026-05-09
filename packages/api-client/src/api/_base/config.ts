import type { AxiosInstance } from 'axios';
import AxiosService from './axios';
import type { TroottAxiosOptions } from './types';
import AuthAPI from '../authentication/auth';
import RoleAPI from '../authentication/role';
import PermissionAPI from '../authentication/permission';
import UserAPI from '../users/user/user';
import ProfileAPI from '../users/profile/profile';
import ListenerAPI from '../users/listener/listener';
import MinisterAPI from '../users/minister/minister';
import CreatorAPI from '../users/creator/creator';
import AdminAPI from '../users/admin/admin';
import SermonAPI from '../core/sermon/sermon';
import LibraryAPI from '../core/library/library';
import PlaylistAPI from '../core/playlist/playlist';
import PreferenceAPI from '../core/preference/preference';
import SearchAPI from '../core/search/search';
import DiscoveryAPI from '../core/discovery/discovery';
import PlaybackAPI from '../core/playback/playback';
import OpenAPI from '../core/open/open';
import ShareAPI from '../platform/share/share';
import StorageAPI from '../platform/storage/storage';
import InvitationAPI from '../platform/Invitation/invitation';
import PushAPI from '../notifications/push';
import PlanAPI from '../payments/plan';
import SubscriptionAPI from '../payments/subscription';
import TransactionAPI from '../payments/transaction';

export class TroottAPIClient {
    public readonly auth: AuthAPI;
    public readonly role: RoleAPI;
    public readonly permission: PermissionAPI;
    public readonly user: UserAPI;
    public readonly profile: ProfileAPI;
    public readonly listener: ListenerAPI;
    public readonly minister: MinisterAPI;
    public readonly creator: CreatorAPI;
    public readonly admin: AdminAPI;
    public readonly sermon: SermonAPI;
    public readonly library: LibraryAPI;
    public readonly playlist: PlaylistAPI;
    public readonly preference: PreferenceAPI;
    public readonly search: SearchAPI;
    public readonly discovery: DiscoveryAPI;
    public readonly playback: PlaybackAPI;
    public readonly open: OpenAPI;
    public readonly share: ShareAPI;
    public readonly storage: StorageAPI;
    public readonly invitation: InvitationAPI;
    public readonly push: PushAPI;
    public readonly plan: PlanAPI;
    public readonly subscription: SubscriptionAPI;
    public readonly transaction: TransactionAPI;

    constructor(protected readonly transport: AxiosService) {
        this.auth = new AuthAPI(transport);
        this.role = new RoleAPI(transport);
        this.permission = new PermissionAPI(transport);
        this.user = new UserAPI(transport);
        this.profile = new ProfileAPI(transport);
        this.listener = new ListenerAPI(transport);
        this.minister = new MinisterAPI(transport);
        this.creator = new CreatorAPI(transport);
        this.admin = new AdminAPI(transport);
        this.sermon = new SermonAPI(transport);
        this.library = new LibraryAPI(transport);
        this.playlist = new PlaylistAPI(transport);
        this.preference = new PreferenceAPI(transport);
        this.search = new SearchAPI(transport);
        this.discovery = new DiscoveryAPI(transport);
        this.playback = new PlaybackAPI(transport);
        this.open = new OpenAPI(transport);
        this.share = new ShareAPI(transport);
        this.storage = new StorageAPI(transport);
        this.invitation = new InvitationAPI(transport);
        this.push = new PushAPI(transport);
        this.plan = new PlanAPI(transport);
        this.subscription = new SubscriptionAPI(transport);
        this.transaction = new TransactionAPI(transport);
    }

    /** Raw axios for multipart uploads and upload progress callbacks. */
    getHttpClient(): AxiosInstance {
        return this.transport.getHttpClient();
    }
}

let globalInstance: TroottAPIClient | null = null;

export function setGlobalInstance(instance: TroottAPIClient): void {
    globalInstance = instance;
}

export function troottAPIClient(): TroottAPIClient {
    if (!globalInstance) {
        throw new Error(
            'Troott SDK not initialized. Create an instance first with new Troott(baseUrl)',
        );
    }
    return globalInstance;
}

export default class Troott extends TroottAPIClient {
    constructor(baseUrl: string, options?: TroottAxiosOptions) {
        const transport = new AxiosService(baseUrl, options);
        super(transport);
        setGlobalInstance(this);
    }
}
