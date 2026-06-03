import type ICreatorDoc from '@/interfaces/core/creator.interface';
import { toStoragePublicUrl } from '@/utils/helpers.util';

class CreatorMapper {
    public async mapCreatorOwnerResponse(
        creator: ICreatorDoc,
    ): Promise<Record<string, unknown>> {
        const c = creator as any;
        const doc =
            typeof c.toObject === 'function'
                ? c.toObject({ virtuals: true })
                : { ...c };

        if (typeof doc.avatar === 'string') {
            doc.avatar = toStoragePublicUrl(doc.avatar);
        } else if (doc.avatar?.s3Key) {
            doc.avatar = toStoragePublicUrl(doc.avatar.s3Key);
        }

        if (typeof doc.banner === 'string') {
            doc.banner = toStoragePublicUrl(doc.banner);
        } else if (doc.banner?.s3Key) {
            doc.banner = toStoragePublicUrl(doc.banner.s3Key);
        }

        if (doc.verification?.document) {
            doc.verification = { ...doc.verification };
            doc.verification.document = { ...doc.verification.document };
            if (doc.verification.document.frontPage) {
                doc.verification.document.frontPage = toStoragePublicUrl(
                    doc.verification.document.frontPage,
                );
            }
            if (doc.verification.document.backPage) {
                doc.verification.document.backPage = toStoragePublicUrl(
                    doc.verification.document.backPage,
                );
            }
        }

        if (Array.isArray(doc.sermons)) {
            doc.sermons = doc.sermons.map((sermon: any) => {
                const s = { ...sermon };
                if (typeof s.imageUrl === 'string') {
                    s.imageUrl = toStoragePublicUrl(s.imageUrl);
                }
                return s;
            });
        }

        return doc;
    }
}

export default new CreatorMapper();
