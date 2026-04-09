import { dateToday, IDateToday, Random } from '@btffamily/pacitude';
import { IResult } from '../../../utils/interfaces.util';
import {
    CreateShareableLinkDTO,
    ValidateShareableLinkDTO,
    RevokeShareableLinkDTO,
    GetShareableLinksDTO,
    UpdateShareableLinkDTO,
} from './shareable-link.dto';
import shareableLinkRepository from './shareable-link.repository';
import ShareableLink from './shareable-link.model';
import { IShareableLinkDoc, ShareableLinkType } from './shareable-link.interface';
import systemService from '../../../services/system.service';
import mongoose from 'mongoose';

/**
 * @name ShareableLinkService
 * @description Manages the lifecycle and validation of shareable links across multiple resources
 * without embedding domain-specific business logic. Handles token security, expiration,
 * and access tracking.
 */
class ShareableLinkService {
    public result: IResult;
    public today: IDateToday;

    // Default expiration time in days
    private readonly DEFAULT_EXPIRATION_DAYS = 7;

    constructor() {
        this.today = dateToday(new Date());
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    /**
     * @name generateShareableLink
     * @description Creates a new shareable link for a resource
     * @param {CreateShareableLinkDTO} dto - Data required to create a shareable link
     * @returns {Promise<IResult>} Result containing the raw token and link details
     */
    public async generateShareableLink(
        dto: CreateShareableLinkDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const {
            linkType,
            resourceId,
            createdBy,
            expiresInDays = this.DEFAULT_EXPIRATION_DAYS,
            linkName,
            metadata = {},
        } = dto;

        // Validate required fields
        if (!linkType || !resourceId || !createdBy) {
            result.error = true;
            result.code = 400;
            result.message = 'linkType, resourceId, and createdBy are required';
            return result;
        }

        // Validate ObjectId formats
        if (!this.validateObjectId(resourceId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid resourceId format (must be valid ObjectId)';
            return result;
        }

        if (!this.validateObjectId(createdBy)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid createdBy format (must be valid ObjectId)';
            return result;
        }

        // Validate linkType enum
        if (!Object.values(ShareableLinkType).includes(linkType)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid linkType';
            return result;
        }

        // Generate unique token
        const rawToken = await this.generateToken();

        // Encrypt token using resourceId as payload for additional security
        const encryptedToken = await systemService.encryptData({
            password: rawToken,
            payload: resourceId,
            separator: '-',
        });

        if (encryptedToken.error || !encryptedToken.data) {
            result.error = true;
            result.code = 500;
            result.message = 'Failed to encrypt token';
            return result;
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        // Create shareable link
        const createResult = await shareableLinkRepository.createShareableLink({
            linkType,
            resourceId,
            createdBy,
            token: encryptedToken.data,
            expiresAt,
            linkName,
            metadata,
        });

        if (createResult.error) {
            result.error = true;
            result.code = createResult.code || 500;
            result.message = createResult.message;
            return result;
        }

        result.message = 'Shareable link created successfully';
        result.code = 201;
        result.data = {
            token: rawToken, // Return raw token for immediate use
            linkId: (createResult.data as IShareableLinkDoc)?._id || (createResult.data as IShareableLinkDoc)?.id,
            expiresAt,
            linkName,
            linkType,
            resourceId,
        };
        return result;
    }

    /**
     * @name validateShareableLink
     * @description Validates a shareable link token and checks expiration
     * @param {ValidateShareableLinkDTO} dto - Token and resourceId to validate
     * @returns {Promise<IResult>} Validation result with link details
     */
    public async validateShareableLink(
        dto: ValidateShareableLinkDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const { token, resourceId, linkType } = dto;

        if (!token || !resourceId) {
            result.error = true;
            result.code = 400;
            result.message = 'Token and resourceId are required';
            return result;
        }

        // Validate ObjectId format
        if (!this.validateObjectId(resourceId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid resourceId format';
            return result;
        }

        // Encrypt token to match stored format
        const encryptedToken = await systemService.encryptData({
            password: token,
            payload: resourceId,
            separator: '-',
        });

        if (encryptedToken.error || !encryptedToken.data) {
            result.error = true;
            result.code = 500;
            result.message = 'Failed to process token';
            return result;
        }

        // Find the link
        const link = await shareableLinkRepository.findShareableLinkByToken(
            encryptedToken.data,
        );

        if (!link) {
            result.error = true;
            result.code = 404;
            result.message = 'Shareable link not found';
            return result;
        }

        // Verify resourceId matches
        if (String(link.resourceId) !== String(resourceId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid token for this resource';
            return result;
        }

        // Verify linkType if provided
        if (linkType && link.linkType !== linkType) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid link type';
            return result;
        }

        // Check if link is revoked
        if (link.isRevoked || !link.isActive) {
            result.error = true;
            result.code = 400;
            result.message = 'Shareable link has been revoked';
            return result;
        }

        // Check if link has expired
        if (new Date() > link.expiresAt) {
            result.error = true;
            result.code = 400;
            result.message = 'Shareable link has expired';
            return result;
        }

        // Increment access count
        await shareableLinkRepository.incrementAccessCount(encryptedToken.data);

        result.message = 'Shareable link is valid';
        result.data = {
            linkId: link._id.toString(),
            linkType: link.linkType,
            resourceId: link.resourceId.toString(),
            expiresAt: link.expiresAt,
            metadata: link.metadata,
            accessCount: (link.accessCount || 0) + 1,
        };
        return result;
    }

    /**
     * @name revokeShareableLink
     * @description Revokes one or all shareable links for a resource
     * @param {RevokeShareableLinkDTO} dto - Resource and optional token to revoke
     * @returns {Promise<IResult>} Revocation result
     */
    public async revokeShareableLink(
        dto: RevokeShareableLinkDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const { resourceId, linkType, token, createdBy } = dto;

        if (!resourceId || !linkType) {
            result.error = true;
            result.code = 400;
            result.message = 'resourceId and linkType are required';
            return result;
        }

        // Validate ObjectId format
        if (!this.validateObjectId(resourceId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid resourceId format';
            return result;
        }

        // If token is provided, encrypt it
        let encryptedToken: string | undefined;
        if (token) {
            const encryptResult = await systemService.encryptData({
                password: token,
                payload: resourceId,
                separator: '-',
            });

            if (encryptResult.error || !encryptResult.data) {
                result.error = true;
                result.code = 500;
                result.message = 'Failed to process token';
                return result;
            }

            encryptedToken = encryptResult.data;
        }

        // Revoke the link(s)
        const revokeResult = await shareableLinkRepository.revokeShareableLink(
            resourceId,
            linkType,
            encryptedToken,
        );

        result.message = revokeResult.message;
        result.data = revokeResult.data;
        return result;
    }

    /**
     * @name getShareableLinksByResource
     * @description Gets all shareable links for a resource
     * @param {GetShareableLinksDTO} dto - Resource details
     * @returns {Promise<IResult>} List of shareable links
     */
    public async getShareableLinksByResource(
        dto: GetShareableLinksDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const { resourceId, linkType, includeRevoked = false, includeExpired = false } = dto;

        if (!resourceId || !linkType) {
            result.error = true;
            result.code = 400;
            result.message = 'resourceId and linkType are required';
            return result;
        }

        // Validate ObjectId format
        if (!this.validateObjectId(resourceId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid resourceId format';
            return result;
        }

        const links = await shareableLinkRepository.findShareableLinksByResource(
            resourceId,
            linkType,
            {
                includeRevoked,
                includeExpired,
            },
        );

        result.message = `Found ${links.length} shareable link(s)`;
        result.data = links.map((link) => ({
            linkId: link._id.toString(),
            linkType: link.linkType,
            linkName: link.linkName,
            expiresAt: link.expiresAt,
            isActive: link.isActive,
            isRevoked: link.isRevoked,
            revokedAt: link.revokedAt,
            accessCount: link.accessCount,
            lastAccessedAt: link.lastAccessedAt,
            createdAt: link.createdAt,
            metadata: link.metadata,
        }));
        return result;
    }

    /**
     * @name updateShareableLink
     * @description Updates a shareable link (expiration, name, metadata, active status)
     * @param {UpdateShareableLinkDTO} dto - Update data
     * @returns {Promise<IResult>} Updated link details
     */
    public async updateShareableLink(
        dto: UpdateShareableLinkDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const {
            token,
            resourceId,
            linkType,
            expiresInDays,
            linkName,
            metadata,
            isActive,
        } = dto;

        if (!token || !resourceId || !linkType) {
            result.error = true;
            result.code = 400;
            result.message = 'token, resourceId, and linkType are required';
            return result;
        }

        // Encrypt token
        const encryptedToken = await systemService.encryptData({
            password: token,
            payload: resourceId,
            separator: '-',
        });

        if (encryptedToken.error || !encryptedToken.data) {
            result.error = true;
            result.code = 500;
            result.message = 'Failed to process token';
            return result;
        }

        // Prepare update data
        const updateData: any = {};
        if (expiresInDays !== undefined) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expiresInDays);
            updateData.expiresAt = expiresAt;
        }
        if (linkName !== undefined) {
            updateData.linkName = linkName;
        }
        if (metadata !== undefined) {
            updateData.metadata = metadata;
        }
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        const updateResult = await shareableLinkRepository.updateShareableLink(
            encryptedToken.data,
            resourceId,
            linkType,
            updateData,
        );

        if (updateResult.error) {
            result.error = true;
            result.code = updateResult.code || 500;
            result.message = updateResult.message;
            return result;
        }

        result.message = 'Shareable link updated successfully';
        result.data = updateResult.data;
        return result;
    }

    /**
     * @name cleanupExpiredLinks
     * @description Deletes expired and revoked links older than specified days
     * @param daysOld - Number of days old (default: 30)
     * @returns Promise<IResult>
     */
    public async cleanupExpiredLinks(
        daysOld: number = 30,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const cleanupResult = await shareableLinkRepository.deleteExpiredLinks(
            daysOld,
        );

        result.message = cleanupResult.message;
        result.data = cleanupResult.data;
        return result;
    }

    /**
     * @name generateToken
     * @description Generates a unique shareable link token
     * @returns Promise<string> Raw token
     */
    private async generateToken(): Promise<string> {
        let token: string;
        let exists: boolean;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            // Generate 32-byte random token (64 hex characters)
            token = Random.randomCode(32, true).toString();

            // Check if token exists (encrypt and check)
            const encryptToken = await systemService.encryptData({
                password: token,
                payload: '', // Empty payload for checking uniqueness
                separator: '-',
            });

            if (encryptToken.error || !encryptToken.data) {
                throw new Error('Failed to encrypt token during generation');
            }

            const existingLink = await ShareableLink.findOne({
                token: encryptToken.data,
            });
            exists = !!existingLink;
            attempts++;

            if (attempts >= maxAttempts) {
                throw new Error(
                    'Failed to generate unique token after maximum attempts',
                );
            }
        } while (exists);

        return token;
    }

    /**
     * @name validateObjectId
     * @description Validates MongoDB ObjectId format
     * @param id - ID to validate
     * @returns boolean
     */
    private validateObjectId(id: string): boolean {
        return (
            mongoose.Types.ObjectId.isValid(id) &&
            new mongoose.Types.ObjectId(id).toString() === id
        );
    }
}

export default new ShareableLinkService();
