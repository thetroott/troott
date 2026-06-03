import type {
    ListenerProfileDTO,
    ListenerResponseDTO,
} from '@/dtos/core/listener.dto';
import type IListenerDoc from '@/interfaces/core/listener.interface';
import { UserType } from '@/interfaces/user.interface';
import { toStoragePublicUrl } from '@/utils/helpers.util';

const idOf = (doc: unknown): string => {
    if (doc == null) {
        return '';
    }
    const d = doc as { _id?: unknown; id?: unknown };
    if (d._id != null) {
        return String(d._id);
    }
    if (d.id != null) {
        return String(d.id);
    }
    return '';
};

const topicIds = (topics: any[] | undefined): string[] =>
    (topics ?? []).map((t) => {
        if (typeof t === 'string') {
            return t;
        }
        if (t?._id != null) {
            return String(t._id);
        }
        if (t?.id != null) {
            return String(t.id);
        }
        if (t?.slug != null) {
            return String(t.slug);
        }
        return '';
    });

const ministerIds = (ministers: any[] | undefined): string[] =>
    (ministers ?? []).map((m) => {
        if (m?._id != null) {
            return String(m._id);
        }
        if (m?.id != null) {
            return String(m.id);
        }
        return '';
    });

class ListenerMapper {
    public async mapListenerResponse(
        listener: IListenerDoc,
    ): Promise<ListenerResponseDTO> {
        const l = listener as any;

        return {
            id: idOf(listener),
            code: l.code ?? '',
            firstName: l.firstName ?? '',
            lastName: l.lastName ?? '',
            middleName: l.middleName,
            email: l.email ?? '',
            slug: l.slug ?? '',
            gender: l.gender,
            dateOfBirth: l.dateOfBirth,
            phoneNumber: l.phoneNumber,
            phoneCode: l.phoneCode,
            countryPhone: l.countryPhone,
            country: l.country,
            homeCountry: l.homeCountry,
            avatar: (typeof l.avatar === 'string'
                ? toStoragePublicUrl(l.avatar)
                : toStoragePublicUrl(l.avatar?.s3Key)) as typeof l.avatar,
            banner: (typeof l.banner === 'string'
                ? toStoragePublicUrl(l.banner)
                : toStoragePublicUrl(l.banner?.s3Key)) as typeof l.banner,
            onboarding: l.onboarding,
            topics: topicIds(l.topics),
            ministers: ministerIds(l.ministers),
            ministry: l.ministry,
            createdAt: l.createdAt ?? '',
            updatedAt: l.updatedAt ?? '',
        };
    }

    public async mapListenerProfile(
        listener: IListenerDoc,
    ): Promise<ListenerProfileDTO> {
        const l = listener as any;

        return {
            id: idOf(listener),
            code: l.code ?? '',
            userType: UserType.LISTENER,
            firstName: l.firstName ?? '',
            lastName: l.lastName ?? '',
            email: l.email ?? '',
            slug: l.slug,
            bio: undefined,
            avatar: (typeof l.avatar === 'string'
                ? toStoragePublicUrl(l.avatar)
                : toStoragePublicUrl(l.avatar?.s3Key) || null) as typeof l.avatar,
            coverImage: (typeof l.banner === 'string'
                ? toStoragePublicUrl(l.banner)
                : toStoragePublicUrl(l.banner?.s3Key) || null) as typeof l.banner,
            topics: topicIds(l.topics),
            ministry: l.ministry,
            createdAt: l.createdAt ?? '',
            updatedAt: l.updatedAt ?? '',
        };
    }
}

export default new ListenerMapper();
