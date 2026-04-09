import ShareableLink from './shareable-link.model';
import { IResult } from '../../../utils/interfaces.util';
import { IShareableLinkDoc } from './shareable-link.interface';
import { CreateShareableLinkDTO } from './shareable-link.dto';

class ShareableLinkRepository {
    public async createShareableLink(
        linkData: CreateShareableLinkDTO & { token: string; expiresAt: Date },
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const link = await ShareableLink.create(linkData);
            if (!link) {
                result.error = true;
                result.code = 500;
                result.message = "Couldn't save shareable link";
                return result;
            }

            result.code = 201;
            result.message = 'Shareable link created';
            result.data = link;
            return result;
        } catch (error: any) {
            result.error = true;
            result.code = 500;
            result.message = error.message || "Couldn't save shareable link";
            return result;
        }
    }

    public async findShareableLinkByToken(
        token: string,
    ): Promise<IShareableLinkDoc | null> {
        const link = await ShareableLink.findOne({ token });
        return link;
    }

    public async findShareableLinksByResource(
        resourceId: string,
        linkType: string,
        options?: {
            includeRevoked?: boolean;
            includeExpired?: boolean;
        },
    ): Promise<IShareableLinkDoc[]> {
        const query: any = {
            resourceId,
            linkType,
        };

        if (!options?.includeRevoked) {
            query.isRevoked = false;
        }

        if (!options?.includeExpired) {
            query.expiresAt = { $gt: new Date() };
        }

        const links = await ShareableLink.find(query).sort({ createdAt: -1 });
        return links;
    }

    public async findActiveShareableLinkByResource(
        resourceId: string,
        linkType: string,
    ): Promise<IShareableLinkDoc | null> {
        const link = await ShareableLink.findOne({
            resourceId,
            linkType,
            isActive: true,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        return link;
    }

    public async revokeShareableLink(
        resourceId: string,
        linkType: string,
        token?: string,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const query: any = {
            resourceId,
            linkType,
            isRevoked: false,
        };

        if (token) {
            query.token = token;
        }

        const updateResult = await ShareableLink.updateMany(query, {
            isRevoked: true,
            isActive: false,
            revokedAt: new Date(),
        });

        result.message = `Revoked ${updateResult.modifiedCount} shareable link(s)`;
        result.data = { modifiedCount: updateResult.modifiedCount };
        return result;
    }

    public async updateShareableLink(
        token: string,
        resourceId: string,
        linkType: string,
        updateData: {
            expiresAt?: Date;
            linkName?: string;
            metadata?: Record<string, unknown>;
            isActive?: boolean;
        },
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const link = await ShareableLink.findOneAndUpdate(
            { token, resourceId, linkType },
            updateData,
            { new: true },
        );

        if (!link) {
            result.error = true;
            result.code = 404;
            result.message = 'Shareable link not found';
            return result;
        }

        result.message = 'Shareable link updated';
        result.data = link;
        return result;
    }

    public async incrementAccessCount(token: string): Promise<void> {
        await ShareableLink.findOneAndUpdate(
            { token },
            {
                $inc: { accessCount: 1 },
                $set: { lastAccessedAt: new Date() },
            },
        );
    }

    public async deleteExpiredLinks(olderThanDays: number = 30): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const cutoffDate = new Date(
            Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
        );

        const deleteResult = await ShareableLink.deleteMany({
            expiresAt: { $lt: cutoffDate },
            isRevoked: true,
        });

        result.message = `Deleted ${deleteResult.deletedCount} expired shareable link(s)`;
        result.data = { deletedCount: deleteResult.deletedCount };
        return result;
    }
}

export default new ShareableLinkRepository();
