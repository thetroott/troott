import { IDebitCard } from '../../../utils/interfaces.util';
import type { IUserDoc } from '../../users/user/user.interface';

export interface VerifyCardDTO {
    user: IUserDoc;
    card: IDebitCard;
    reference: string;
}
