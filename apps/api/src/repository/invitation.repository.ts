import Invites from '@/models/invitation.model';
import { IResult } from '@/interfaces/common.interface';
import type IInvitationDoc from '../interfaces/invitation.interface';
import { CreateInvitationDTO } from '@/dtos/invitation.dto';

class InvitationRepository {
    public async createInvite(
        inviteData: CreateInvitationDTO,
    ): Promise<IResult> {
        let result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };
        const invited = await Invites.create(inviteData);
        if (!invited) {
            result.error = true;
            result.code = 500;
            result.message = "Couldn't save invite";
            return result;
        }

        result.code = 201;
        result.message = 'Invite created';
        result.data = invited;
        return result;
    }

    public async findInvite(token: string): Promise<IInvitationDoc | null> {
        const invite = await Invites.findOne({ inviteToken: token });
        return invite;
    }

    public async findInviteByEmail(
        email: string,
    ): Promise<IInvitationDoc | null> {
        const invite = await Invites.findOne({ inviteeEmail: email });
        return invite;
    }
}

export default new InvitationRepository();
