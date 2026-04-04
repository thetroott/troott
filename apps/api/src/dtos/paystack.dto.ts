import { IDebitCard, IUserDoc } from "../utils/interfaces.util";

export interface VerifyCardDTO{
    user: IUserDoc
    card: IDebitCard,
    reference: string
}
