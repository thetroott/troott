import { InvitationStatus, InvitationType } from './invitation.interface';
import { IResult } from '../../../utils/interfaces.util';
import {
    CreateInvitationDTO,
    InviteTokenDTO,
    CreateBulkInvitationDTO,
} from './invitation.dto';
import invitationRepository from './invitation.repository';
import Invites from './invitation.model';
import { dateToday, IDateToday, Random } from '@btffamily/pacitude';
import systemService from '../../../services/system.service';
import mongoose from 'mongoose';

/**
 *@name InvitationService
 * @description Manages the lifecycle and validation of invitations across multiple domains
 * without embedding domain-specific business logic. Handles token security,
 * status transitions, and expiration.
 */

class InvitationService {
    public result: IResult;
    public today: IDateToday;

    // Default expiration time in days
    private readonly DEFAULT_EXPIRATION_DAYS = 7;

    constructor() {
        this.today = dateToday(new Date());
        this.result = { error: false, message: '', code: 200, data: {} };
    }

    /**
     * @name newInvitation
     * @description Creates a new invitation.
     * @param {CreateInvitationDTO} dto - Data required to create an invitation.
     * @returns {Promise<{ invitationId: ObjectId; token: string }>}
     *          The ID of the created invitation and the raw token.
     */
    public async newInvitation(dto: CreateInvitationDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const {
            invitedBy,
            inviteeEmail,
            inviteeUserId,
            inviteType,
            resourceId,
            expiresAt,
            metadata,
        } = dto;

        if (!invitedBy || !inviteeEmail) {
            result.error = true;
            result.message =
                'InvitedBy and InviteeEmail must exist and cannot be empty';
            return result;
        }

        // Validate email format
        if (!this.validateEmailFormat(inviteeEmail)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid email format';
            return result;
        }

        // Validate ObjectId formats
        if (!this.validateObjectId(invitedBy)) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid invitedBy format (must be valid ObjectId)';
            return result;
        }

