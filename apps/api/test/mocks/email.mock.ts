/**
 * Mock for email service
 * Prevents actual emails from being sent during tests
 */

import { jest } from '@jest/globals';
import { IResult } from '../../src/utils/interfaces.util';
import { SendEmailDTO, SendOtpDTO } from '../../src/dtos/email.dto';
import { IUserDoc } from '../../src/modules/user/user.interface';

const emailServiceMock = {
    // Used by Bull worker to actually send emails
    sendEmail: jest
        .fn<(config: SendEmailDTO) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Email sent successfully',
            code: 200,
            data: {},
        }),
    // Public methods that queue emails
    sendOTPEmail: jest
        .fn<(config: SendOtpDTO) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Email job queued successfully',
            code: 202,
            data: {},
        }),
    sendUserWelcomeEmail: jest
        .fn<(user: IUserDoc) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Email job queued successfully',
            code: 202,
            data: {},
        }),
    sendPreacherWelcomeEmail: jest
        .fn<(user: IUserDoc) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Email job queued successfully',
            code: 202,
            data: {},
        }),
    sendCreatorWelcomeEmail: jest
        .fn<(user: IUserDoc) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Email job queued successfully',
            code: 202,
            data: {},
        }),
    sendStaffWelcomeEmail: jest
        .fn<(user: IUserDoc) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Email job queued successfully',
            code: 202,
            data: {},
        }),
    sendPasswordChangeNotificationEmail: jest
        .fn<(user: IUserDoc) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Email job queued successfully',
            code: 202,
            data: {},
        }),
    sendPasswordResetNotificationEmail: jest
        .fn<(user: IUserDoc) => Promise<IResult>>()
        .mockResolvedValue({
            error: false,
            message: 'Email job queued successfully',
            code: 202,
            data: {},
        }),
    sendInvitationEmail: jest
        .fn<
            (
                inviteeUser: { email: string; firstName: string },
                inviterName: string,
                invitationUrl: string,
                invitationType?: string,
            ) => Promise<IResult>
        >()
        .mockResolvedValue({
            error: false,
            message: 'Email job queued successfully',
            code: 202,
            data: {},
        }),
};

export default emailServiceMock;