        if (!this.validateObjectId(resourceId)) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid resourceId format (must be valid ObjectId)';
            return result;
        }

        if (inviteeUserId && !this.validateObjectId(inviteeUserId)) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid inviteeUserId format (must be valid ObjectId)';
            return result;
        }

        if (!resourceId) {
            result.error = true;
            result.message =
                'Please provide a specific resource id the invitation belongs to';
            return result;
        }

        if (!Object.values(InvitationType).includes(inviteType)) {
            result.error = true;
            result.message = 'Invitation type must be part of enum!';
            return result;
        }

        // check to see if user has already been invited
        const existingInvite = await Invites.findOne({
            inviteeEmail: inviteeEmail.toLowerCase(),
            resourceId, // particular resource
        });

        if (existingInvite) {
            result.error = true;
            result.message = `User has already been invited to ${resourceId} with status: ${existingInvite.inviteStatus}`;
            return result;
        }

        // Also check by inviteeUserId if provided
        if (inviteeUserId) {
            const existingInviteByUserId = await Invites.findOne({
                inviteeUserId,
                resourceId,
            });

            if (existingInviteByUserId) {
                result.error = true;
                result.message = `User with ID ${inviteeUserId} has already been invited to ${resourceId} with status: ${existingInviteByUserId.inviteStatus}`;
                return result;
            }
        }

        const token = await this.generateInviteToken();

        // encrypt token
        const encryptToken = await systemService.encryptData({
            password: token,
            payload: inviteeEmail,
            separator: '-',
        });

        // Calculate expiration date (use provided or default)
        const expirationDate =
            expiresAt ||
            new Date(
                Date.now() + this.DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
            );

        const saveInvite = await invitationRepository.createInvite({
            inviteType,
            invitedBy,
            inviteeEmail,
            inviteeUserId,
            resourceId,
            expiresAt: expirationDate,
            inviteStatus: InvitationStatus.PENDING,
            inviteToken: encryptToken,
            metadata: metadata || {},
        });

        if (saveInvite.error) {
            result.error = true;
            result.code = saveInvite.code;
            result.message = saveInvite.message;
            return result;
        }

        result.message = 'invite created Successfully';
        result.data = {
            token,
            invitationId: saveInvite.data?._id || saveInvite.data?.id,
            status: InvitationStatus.PENDING,
            expiresAt: expirationDate,
        };
        return result;
    }

    /**
     * @name generateInviteToken
     * @description An helper function used by Invitation service privately to generate token
     * @returns a raw invite token
     */
    private async generateInviteToken(): Promise<string> {
        let token: string;
        let exists: boolean;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            const gencode = Random.randomCode(29, true);
            token = gencode.toString();

            // Check if token exists (encrypt and check)
            const encryptToken = await systemService.encryptData({
                password: token,
                payload: '', // Empty payload for checking uniqueness
                separator: '-',
            });

            const existingInvite = await Invites.findOne({
                inviteToken: encryptToken,
            });
            exists = !!existingInvite;
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
     * @name validateDTO
     * @description Validates InviteTokenDTO input
     * @param dto - DTO to validate
     * @returns IResult
     */
    private async validateDTO(dto: InviteTokenDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const { email, token } = dto;

        if (!token) {
            result.error = true;
            result.code = 400;
            result.message = 'Please provide token to validate!';
            return result;
        }

        if (token.length < 20) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid token format (too short)';
            return result;
        }

        if (!email) {
            result.error = true;
            result.code = 400;
            result.message = 'Please provide invitee Email!';
            return result;
        }

        // Validate email format
        if (!this.validateEmailFormat(email)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid email format';
            return result;
        }

        result.message = 'Validation successfully';
        return result;
    }

    /**
     * @name validateToken
     * @description Validates an invitation token.
     * @param {inviteTokenDTO}  - Raw invitation object containing token and email to validate.
     * @returns {Promise<{ valid: boolean }>}
     *          Whether the token corresponds to a valid, pending, and unexpired invitation.
     */

    public async validateInvite(dto: InviteTokenDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const dtoValidationResult = await this.validateDTO(dto);

        if (dtoValidationResult.error) {
            return dtoValidationResult;
        }

        const { email, token } = dto;

        const encryptToken = await systemService.encryptData({
            password: token,
            payload: email,
            separator: '-',
        });

        const invite = await Invites.findOne({
            inviteToken: encryptToken,
            inviteStatus: InvitationStatus.PENDING,
        });

        if (!invite) {
            result.error = true;
            result.message = 'No invite found by the provided token and email';
            return result;
        }

        // check for expiration even though its pending
        const today = new Date();

        const expiresAt = invite.expiresAt;

        if (today > expiresAt) {
            // Mark invitation as expired
            if (
                this.validateStatusTransition(
                    invite.inviteStatus,
                    InvitationStatus.EXPIRED,
                )
            ) {
                invite.inviteStatus = InvitationStatus.EXPIRED;
                await invite.save();
            }
            result.error = true;
            result.code = 400;
            result.message = 'Invitation expired';
            return result;
        }

        // Validate status transition
        if (
            !this.validateStatusTransition(
                invite.inviteStatus,
                InvitationStatus.ACCEPTED,
            )
        ) {
            result.error = true;
            result.code = 400;
            result.message = `Invalid status transition from ${invite.inviteStatus} to ${InvitationStatus.ACCEPTED}`;
            return result;
        }

        invite.inviteStatus = InvitationStatus.ACCEPTED;
        invite.acceptedAt = new Date();
        await invite.save();

        result.message = 'Invitation Validated and marked as Accepted';
        result.data = {
            invitationId: invite._id.toString(),
            invitedBy: invite.invitedBy,
            status: invite.inviteStatus,
            acceptedAt: invite.acceptedAt,
        };
        return result;
    }

    /**
     * @revokeInvitation
     * @description Revokes an existing invitation.
     * @param {inviteTokenDTO} - An object containing the email and token of the invitation to revoke.
     * @returns {Promise<IResult>}
     *          Success status; idempotent if already accepted or revoked. successfully revoked invitation
     */
    public async revokeInvite(dto: InviteTokenDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const dtoValidationResult = await this.validateDTO(dto);

        if (dtoValidationResult.error) {
            return dtoValidationResult;
        }
        const { email, token } = dto;

        const encryptToken = await systemService.encryptData({
            password: token,
            payload: email,
            separator: '-',
        });

        const invite = await Invites.findOne({
            inviteToken: encryptToken,
            inviteStatus: InvitationStatus.PENDING,
        });

        if (!invite) {
            result.error = true;
            result.code = 404;
            result.message =
                'No Pending invite found by the provided token and email';
            return result;
        }

        // Validate status transition
        if (
            !this.validateStatusTransition(
                invite.inviteStatus,
                InvitationStatus.REVOKED,
            )
        ) {
            result.error = true;
            result.code = 400;
            result.message = `Invalid status transition from ${invite.inviteStatus} to ${InvitationStatus.REVOKED}`;
            return result;
        }

        invite.inviteStatus = InvitationStatus.REVOKED;
        invite.revokedAt = new Date();
        await invite.save();

        result.message = 'Invitation revoked successfully';
        result.data = {
            invitationId: invite._id.toString(),
            status: invite.inviteStatus,
            revokedAt: invite.revokedAt,
        };
        return result;
    }

    /**
     * @name resendInvitation
     * @descripton Resends an invitation by generating a new token.
     * @param {inviteTokenDTO} - An object containing the email and token of the invitation to resend.
     * @returns {Promise<IResult>} the new token
     *
     */
    public async resendInvite(dto: InviteTokenDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const dtoValidationResult = await this.validateDTO(dto);

        if (dtoValidationResult.error) {
            return dtoValidationResult;
        }
        const { email, token } = dto;

        const encryptToken = await systemService.encryptData({
            password: token,
            payload: email,
            separator: '-',
        });

        const invite = await Invites.findOne({
            inviteToken: encryptToken,
        });

        if (!invite) {
            result.error = true;
            result.code = 404;
            result.message = 'No invite found by the provided token and email';
            return result;
        }

        if (
            invite.inviteStatus === InvitationStatus.ACCEPTED ||
            invite.inviteStatus === InvitationStatus.REVOKED
        ) {
            result.error = true;
            result.code = 400;
            result.message =
                'Blocked state. Cannot resend accepted or revoked invitation';
            return result;
        }

        // Check expiration before resending
        const today = new Date();
        if (invite.expiresAt && today > invite.expiresAt) {
            // Mark as expired if not already marked
            if (
                invite.inviteStatus !== InvitationStatus.EXPIRED &&
                this.validateStatusTransition(
                    invite.inviteStatus,
                    InvitationStatus.EXPIRED,
                )
            ) {
                invite.inviteStatus = InvitationStatus.EXPIRED;
                await invite.save();
            }
            // Can still resend but will create new expiration
        }

        const newToken = await this.generateInviteToken();

        // encrypt token
        const encryptNewToken = await systemService.encryptData({
            password: newToken,
            payload: email,
            separator: '-',
        });

        // update invite state
        invite.inviteToken = encryptNewToken;
        invite.expiresAt = new Date(
            Date.now() + this.DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
        );
        invite.inviteStatus = InvitationStatus.PENDING;

        await invite.save();

        result.message = 'Invite resent successfully';
        result.data = {
            newToken,
            invitationId: invite._id.toString(),
            status: invite.inviteStatus,
            expiresAt: invite.expiresAt,
        };
        return result;
    }

    /**
     * @name declineInvite
     * @description Declines an invitation.
     * @param dto - An object containing the email and token of the invitation to decline.
     * @returns Promise<IResult>
     */
    public async declineInvite(dto: InviteTokenDTO): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const dtoValidationResult = await this.validateDTO(dto);

        if (dtoValidationResult.error) {
            return dtoValidationResult;
        }

        const { email, token } = dto;

        const encryptToken = await systemService.encryptData({
            password: token,
            payload: email,
            separator: '-',
        });

        const invite = await Invites.findOne({
            inviteToken: encryptToken,
            inviteStatus: InvitationStatus.PENDING,
        });

        if (!invite) {
            result.error = true;
            result.code = 404;
            result.message =
                'No Pending invite found by the provided token and email';
            return result;
        }

        // Validate status transition
        if (
            !this.validateStatusTransition(
                invite.inviteStatus,
                InvitationStatus.DECLINED,
            )
        ) {
            result.error = true;
            result.code = 400;
            result.message = `Invalid status transition from ${invite.inviteStatus} to ${InvitationStatus.DECLINED}`;
            return result;
        }

        invite.inviteStatus = InvitationStatus.DECLINED;
        invite.declinedAt = new Date();
        await invite.save();

        result.message = 'Invitation declined successfully';
        result.data = {
            invitationId: invite._id.toString(),
            status: invite.inviteStatus,
            declinedAt: invite.declinedAt,
        };
        return result;
    }

    /**
     * @name bulkInvitation
     * @description Creates multiple invitations at once.
     * @param dto - Data required to create bulk invitations.
     * @returns Promise<IResult>
     */
    public async bulkInvitation(
        dto: CreateBulkInvitationDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const {
            invitedBy,
            inviteeEmails,
            inviteeUserIds,
            inviteType,
            resourceId,
            expiresAt,
            metadata,
        } = dto;

        // Validate required fields
        if (
            !invitedBy ||
            !inviteeEmails ||
            !Array.isArray(inviteeEmails) ||
            inviteeEmails.length === 0
        ) {
            result.error = true;
            result.code = 400;
            result.message = 'invitedBy and inviteeEmails array are required';
            return result;
        }

        // Validate email format for all emails
        for (const email of inviteeEmails) {
            if (!this.validateEmailFormat(email)) {
                result.error = true;
                result.code = 400;
                result.message = `Invalid email format: ${email}`;
                return result;
            }
        }

        // Validate ObjectId formats
        if (!this.validateObjectId(invitedBy)) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid invitedBy format (must be valid ObjectId)';
            return result;
        }

        if (!this.validateObjectId(resourceId)) {
            result.error = true;
            result.code = 400;
            result.message =
                'Invalid resourceId format (must be valid ObjectId)';
            return result;
        }

        if (!Object.values(InvitationType).includes(inviteType)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invitation type must be part of enum!';
            return result;
        }

        // Validate inviteeUserIds if provided
        if (inviteeUserIds && inviteeUserIds.length > 0) {
            if (inviteeUserIds.length !== inviteeEmails.length) {
                result.error = true;
                result.code = 400;
                result.message =
                    'inviteeUserIds array length must match inviteeEmails array length';
                return result;
            }

            for (const userId of inviteeUserIds) {
                if (userId && !this.validateObjectId(userId)) {
                    result.error = true;
                    result.code = 400;
                    result.message = `Invalid inviteeUserId format: ${userId}`;
                    return result;
                }
            }
        }

        const expirationDate =
            expiresAt ||
            new Date(
                Date.now() + this.DEFAULT_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
            );
        const tokens: string[] = [];
        const errors: string[] = [];

        // Create invitations
        for (let i = 0; i < inviteeEmails.length; i++) {
            const inviteeEmail = inviteeEmails[i]?.toLowerCase();
            const inviteeUserId =
                Array.isArray(inviteeUserIds) && inviteeUserIds?.[i]
                    ? inviteeUserIds[i]
                    : undefined;

            try {
                // Check if already invited
                const existingInvite = await Invites.findOne({
                    inviteeEmail,
                    resourceId,
                });

                if (existingInvite) {
                    errors.push(
                        `User ${inviteeEmail} already invited with status: ${existingInvite.inviteStatus}`,
                    );
                    continue;
                }

                const token = await this.generateInviteToken();

                // encrypt token
                const encryptToken = await systemService.encryptData({
                    password: token,
                    payload: inviteeEmail,
                    separator: '-',
                });

                const saveInvite = await invitationRepository.createInvite({
                    inviteType,
                    invitedBy,
                    inviteeEmail: inviteeEmail as string, // ensure inviteeEmail is string
                    inviteeUserId: inviteeUserId as string | undefined, // ensure inviteeUserId is string or undefined
                    resourceId,
                    expiresAt: expirationDate,
                    inviteStatus: InvitationStatus.PENDING,
                    inviteToken: encryptToken,
                    metadata: metadata || {},
                });

                if (saveInvite.error) {
                    errors.push(
                        `Failed to create invitation for ${inviteeEmail}: ${saveInvite.message}`,
                    );
                } else {
                    tokens.push(token);
                }
            } catch (error: any) {
                errors.push(
                    `Error creating invitation for ${inviteeEmail}: ${error.message}`,
                );
            }
        }

        result.message = `Bulk invitation processed. ${tokens.length} created, ${errors.length} failed`;
        result.data = {
            created: tokens.length,
            failed: errors.length,
            tokens,
            errors: errors.length > 0 ? errors : undefined,
        };

        if (tokens.length === 0) {
            result.error = true;
            result.code = 500;
        }

        return result;
    }

    /**
     * @name getInvitationsByResource
     * @description Gets invitations by resource ID and optional status.
     * @param resourceId - Resource ID
     * @param status - Optional invitation status filter
     * @returns Promise<IResult>
     */
    public async getInvitationsByResource(
        resourceId: string,
        status?: InvitationStatus,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!this.validateObjectId(resourceId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid resourceId format';
            return result;
        }

        const query: any = { resourceId };
        if (status) {
            query.inviteStatus = status;
        }

        const invitations = await Invites.find(query).sort({ createdAt: -1 });

        result.message = `Found ${invitations.length} invitation(s)`;
        result.data = invitations;
        return result;
    }

    /**
     * @name getInvitationsByInviter
     * @description Gets invitations by inviter ID.
     * @param invitedBy - Inviter user ID
     * @returns Promise<IResult>
     */
    public async getInvitationsByInviter(invitedBy: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!this.validateObjectId(invitedBy)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid invitedBy format';
            return result;
        }

        const invitations = await Invites.find({ invitedBy }).sort({
            createdAt: -1,
        });

        result.message = `Found ${invitations.length} invitation(s)`;
        result.data = invitations;
        return result;
    }

    /**
     * @name getInvitationsByInvitee
     * @description Gets invitations by invitee email.
     * @param email - Invitee email
     * @returns Promise<IResult>
     */
    public async getInvitationsByInvitee(email: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!this.validateEmailFormat(email)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid email format';
            return result;
        }

        const invitations = await Invites.find({
            inviteeEmail: email.toLowerCase(),
        }).sort({ createdAt: -1 });

        result.message = `Found ${invitations.length} invitation(s)`;
        result.data = invitations;
        return result;
    }

    /**
     * @name getInvitationsByInviteeUserId
     * @description Gets invitations by invitee user ID.
     * @param inviteeUserId - Invitee user ID
     * @returns Promise<IResult>
     */
    public async getInvitationsByInviteeUserId(
        inviteeUserId: string,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!this.validateObjectId(inviteeUserId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid inviteeUserId format';
            return result;
        }

        const invitations = await Invites.find({ inviteeUserId }).sort({
            createdAt: -1,
        });

        result.message = `Found ${invitations.length} invitation(s)`;
        result.data = invitations;
        return result;
    }

    /**
     * @name getInvitationById
     * @description Gets an invitation by ID.
     * @param invitationId - Invitation ID
     * @returns Promise<IResult>
     */
    public async getInvitationById(invitationId: string): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!this.validateObjectId(invitationId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid invitationId format';
            return result;
        }

        const invitation = await Invites.findById(invitationId);

        if (!invitation) {
            result.error = true;
            result.code = 404;
            result.message = 'Invitation not found';
            return result;
        }

        result.message = 'Invitation found';
        result.data = invitation;
        return result;
    }

    /**
     * @name getExpiringInvitations
     * @description Gets pending invitations that are expiring within specified days.
     * @param daysUntilExpiry - Number of days until expiry
     * @returns Promise<IResult>
     */
    public async getExpiringInvitations(
        daysUntilExpiry: number = 1,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const today = new Date();
        const expiryDate = new Date(
            today.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000,
        );

        const invitations = await Invites.find({
            inviteStatus: InvitationStatus.PENDING,
            expiresAt: {
                $gte: today,
                $lte: expiryDate,
            },
        }).sort({ expiresAt: 1 });

        result.message = `Found ${invitations.length} expiring invitation(s)`;
        result.data = invitations;
        return result;
    }

    /**
     * @name cleanupExpiredInvitations
     * @description Deletes expired invitations older than specified days.
     * @param daysOld - Number of days old (default: 30)
     * @returns Promise<IResult>
     */
    public async cleanupExpiredInvitations(
        daysOld: number = 30,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

        const deleteResult = await Invites.deleteMany({
            inviteStatus: InvitationStatus.EXPIRED,
            expiresAt: { $lt: cutoffDate },
        });

        result.message = `Deleted ${deleteResult.deletedCount} expired invitation(s)`;
        result.data = { deletedCount: deleteResult.deletedCount };
        return result;
    }

    /**
     * @name updateInvitationMetadata
     * @description Updates metadata for an invitation.
     * @param invitationId - Invitation ID
     * @param metadata - Metadata to update
     * @returns Promise<IResult>
     */
    public async updateInvitationMetadata(
        invitationId: string,
        metadata: Record<string, unknown>,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        if (!this.validateObjectId(invitationId)) {
            result.error = true;
            result.code = 400;
            result.message = 'Invalid invitationId format';
            return result;
        }

        const invitation = await Invites.findById(invitationId);

        if (!invitation) {
            result.error = true;
            result.code = 404;
            result.message = 'Invitation not found';
            return result;
        }

        invitation.metadata = { ...invitation.metadata, ...metadata };
        await invitation.save();

        result.message = 'Invitation metadata updated successfully';
        result.data = {
            invitationId: invitation._id.toString(),
            metadata: invitation.metadata,
        };
        return result;
    }

    /**
     * @name validateEmailFormat
     * @description Validates email format
     * @param email - Email to validate
     * @returns boolean
     */
    private validateEmailFormat(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

    /**
     * @name validateStatusTransition
     * @description Validates if a status transition is allowed
     * @param currentStatus - Current invitation status
     * @param newStatus - New invitation status
     * @returns boolean
     */
    private validateStatusTransition(
        currentStatus: InvitationStatus,
        newStatus: InvitationStatus,
    ): boolean {
        const validTransitions: Record<InvitationStatus, InvitationStatus[]> = {
            [InvitationStatus.PENDING]: [
                InvitationStatus.ACCEPTED,
                InvitationStatus.REVOKED,
                InvitationStatus.DECLINED,
                InvitationStatus.EXPIRED,
            ],
            [InvitationStatus.ACCEPTED]: [], // Terminal state
            [InvitationStatus.REVOKED]: [], // Terminal state
            [InvitationStatus.DECLINED]: [], // Terminal state
            [InvitationStatus.EXPIRED]: [], // Terminal state
            [InvitationStatus.VALIDATED]: [], // Terminal state
        };

        return validTransitions[currentStatus]?.includes(newStatus) || false;
    }
}

export default new InvitationService();
//$ pnpm swagger-cli bundle "C:\Users\Infinitystudio\pacepard\apps\docs\api-reference\openApi\root.yaml" --outfile
//  "C:\Users\Infinitystudio\pacepard\apps\docs\api-reference\openApi\output.yaml" --type yaml --dereference
